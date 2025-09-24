import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { Coord } from "@turf/helpers";
import lineToPolygon from "@turf/line-to-polygon";
// import pointToLineDistance from './vendor/turf/point-to-line-distance';
import pointToLineDistance from "@turf/point-to-line-distance";
import {
  IAudioBuffer,
  IAudioBufferSourceNode,
  IAudioContext,
  IGainNode,
} from "standardized-audio-context";
import { SpeakerConfig } from "../types/roundware";
import { ISpeakerData } from "../types/speaker";
import { speakerLog } from "../utils";

import {
  Feature,
  LineString,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
} from "geojson";
import { EventEmitter } from "../event_emitter";
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { SpeakerUtils } from "./speaker_utils";
const convertLinesToPolygon = (shape: LineString | MultiLineString) =>
  lineToPolygon(shape);
const FADE_DURATION_SECONDS = 4;
const NEARLY_ZERO = 0.05;

/** A Roundware speaker under the control of the client-side mixer, representing 'A polygonal geographic zone within which an ambient audio stream broadcasts continuously to listeners.
 * Speakers can overlap, causing their audio to be mixed together accordingly.  Volume attenuation happens linearly over a specified distance from the edge of the Speaker's defined zone.'
 * (quoted from https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/Speaker.swift)
 * */
export class SpeakerTrack extends EventEmitter<{
  loading: (percentage: number) => void;
  loaded: () => void;
  unloaded: () => void;
  playing: () => void;
  fadingOut: () => void;
  trackFinished: () => void;
  trackAborted: (remainingTime: number) => void;
  startingBufferSource: ({
    when,
    offset,
  }: {
    when: number;
    offset: number;
  }) => void;
}> {
  maxVolume: number;
  minVolume: number;
  attenuationDistanceKm: number;
  uri: string;

  attenuationBorderPolygon?: Feature<MultiPolygon | Polygon>;
  attenuationBorderLineString?: LineString;
  outerBoundary?: Feature<MultiPolygon | Polygon>;

  calculatedVolume: number;

  data: ISpeakerData;
  config: SpeakerConfig;

  loadedPercentage = 0;

  buffer: IAudioBuffer | null = null;
  audioContext: IAudioContext;

  private bufferSource?: IAudioBufferSourceNode<IAudioContext> | null = null;
  private gainNode?: IGainNode<IAudioContext> | null = null;
  private masterMixerNode: IGainNode<IAudioContext> | undefined;
  private masterEffectsSendNode: IGainNode<IAudioContext> | undefined;

  groupId: number;

  bufferSourcePlaying = false;

  loopConfig: {
    pan?: number;
    duration?: number;
    times?: number;
    isReverse?: boolean;
  } = {};

  // Debounce volume updates to prevent rapid gain changes
  private volumeUpdateTimeout: NodeJS.Timeout | null = null;

  // Variant URI tracking
  private variantUris: string[] = [];
  private currentVariantIndex: number = 0;
  private variantLoopCount: number = 0;
  private variantLoopTarget: number = 0;
  private variantBuffers: Map<string, IAudioBuffer> = new Map();
  private currentVariantUri: string = "";
  private variantLoadingPromises: Map<string, Promise<IAudioBuffer>> =
    new Map();

  constructor({
    data,
    audioContext,
    config,
    groupId,
    masterMixerNode,
    masterEffectsSendNode,
  }: {
    data: ISpeakerData;
    audioContext: IAudioContext;
    config: SpeakerConfig;
    groupId: number;
    masterMixerNode?: IGainNode<IAudioContext>;
    masterEffectsSendNode?: IGainNode<IAudioContext>;
  }) {
    super();
    const {
      id: speakerId,
      maxvolume: maxVolume,
      minvolume: minVolume,
      attenuation_border,
      boundary,
      attenuation_distance: attenuationDistance,
      uri,
      varianturis,
    } = data;

    this.config = config;
    this.audioContext = audioContext;
    this.data = data;
    this.masterMixerNode = masterMixerNode;
    this.masterEffectsSendNode = masterEffectsSendNode;

    this.maxVolume = maxVolume;
    this.minVolume = minVolume;
    this.attenuationDistanceKm = attenuationDistance / 1000;
    this.uri = uri;

    if (attenuation_border) {
      try {
        this.attenuationBorderPolygon =
          convertLinesToPolygon(attenuation_border);
        this.attenuationBorderLineString = attenuation_border;
      } catch (e) {
        console.error(
          "Error converting attenuation border to polygon:",
          e,
          data
        );
      }
    }
    try {
      if (boundary) this.outerBoundary = convertLinesToPolygon(boundary);
    } catch (e) {
      console.error("Error converting outer boundary to polygon:", e, data);
    }

    this.calculatedVolume = NEARLY_ZERO;

    this.groupId = groupId;

    // Initialize variant tracking
    this.initializeVariants(varianturis);
  }

  outerBoundaryContains(point: Coord) {
    return (
      this.outerBoundary && booleanPointInPolygon(point, this.outerBoundary)
    );
  }

  attenuationShapeContains(point: Coord) {
    return (
      this.attenuationBorderPolygon &&
      booleanPointInPolygon(point, this.attenuationBorderPolygon)
    );
  }

  attenuationRatio(atPoint: Coord) {
    if (!this.attenuationBorderLineString) return 0;

    const distToInnerShapeKm = pointToLineDistance(
      atPoint,
      this.attenuationBorderLineString,
      { units: "kilometers" }
    );
    const ratio = 1 - distToInnerShapeKm / this.attenuationDistanceKm;
    return ratio;
  }

  volumeByLocation(listenerPoint: Point) {
    if (!listenerPoint) {
      return this.calculatedVolume;
    } else if (this.attenuationShapeContains(listenerPoint)) {
      return this.maxVolume;
    } else if (this.outerBoundaryContains(listenerPoint)) {
      const range = this.maxVolume - this.minVolume;
      const volumeGradient =
        this.minVolume + range * this.attenuationRatio(listenerPoint);

      // Clamp within [minVolume, maxVolume]
      const clamped = Math.max(
        this.minVolume,
        Math.min(this.maxVolume, volumeGradient)
      );
      return clamped;
    } else {
      return this.minVolume;
    }
  }

  request: XMLHttpRequest | null = null;
  async loadBuffer() {
    if (this.request) {
      return;
    }

    if (this.buffer) {
      return;
    }

    // Load the current URI (either variant or fallback to uri)
    const uriToLoad = this.getCurrentUri();

    this.request = new XMLHttpRequest();
    this.log("Fetching audio");
    this.request.open("GET", uriToLoad, true);
    this.request.timeout = Infinity;
    this.request.responseType = "arraybuffer";
    this.request.onprogress = (ev) => {
      this.loadedPercentage = Number(((ev.loaded / ev.total) * 100).toFixed(2));
      this.emit("loading", this.loadedPercentage);
    };
    const speakerContext = this;
    this.request.onload = function () {
      if (!speakerContext.request) return;
      var audioData = speakerContext.request.response;

      speakerContext.audioContext.decodeAudioData(
        audioData,
        function (buffer) {
          speakerContext.request = null;
          speakerContext.buffer = buffer;

          // @ts-ignore
          global._roundwareTotalAudioBufferSize +=
            buffer.length * buffer.numberOfChannels * 4;

          speakerContext.emit("loaded");
        },

        function (e) {
          speakerContext.log("Error with decoding audio data " + e.message);
        }
      );
    };

    this.request.send();

    // If this speaker has variants, load all of them in the background
    if (this.variantUris.length > 0) {
      this.loadAllVariantBuffers().catch((error) => {
        this.log(`Failed to load some variant buffers: ${error.message}`);
      });
    }
  }

  unload() {
    if (this.buffer) {
      this.emit("unloaded");
    }
    this.buffer = null;
    this.loadedPercentage = 0;
    this.request?.abort();
    this.request = null;

    // Unload variant buffers when speaker becomes "far"
    this.unloadVariantBuffers();
  }

  startedAtContextTime = 0;

  stoppedAtGainValue = NEARLY_ZERO;

  playWithConfig({
    duration,
    times,
    offset,
    fadeInDuration,
    pan,
    isReverse = false,
    isNewSpeaker = false,
  }: {
    duration: number;
    offset: number;
    times: number;
    fadeInDuration: number;
    pan: number;
    isReverse?: boolean;
    isNewSpeaker?: boolean;
  }) {
    this.loopConfig.duration = duration;
    this.loopConfig.times = times;
    this.loopConfig.pan = pan;
    this.loopConfig.isReverse = isReverse;

    // Use variant buffer if available, otherwise fall back to main buffer
    const bufferToUse =
      this.getVariantBuffer(this.currentVariantUri) || this.buffer;

    if (!bufferToUse) {
      throw new Error("Track is not loaded");
    }

    // Ensure any existing playback is properly cleaned up
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    // Clear any pending volume update
    if (this.volumeUpdateTimeout) {
      clearTimeout(this.volumeUpdateTimeout);
      this.volumeUpdateTimeout = null;
    }

    if (this.bufferSource) {
      this.stopBufferSource();
      this.clearBufferSource();
    }

    let fadeInStartVolume = NEARLY_ZERO;

    if (!fadeInDuration) {
      fadeInStartVolume = this.calculatedVolume;
    }

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.loop = false;

    // Use variant crossfade duration for micro-fades if this is a variant switch
    const effectsConfig = { ...this.config?.effects };
    if (this.variantUris.length > 0 && this.currentVariantUri !== this.uri) {
      // This is a variant track, use the variant crossfade duration for micro-fades
      effectsConfig.microFadeInDurationInMs =
        this.config.variantCrossfadeDurationMs ?? 1000;
    }

    const bP = new BufferEffectsProcessor(
      bufferToUse,
      this.audioContext,
      effectsConfig
    ).composeBuffer({
      duration,
      times,
      fadeInDuration,
      fadeInStartVolume,
      isReverse,
    });

    const finalBuffer = bP.getBuffer();
    this.bufferSource.buffer = finalBuffer;

    // Debug logging to investigate half-speed issue
    if (typeof window !== "undefined" && (window as any).DEBUG_LOOP_SYNC) {
      console.log(
        `[SYNC_DEBUG] BUFFER_INFO: Speaker ${
          this.data.id
        } - requestedDuration=${duration.toFixed(
          3
        )}s, times=${times}, finalBufferDuration=${finalBuffer.duration.toFixed(
          3
        )}s, originalBufferDuration=${(this.buffer?.duration || 0).toFixed(3)}s`
      );
    }

    if (!this.gainNode) {
      this.gainNode = this.audioContext.createGain();
    }

    const MIN_AUDIBLE = 0.05;
    const initial = Number.isFinite(this.calculatedVolume)
      ? Math.max(MIN_AUDIBLE, this.calculatedVolume)
      : MIN_AUDIBLE;

    // For new speakers, always start at NEARLY_ZERO to enable fade-in
    // For existing speakers, start at calculated volume
    this.gainNode.gain.value = isNewSpeaker ? NEARLY_ZERO : initial;

    // connections:
    this.bufferSource.connect(this.gainNode);
    // TEMP: bypass panning to test if StereoPannerNode churn contributes to dropouts
    const BYPASS_PANNER_FOR_TEST = false;
    const dryDestination =
      this.masterMixerNode || this.audioContext.destination;
    const effectsDestination = this.masterEffectsSendNode;

    if (BYPASS_PANNER_FOR_TEST) {
      this.gainNode.connect(dryDestination);
      if (effectsDestination) {
        this.gainNode.connect(effectsDestination);
      }
    } else {
      const panner = this.audioContext.createStereoPanner();
      panner.pan.value = pan;
      this.gainNode.connect(panner);
      panner.connect(dryDestination);
      if (effectsDestination) {
        panner.connect(effectsDestination);
      }
    }

    const bufferSource = this.bufferSource;

    this.startBufferSource(this.audioContext.currentTime, offset || 0);

    // Apply new speaker fade-in if this is a new speaker
    if (isNewSpeaker) {
      console.debug(
        `Speaker ${this.data.id} starting as new speaker (audio context state: ${this.audioContext.state})`
      );
      this.fadeInNewSpeaker();
    }

    const startedAtContextTime = this.startedAtContextTime;

    this.bufferSource.onended = () => {
      if (!bufferSource || !bufferSource.buffer) {
        throw new Error(
          "Previously playing source was not cleared before track ended"
        );
      }

      this.bufferSourcePlaying = false;
      const remainingTime = SpeakerUtils.findRemainingTime(
        this.audioContext.currentTime,
        startedAtContextTime,
        bufferSource.buffer.duration
      );
      this.clearBufferSource();
      if (
        remainingTime <= NEARLY_ZERO ||
        Math.abs(bufferSource.buffer.duration - remainingTime) <= NEARLY_ZERO
      ) {
        if (typeof window !== "undefined" && (window as any).DEBUG_LOOP_SYNC) {
          console.log(
            `[SYNC_DEBUG] TRACK_FINISHED: Speaker ${
              this.data.id
            } finished at ${this.audioContext.currentTime.toFixed(
              6
            )}s, started at ${this.startedAtContextTime.toFixed(
              6
            )}s, duration: ${bufferSource.buffer.duration.toFixed(6)}s`
          );
        }
        this.emit("trackFinished");
      } else {
        if (typeof window !== "undefined" && (window as any).DEBUG_LOOP_SYNC) {
          console.log(
            `[SYNC_DEBUG] TRACK_ABORTED: Speaker ${
              this.data.id
            } aborted at ${this.audioContext.currentTime.toFixed(
              6
            )}s, remaining: ${remainingTime.toFixed(6)}s`
          );
        }
        this.emit("trackAborted", remainingTime);
      }
    };
    this.emit("playing");
  }

  stopTimeout: NodeJS.Timeout | null = null;

  fadeOutAndStopBufferSource() {
    if (!this.gainNode || !this.bufferSource) {
      throw new Error("Buffer source or gain node not found");
    }

    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    this.emit("fadingOut");
    this.gainNode.gain.cancelAndHoldAtTime(this.audioContext.currentTime);

    this.gainNode.gain.exponentialRampToValueAtTime(
      NEARLY_ZERO,
      this.audioContext.currentTime + FADE_DURATION_SECONDS
    );

    this.stopTimeout = setTimeout(() => {
      console.debug("Stopping from timeout");
      this.stopBufferSource();
    }, FADE_DURATION_SECONDS * 1000);
  }

  /**
   * Start a graceful fade-in for a new speaker
   * This applies a gain-node level fade-in over the specified duration
   */
  fadeInNewSpeaker() {
    if (!this.gainNode) {
      throw new Error("Gain node not found");
    }

    // Check audio context state before attempting fade-in
    if (this.audioContext.state === "suspended") {
      console.warn(
        `Speaker ${this.data.id} fade-in aborted: Audio context is suspended`
      );
      return;
    }

    // Get fade-in duration from config, default to 2 seconds
    const fadeInDurationMs = this.config?.newSpeakerFadeInDurationMs ?? 2000;
    const fadeInDurationSeconds = fadeInDurationMs / 1000;

    // Calculate target volume
    const MIN_AUDIBLE = 0.05;
    const targetVolume = Number.isFinite(this.calculatedVolume)
      ? Math.max(MIN_AUDIBLE, this.calculatedVolume)
      : MIN_AUDIBLE;

    // Fade in from current volume (NEARLY_ZERO) to target volume
    // Mobile-safe: avoid cancelAndHoldAtTime; explicitly set starting value and schedule a linear ramp with a tiny epsilon
    const now = this.audioContext.currentTime;
    const EPSILON_S = 0.02; // 20ms scheduling guard
    this.gainNode.gain.setValueAtTime(NEARLY_ZERO, now);
    this.gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      now + fadeInDurationSeconds + EPSILON_S
    );

    console.debug(
      `Speaker ${
        this.data.id
      } fading in from ${NEARLY_ZERO} to ${targetVolume.toFixed(
        3
      )} over ${fadeInDurationSeconds}s (audio context state: ${
        this.audioContext.state
      })`
    );
  }

  startBufferSource(when: number, offset: number) {
    if (this.bufferSource) {
      this.bufferSource.start(when, offset);
      this.bufferSourcePlaying = true;
      this.startedAtContextTime = when - offset;

      if (typeof window !== "undefined" && (window as any).DEBUG_LOOP_SYNC) {
        console.log(
          `[SYNC_DEBUG] TRACK_START: Speaker ${
            this.data.id
          } starting at ${when.toFixed(6)}s with offset ${offset.toFixed(
            6
          )}s, startedAtContextTime: ${this.startedAtContextTime.toFixed(
            6
          )}s, variant: ${this.getCurrentUri()}`
        );
      }

      this.emit("startingBufferSource", {
        when,
        offset,
      });
    }
  }

  stopBufferSource() {
    if (this.bufferSource) {
      this.bufferSource.stop();
      console.trace("stopBufferSource");
      this.bufferSourcePlaying = false;
    }
  }

  abortBufferSource() {
    if (this.bufferSource) {
      this.stopBufferSource();
    }
    this.clearBufferSource();
  }

  private clearBufferSource() {
    try {
      // Clear volume update timeout
      if (this.volumeUpdateTimeout) {
        clearTimeout(this.volumeUpdateTimeout);
        this.volumeUpdateTimeout = null;
      }

      if (this.bufferSource) {
        this.bufferSource.onended = null;
        this.bufferSource.disconnect();
        delete this.bufferSource;
        this.bufferSource = null;
        this.bufferSourcePlaying = false;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        delete this.gainNode;
        this.gainNode = null;
      }
      this.bufferSourcePlaying = false;
    } catch (e) {
      console.error("Error clearing buffer source:", e);
    }
  }

  fadeBufferSourceToVolume(volume: number) {
    if (!this.gainNode) {
      return;
    }

    // Clear any pending volume update
    if (this.volumeUpdateTimeout) {
      clearTimeout(this.volumeUpdateTimeout);
      this.volumeUpdateTimeout = null;
    }

    // Debounce volume updates to prevent rapid gain changes that cause stuttering
    this.volumeUpdateTimeout = setTimeout(() => {
      if (!this.gainNode) {
        return;
      }

      if (this.stopTimeout) {
        clearTimeout(this.stopTimeout);
        this.stopTimeout = null;
      }

      // Only cancel and hold if we're not already in a transition
      const currentGain = this.gainNode.gain.value;
      const targetGain = Math.max(
        0.05, // MIN_AUDIBLE
        Math.min(1, Number.isFinite(volume) ? volume : 0)
      );

      // Only update if the change is significant (prevents micro-adjustments)
      if (Math.abs(currentGain - targetGain) > 0.01) {
        this.gainNode.gain.cancelAndHoldAtTime(this.audioContext.currentTime);
        const RAMP_SECONDS_TEST = 0.6; // shorter ramp to reduce long dips
        this.gainNode.gain.exponentialRampToValueAtTime(
          targetGain,
          this.audioContext.currentTime + RAMP_SECONDS_TEST
        );
      }

      this.volumeUpdateTimeout = null;
    }, 50); // 50ms debounce
  }

  log(string: string) {
    speakerLog(`${this.data.id}] ` + string);
  }

  // Variant URI methods
  private initializeVariants(varianturis?: string[]) {
    if (varianturis && varianturis.length > 0) {
      this.variantUris = [...varianturis];
      this.shuffleVariantArray();
      this.currentVariantIndex = 0;
      this.currentVariantUri = this.variantUris[0];
      this.setVariantLoopTarget();
    } else {
      this.currentVariantUri = this.uri;
    }
  }

  private shuffleVariantArray() {
    for (let i = this.variantUris.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.variantUris[i], this.variantUris[j]] = [
        this.variantUris[j],
        this.variantUris[i],
      ];
    }
  }

  private setVariantLoopTarget() {
    const minLoops = this.config.minVariantLoops ?? 2;
    const maxLoops = this.config.maxVariantLoops ?? 4;
    this.variantLoopTarget =
      Math.floor(Math.random() * (maxLoops - minLoops + 1)) + minLoops;
  }

  public getCurrentUri(): string {
    return this.currentVariantUri;
  }

  public getVariantLoopCount(): number {
    return this.variantLoopCount;
  }

  public getVariantLoopTarget(): number {
    return this.variantLoopTarget;
  }

  public shouldSwitchVariant(): boolean {
    if (this.variantUris.length <= 1) return false;
    return this.variantLoopCount >= this.variantLoopTarget;
  }

  public selectNextVariant(): string {
    if (this.variantUris.length <= 1) return this.currentVariantUri;

    this.variantLoopCount = 0;
    this.currentVariantIndex =
      (this.currentVariantIndex + 1) % this.variantUris.length;

    // If we've completed a full cycle, reshuffle
    if (this.currentVariantIndex === 0) {
      this.shuffleVariantArray();
    }

    this.currentVariantUri = this.variantUris[this.currentVariantIndex];
    this.setVariantLoopTarget();

    return this.currentVariantUri;
  }

  public incrementVariantLoopCount() {
    this.variantLoopCount++;
  }

  public async loadAllVariantBuffers(): Promise<void> {
    if (this.variantUris.length === 0) return;

    const loadPromises = this.variantUris.map((uri) =>
      this.loadVariantBuffer(uri)
    );
    await Promise.all(loadPromises);
  }

  private async loadVariantBuffer(uri: string): Promise<IAudioBuffer> {
    if (this.variantBuffers.has(uri)) {
      return this.variantBuffers.get(uri)!;
    }

    if (this.variantLoadingPromises.has(uri)) {
      return this.variantLoadingPromises.get(uri)!;
    }

    const loadPromise = this.loadAudioBuffer(uri);
    this.variantLoadingPromises.set(uri, loadPromise);

    try {
      const buffer = await loadPromise;
      this.variantBuffers.set(uri, buffer);
      this.variantLoadingPromises.delete(uri);
      return buffer;
    } catch (error) {
      this.variantLoadingPromises.delete(uri);
      // Remove failed URI from rotation
      const index = this.variantUris.indexOf(uri);
      if (index > -1) {
        this.variantUris.splice(index, 1);
        // Adjust current index if necessary
        if (this.currentVariantIndex >= this.variantUris.length) {
          this.currentVariantIndex = 0;
        }
      }
      throw error;
    }
  }

  private async loadAudioBuffer(uri: string): Promise<IAudioBuffer> {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("GET", uri, true);
      request.timeout = Infinity;
      request.responseType = "arraybuffer";

      request.onload = () => {
        const audioData = request.response;
        this.audioContext.decodeAudioData(
          audioData,
          (buffer) => resolve(buffer),
          (error) => reject(error)
        );
      };

      request.onerror = () =>
        reject(new Error(`Failed to load audio from ${uri}`));
      request.send();
    });
  }

  public unloadVariantBuffers() {
    this.variantBuffers.clear();
    this.variantLoadingPromises.clear();
  }

  public getVariantBuffer(uri: string): IAudioBuffer | null {
    return this.variantBuffers.get(uri) || null;
  }

  // Public methods for variant preprocessing
  public getVariantUris(): string[] {
    return this.variantUris;
  }

  public getGainNode(): IGainNode<IAudioContext> | null {
    return this.gainNode || null;
  }

  public getBufferSource(): IAudioBufferSourceNode<IAudioContext> | null {
    return this.bufferSource || null;
  }

  public setBufferSource(
    bufferSource: IAudioBufferSourceNode<IAudioContext> | null
  ) {
    this.bufferSource = bufferSource;
  }

  public clearBufferSourcePublic() {
    this.clearBufferSource();
  }

  toString() {
    const {
      data: { id },
    } = this;
    return `SpeakerTrack (${id})`;
  }
}
