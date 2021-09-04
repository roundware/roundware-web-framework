import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
// import pointToLineDistance from './vendor/turf/point-to-line-distance';
import pointToLineDistance from "@turf/point-to-line-distance";
import lineToPolygon from "@turf/line-to-polygon";
import { cleanAudioURL } from "./utils";

import { Coord, Feature, LineString, Point, Properties } from "@turf/helpers";
import { MultiPolygon } from "@turf/helpers";
import { Polygon } from "@turf/helpers";
import { ISpeakerData } from "./types/speaker";
import { Howl } from "howler";
import { LOGGABLE_HOWL_EVENTS } from "./playlistAudioTrack";

const convertLinesToPolygon = (shape: any): Polygon | MultiPolygon =>
  // @ts-ignore
  lineToPolygon(shape);
const FADE_DURATION_SECONDS = 3;
const NEARLY_ZERO = 0.001;

/** A Roundware speaker under the control of the client-side mixer, representing 'A polygonal geographic zone within which an ambient audio stream broadcasts continuously to listeners.
 * Speakers can overlap, causing their audio to be mixed together accordingly.  Volume attenuation happens linearly over a specified distance from the edge of the Speaker’s defined zone.'
 * (quoted from https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/Speaker.swift)
 * */
export class SpeakerTrack {
  prefetch: boolean;

  speakerId: number;
  maxVolume: number;
  minVolume: number;
  attenuationDistanceKm: number;
  uri: string;
  listenerPoint: Point;

  attenuationBorderPolygon: MultiPolygon | Polygon;
  attenuationBorderLineString: LineString;
  outerBoundary: MultiPolygon | Polygon;
  currentVolume: number;
  audio: Howl | undefined;
  speakerData: ISpeakerData;
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

    this.speakerData = data;
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
    // this.buildAudio();
  }

  outerBoundaryContains(point: Coord) {
    return booleanPointInPolygon(point, this.outerBoundary);
  }

  attenuationShapeContains(point: Coord) {
    return booleanPointInPolygon(point, this.attenuationBorderPolygon);
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

    let newVolume = this.currentVolume;
    if (!listenerPoint) {
      newVolume = this.currentVolume;
    } else if (this.attenuationShapeContains(listenerPoint)) {
      newVolume = this.maxVolume;
    } else if (this.outerBoundaryContains(listenerPoint)) {
      const range = this.maxVolume - this.minVolume;
      const volumeGradient =
        this.minVolume + range * this.attenuationRatio(listenerPoint);

      newVolume = volumeGradient;
    } else {
      newVolume = this.minVolume;
    }

    // howler don't support values greater than 1.0
    if (newVolume > 1) newVolume = 1;
    console.log(`New Volume ${this.speakerId}: ${newVolume}`);
    return newVolume;
  }

  // @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createGain
  buildAudio() {
    if (this.audio instanceof Howl) return this.audio;

    const { uri } = this;
    const cleanURL = cleanAudioURL(uri);

    const audio = new Howl({
      src: [cleanURL],
      preload: true,
      html5: true,
      autoplay: false,
      loop: true,
      mute: false,
      volume: 0, // initially 0 and fade later
    });

    this.audio = audio;

    return this.audio;
  }

  updateParams(isPlaying: boolean, opts: { listenerPoint?: Feature<Point> }) {
    if (opts && opts.listenerPoint && opts.listenerPoint.geometry) {
      this.listenerPoint = opts.listenerPoint.geometry;
    }

    const newVolume = this.calculateVolume();

    if (isPlaying === false) this.pause();
    if (newVolume < 0.05 && this.audio?.playing()) {
      // allow to fade before pausing
      this.audio.fade(this.audio.volume(), 0, FADE_DURATION_SECONDS * 1000);
      this.audio.once("fade", () => this.audio?.pause());
    } else if (isPlaying === true && newVolume > 0.05) {
      this.updateVolume();
      this.play();
    } else this.pause();
  }

  /**
   * Updates / (Schedules a update to if not playing) volume to match speaker track configurations using the `fade()` function
   * @memberof SpeakerTrack
   */
  updateVolume() {
    const newVolume = this.calculateVolume();
    this.currentVolume = newVolume;
    this.buildAudio();
    const currentVolume = this.audio!.volume();

    if (newVolume - currentVolume === 0) return newVolume; // no need to udpate
    if (this.audio!.playing()) {
      this.audio!.fade(currentVolume, newVolume, FADE_DURATION_SECONDS * 1000);
    } else
      this.audio!.once("play", () => {
        this.audio!.fade(
          currentVolume,
          newVolume,
          FADE_DURATION_SECONDS * 1000
        );
      });

    return newVolume;
  }

  get logline(): string {
    return `${this} (${this.uri})`;
  }

  play() {
    try {
      !this.audio?.playing() && this.audio!.play();
    } catch (err) {
      console.error("Unable to play", this.logline, err);
    }
  }

  pause() {
    try {
      if (!this.audio?.playing()) return;
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
