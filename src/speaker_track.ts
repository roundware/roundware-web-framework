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
import { IAudioContext } from "standardized-audio-context";
import { SpeakerStreamer } from "./SpeakerStreamer";
import { SpeakerPrefetchPlayer } from "./SpeakerPrefetchPlayer";
import { ISpeakerData, ISpeakerPlayer } from "./types/speaker";
import { speakerLog } from "./utils";
import { SpeakerConfig } from "./types/roundware";

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
  player: ISpeakerPlayer;

  constructor({
    audioContext,
    listenerPoint,
    data,
    config,
  }: {
    audioContext: IAudioContext;
    listenerPoint: Feature<Point>;

    data: ISpeakerData;
    config: SpeakerConfig;
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

    this.speakerData = data;
    this.speakerId = speakerId;
    this.maxVolume = maxVolume;
    this.minVolume = minVolume;
    this.attenuationDistanceKm = attenuationDistance / 1000;
    this.uri = uri;

    const Player = config.sync ? SpeakerPrefetchPlayer : SpeakerStreamer;
    this.player = new Player({
      audioContext,
      id: this.speakerId,
      uri: this.uri,
      config,
    });
    this.player.audio.addEventListener("playing", () => {
      if (this.player.isSafeToPlay) this.updateVolume();
    });
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

  log(string: string) {
    speakerLog(`${this.speakerId}] ` + string);
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
    if (
      opts &&
      opts.listenerPoint &&
      opts.listenerPoint.geometry &&
      opts.listenerPoint.geometry.coordinates
    ) {
      this.listenerPoint = opts.listenerPoint.geometry;
    }

    if (isPlaying == false) {
      this.player.log(`pausing because mixer is off`);
      this.player.fadeOutAndPause();
      return;
    }

    const newVolume = this.calculateVolume();

    if (newVolume < 0.05) {
      // allow to fade before pausing
      this.player.log(`pausing because new volume is lower than 0.05`);
      this.player.fadeOutAndPause();
    } else {
      this.player.log(`new volume ${newVolume}`);
      this.play();
      this.updateVolume();
    }
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
      this.player.play().then((success) => {
        if (!success) {
          setTimeout(() => {
            this.play();
          }, 2000);
        }
      });
    } catch (err) {
      console.error("Unable to play", this.logline, err);
    }
  }

  pause() {
    try {
      this.player?.pause();
    } catch (err) {
      console.error("Unable to pause", this.logline, err);
    }
  }

  toString() {
    const { speakerId } = this;
    return `SpeakerTrack (${speakerId})`;
  }
}
