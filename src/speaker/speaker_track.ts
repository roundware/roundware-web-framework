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
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { EventEmitter } from "../event_emitter";
import { SpeakerUtils } from "./speaker_utils";
const convertLinesToPolygon = (shape: LineString | MultiLineString) =>
  lineToPolygon(shape);
const FADE_DURATION_SECONDS = 3;
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

  groupId: number;

  bufferSourcePlaying = false;



  constructor({
    data,
    audioContext,
    config,
    groupId
  }: {
    data: ISpeakerData;
    audioContext: IAudioContext;
    config: SpeakerConfig;
    groupId: number;
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
    } = data;

    this.config = config;
    this.audioContext = audioContext;
    this.data = data;

    this.maxVolume = maxVolume;
    this.minVolume = minVolume;
    this.attenuationDistanceKm = attenuationDistance / 1000;
    this.uri = uri;

    if (attenuation_border) {
      this.attenuationBorderPolygon = convertLinesToPolygon(attenuation_border);
      this.attenuationBorderLineString = attenuation_border;
    }
    if (boundary) this.outerBoundary = convertLinesToPolygon(boundary);
    this.calculatedVolume = NEARLY_ZERO;

    this.groupId = groupId;

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

      return volumeGradient;
    } else {
      return this.minVolume;
    }
  }

  request: XMLHttpRequest | null = null;
  loadBuffer() {
    if (this.request) {
      return;
    }

    if (this.buffer) {
      return;
    }

    this.request = new XMLHttpRequest();
    this.log("Fetching audio");
    this.request.open("GET", this.uri, true);
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
  }

  unload() {
    if (this.buffer) {
      this.emit("unloaded");
    }
    this.buffer = null;
    this.loadedPercentage = 0;
    this.request?.abort();
    this.request = null;
  }

  startedAtContextTime = 0;

  playForDuration({
    duration,
    times,
    offset,
    fadeInDuration,
    pan,
  }: {
    duration: number;
    offset: number;
    times: number;
    fadeInDuration: number;
    pan: number;
  }) {
    if (!this.buffer) {
      throw new Error("Track is not loaded");
    }

    // Ensure any existing playback is properly cleaned up
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    if (this.bufferSource) {
      this.stopBufferSource();
      this.clearBufferSource();
    }

    let fadeInStartVolume = NEARLY_ZERO;

    if(this.gainNode) {
      this.gainNode.gain.cancelAndHoldAtTime(this.audioContext.currentTime);
      fadeInStartVolume = this.gainNode.gain.value;
    }

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.loop = false;

    const bP = new BufferEffectsProcessor(
      this.buffer,
      this.audioContext,
      this.config?.effects || {}
    ).composeBuffer({
      duration,
      times,
      fadeInDuration,
      fadeInStartVolume,  
    });

    this.bufferSource.buffer = bP.getBuffer();

    if (!this.gainNode) {
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.calculatedVolume;
    }

    // connections:
    this.bufferSource.connect(this.gainNode);
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = pan;
    this.gainNode.connect(panner);
    panner.connect(this.audioContext.destination);

    const bufferSource = this.bufferSource;
    
    this.startBufferSource(this.audioContext.currentTime, offset || 0);

    const startedAtContextTime = this.startedAtContextTime;

    this.bufferSource.onended = () => {
      if (!bufferSource || !bufferSource.buffer) {
        throw new Error("Previously playing source was not cleared before track ended");
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
        this.emit("trackFinished");
      } else {
        this.emit("trackAborted", remainingTime);
      }
    };
    this.emit("playing");
  }

  stopTimeout: NodeJS.Timeout | null = null;

  fadeOutAndStopBufferSource() {
    if (!this.gainNode || !this.bufferSource) {
      return;
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
      console.debug('Stopping from timeout');
      this.stopBufferSource();
    }, FADE_DURATION_SECONDS * 1000);
  }

  startBufferSource(
    when: number,
    offset: number
  ) {
    if (this.bufferSource) {
      this.bufferSource.start(when, offset);
      this.bufferSourcePlaying = true;
      this.startedAtContextTime = when - offset;
    }
  };

  stopBufferSource() {
    if (this.bufferSource) {
      this.bufferSource.stop();
      console.trace('stopBufferSource');
      this.bufferSourcePlaying = false;
    }
  }

  abortBufferSource() {
    if (this.bufferSource) {
      this.stopBufferSource();
    }
  }

  private clearBufferSource() {
    try {
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
      console.error('Error clearing buffer source:', e);
    }
  }

  fadeBufferSourceToVolume(volume: number) {
    if (!this.gainNode) {
      return;
    }

    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    this.gainNode.gain.cancelAndHoldAtTime(this.audioContext.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(
      volume || NEARLY_ZERO,
      this.audioContext.currentTime + FADE_DURATION_SECONDS
    );
  }

  log(string: string) {
    speakerLog(`${this.data.id}] ` + string);
  }

  toString() {
    const {
      data: { id },
    } = this;
    return `SpeakerTrack (${id})`;
  }
}
