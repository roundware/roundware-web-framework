import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import {
  Coord,
  Feature,
  LineString,
  MultiPolygon,
  Point,
  Polygon,
} from "@turf/helpers";
import lineToPolygon from "@turf/line-to-polygon";
// import pointToLineDistance from './vendor/turf/point-to-line-distance';
import pointToLineDistance from "@turf/point-to-line-distance";
import { SpeakerPlayer } from "./speaker_player";
import { ISpeakerData } from "./types/speaker";
import { speakerLog } from "./utils";

const convertLinesToPolygon = (shape: any): Polygon | MultiPolygon =>
  // @ts-ignore
  lineToPolygon(shape);
const FADE_DURATION_SECONDS = 3;
const NEARLY_ZERO = 0.05;

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

  speakerData: ISpeakerData;

  soundId: number | undefined;
  player: SpeakerPlayer;

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

    this.player = new SpeakerPlayer(uri);
    this.listenerPoint = listenerPoint.geometry;

    this.attenuationBorderPolygon = convertLinesToPolygon(attenuation_border);
    this.attenuationBorderLineString = attenuation_border;

    this.outerBoundary = convertLinesToPolygon(boundary);
    this.currentVolume = NEARLY_ZERO;
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

    // don't exceed values over 1.0
    if (newVolume > 1) newVolume = 1;
    return newVolume;
  }

  updateParams(isPlaying: boolean, opts: { listenerPoint?: Feature<Point> }) {
    if (opts && opts.listenerPoint && opts.listenerPoint.geometry) {
      this.listenerPoint = opts.listenerPoint.geometry;
    }

    const newVolume = this.calculateVolume();

    if (isPlaying === false) this.player.pause();
    if (newVolume < 0.05 && this.player.playing) {
      // allow to fade before pausing
      this.player.fadeOutAndPause();
    } else if (isPlaying === true && newVolume > 0.05) {
      this.play();
    } else this.pause();
  }

  /**
   * Updates / (Schedules a update to if not playing) volume to match speaker track configurations using the `fade()` function
   * @memberof SpeakerTrack
   */
  updateVolume() {
    const newVolume = this.calculateVolume();
    if (newVolume < 0.05) this.player.fadeOutAndPause();
    else this.player.fade(newVolume);
    this.currentVolume = newVolume;
    return newVolume;
  }

  get logline(): string {
    return `${this} (${this.uri})`;
  }

  play() {
    const newVolume = this.calculateVolume();
    if (newVolume < 0.05) return; // no need to play

    try {
      this.player.play();
      this.updateVolume();
      speakerLog(`${this.speakerId}: Playing!`);
    } catch (err) {
      console.error("Unable to play", this.logline, err);
    }
  }

  pause() {
    try {
      if (this.player.playing) {
        this.player?.pause();
        speakerLog(`${this.speakerId}: Paused!`);
      }
    } catch (err) {
      console.error("Unable to pause", this.logline, err);
    }
  }

  toString() {
    const { speakerId } = this;
    return `SpeakerTrack (${speakerId})`;
  }
}
