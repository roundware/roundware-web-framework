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
const convertLinesToPolygon = (shape: LineString | MultiLineString) =>
  lineToPolygon(shape);
const FADE_DURATION_SECONDS = 3;
const NEARLY_ZERO = 0.05;

/** A Roundware speaker under the control of the client-side mixer, representing 'A polygonal geographic zone within which an ambient audio stream broadcasts continuously to listeners.
 * Speakers can overlap, causing their audio to be mixed together accordingly.  Volume attenuation happens linearly over a specified distance from the edge of the Speaker’s defined zone.'
 * (quoted from https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/Speaker.swift)
 * */
export class SpeakerTrack extends EventEmitter<{
  loading: (percentage: number) => void;
  loaded: () => void;
  unloaded: () => void;
  playing: () => void;
  fadingOut: () => void;
  baseTrackEnded: () => void;
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

  bufferSource: IAudioBufferSourceNode<IAudioContext> | null = null;
  gainNode: IGainNode<IAudioContext> | null = null;

  constructor({
    data,
    audioContext,
    config,
  }: {
    data: ISpeakerData;
    audioContext: IAudioContext;
    config: SpeakerConfig;
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
    this.bufferSource = null;
    this.gainNode = null;
    this.loadedPercentage = 0;
    this.request?.abort();
    this.request = null;
  }

  startedAtContextTime = 0;

  playWithDuration(duraiton?: number, offset?: number) {
    if (!this.buffer) {
      throw new Error("Track is not loaded");
    }

    if (this.bufferSource && !this.stopTimeout) {
      throw new Error("Track is already playing");
    }

    this.stopTimeout && clearTimeout(this.stopTimeout);

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.loop = false;

    this.bufferSource.buffer = new BufferEffectsProcessor(
      this.buffer,
      this.audioContext,
      this.config?.effects || {}
    )
      .trim(0, duraiton ?? this.buffer.duration)
      .microFadeInAndOut()
      .getBuffer();

    if (!this.gainNode) {
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.cancelAndHoldAtTime(this.audioContext.currentTime);
      this.gainNode.gain.value = NEARLY_ZERO;
      this.gainNode.gain.exponentialRampToValueAtTime(
        this.calculatedVolume,
        this.audioContext.currentTime + FADE_DURATION_SECONDS
      );
    }

    this.bufferSource.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.bufferSource.start(this.audioContext.currentTime, offset || 0);
    this.startedAtContextTime = this.audioContext.currentTime;
    this.bufferSource.onended = () => {
      this.stopAndClearBufferSource();
      this.emit("baseTrackEnded");
    };
    this.emit("playing");
    console.trace();
  }

  playAsBaseTrack() {
    this.playWithDuration();
  }



  stopTimeout: NodeJS.Timeout | null = null;

  fadeOutAndStopBufferSource() {
    if (!this.gainNode || !this.bufferSource) {
      return;
    }
    this.emit("fadingOut");
    this.gainNode.gain.cancelAndHoldAtTime(this.audioContext.currentTime);

    this.gainNode.gain.exponentialRampToValueAtTime(
      NEARLY_ZERO,
      this.audioContext.currentTime + FADE_DURATION_SECONDS
    );

    this.stopTimeout = setTimeout(() => {
      this.stopAndClearBufferSource();
    }, FADE_DURATION_SECONDS * 1000);
  }

  stopUrgently() {
    if (this.bufferSource) {
      this.stopAndClearBufferSource();
    }
  }

  stopAndClearBufferSource() {
    try {
      this.bufferSource?.stop();
      this.bufferSource?.disconnect();
      this.gainNode?.disconnect();
      this.bufferSource = null;
      this.gainNode = null;
    } catch (e) {
      console.error(e);
    }
  }

  fadeBufferSourceToVolume(volume: number) {
    if (!this.gainNode) {
      return;
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
