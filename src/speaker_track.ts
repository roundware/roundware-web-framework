import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
// import pointToLineDistance from './vendor/turf/point-to-line-distance';
import pointToLineDistance from "@turf/point-to-line-distance";
import lineToPolygon from "@turf/line-to-polygon";
import { cleanAudioURL, debugLogger } from "./utils";

import { Coord, Feature, LineString, Point, Properties } from "@turf/helpers";
import { MultiPolygon } from "@turf/helpers";
import { Polygon } from "@turf/helpers";
import { ISpeakerData } from "./types/speaker";
import { Howl } from "howler";

const convertLinesToPolygon = (shape: any) => lineToPolygon(shape);
const FADE_DURATION_SECONDS = 3;
const NEARLY_ZERO = 0.001;

/** A Roundware speaker under the control of the client-side mixer, representing 'A polygonal geographic zone within which an ambient audio stream broadcasts continuously to listeners.
 * Speakers can overlap, causing their audio to be mixed together accordingly.  Volume attenuation happens linearly over a specified distance from the edge of the Speaker’s defined zone.'
 * (quoted from https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/Speaker.swift)
 * */
export class SpeakerTrack {
  prefetch: boolean;

  speakerId: string;
  maxVolume: number;
  minVolume: number;
  attenuationDistanceKm: number;
  uri: string;
  listenerPoint: Point;

  attenuationBorderPolygon:
    | Feature<MultiPolygon, { [name: string]: any }>
    | Feature<Polygon, { [name: string]: any }>;
  attenuationBorderLineString: Feature<LineString, { [name: string]: any }>;
  outerBoundary:
    | Feature<MultiPolygon, { [name: string]: any }>
    | Feature<Polygon, { [name: string]: any }>;
  currentVolume: number;
  audio: Howl | undefined;

  constructor({
    listenerPoint,
    prefetchAudio,
    data,
  }: {
    listenerPoint: Feature<Point>;
    prefetchAudio: boolean;
    data: ISpeakerData;
  }) {
    const {
      id: speakerId,
      maxvolume: maxVolume,
      minvolume: minVolume,
      attenuation_border,
      boundary,
      attenuation_distance: attenuationDistance,
      uri,
    } = data;

    this.prefetch = prefetchAudio;

    this.speakerId = speakerId;
    this.maxVolume = maxVolume;
    this.minVolume = minVolume;
    this.attenuationDistanceKm = attenuationDistance / 1000;
    this.uri = uri;

    this.listenerPoint = listenerPoint.geometry;

    this.attenuationBorderPolygon = convertLinesToPolygon(attenuation_border);
    this.attenuationBorderLineString = attenuation_border;

    this.outerBoundary = convertLinesToPolygon(boundary);
    this.currentVolume = NEARLY_ZERO;
  }

  outerBoundaryContains(point: Coord) {
    return booleanPointInPolygon(point, this.outerBoundary.geometry);
  }

  attenuationShapeContains(point: Coord) {
    return booleanPointInPolygon(point, this.attenuationBorderPolygon.geometry);
  }

  attenuationRatio(atPoint: Coord) {
    const distToInnerShapeKm = pointToLineDistance(
      atPoint,
      this.attenuationBorderLineString,
      { units: "kilometers" }
    );
    const ratio = 1 - distToInnerShapeKm / this.attenuationDistanceKm;
    return ratio;
  }

  calculateVolume() {
    const { listenerPoint } = this;

    if (!listenerPoint) {
      return this.currentVolume;
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

  // @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createGain
  buildAudio() {
    if (this.audio) return this.audio;

    const { uri } = this;
    const cleanURL = cleanAudioURL(uri);

    const audio = new Howl({
      src: [cleanURL],
      preload: this.prefetch,
      loop: true,
    });

    this.audio = audio;

    return this.audio;
  }

  updateParams(isPlaying: boolean, opts: { listenerPoint?: Feature<Point> }) {
    if (opts && opts.listenerPoint) {
      this.listenerPoint = opts.listenerPoint.geometry;
    }

    const newVolume = this.updateVolume();
    if (!this.audio) throw new Error(`Audio is undefined! use buildAudio()`);

    if (isPlaying === false || newVolume < 0.05) this.audio.pause();
    else if (isPlaying === true) this.audio.play();
  }

  /**
   *Updates volume to match speaker track configurations using the `fade()` function
   * @memberof SpeakerTrack
   */
  updateVolume() {
    const newVolume = this.calculateVolume();
    this.currentVolume = newVolume;
    this.buildAudio();
    const currentVolume = this.audio?.volume();

    debugLogger(
      `Update Volume: Speaker fading from: ${currentVolume} to ${newVolume}`
    );
    this.audio?.fade(
      this.audio?.volume(),
      newVolume,
      FADE_DURATION_SECONDS * 1000
    );
    return newVolume;
  }

  get logline(): string {
    return `${this} (${this.uri})`;
  }

  play() {
    const newVolume = this.updateVolume();

    if (newVolume < 0.05) return;

    try {
      //console.log('Playing',this.logline);
      if (!this.audio)
        throw new Error(`Audio is undefined! Please use buildAudio()`);
      this.audio.play();
    } catch (err) {
      console.error("Unable to play", this.logline, err);
    }
  }

  pause() {
    if (!this.audio?.playing()) return;
    try {
      if (!this.audio)
        throw new Error(`Audio is undefined! Please use buildAudio()`);
      this.audio?.pause();
    } catch (err) {
      console.error("Unable to pause", this.logline, err);
    }
  }

  toString() {
    const { speakerId } = this;
    return `SpeakerTrack (${speakerId})`;
  }
}
