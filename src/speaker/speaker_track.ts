import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { Coord } from "@turf/helpers";
import lineToPolygon from "@turf/line-to-polygon";
// import pointToLineDistance from './vendor/turf/point-to-line-distance';
import pointToLineDistance from "@turf/point-to-line-distance";
import { IAudioContext } from "standardized-audio-context";
import { SpeakerStreamer } from "./players/stream";
import { SpeakerPrefetchSyncPlayer } from "./players/prefech_sync";
import { ISpeakerData, ISpeakerPlayer } from "../types/speaker";
import { speakerLog } from "../utils";
import { SpeakerConfig } from "../types/roundware";
import { SpeakerSyncStreamer } from "./players/stream_sync";

import { SpeakerPrefetchPlayer } from "./players/prefetch";
import { SpeakerEngine } from "./speaker_engine";
import {
  LineString,
  MultiLineString,
  Feature,
  MultiPolygon,
  Polygon,
  Point,
} from "geojson";
import { SpeakerProgressiveSyncPlayer } from "./players/progressive_sync";
const convertLinesToPolygon = (shape: LineString | MultiLineString) =>
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

  attenuationBorderPolygon?: Feature<MultiPolygon | Polygon>;
  attenuationBorderLineString?: LineString;
  outerBoundary?: Feature<MultiPolygon | Polygon>;

  calculatedVolume: number;

  speakerData: ISpeakerData;

  soundId: number | undefined;
  player!: ISpeakerPlayer;
  audioContext: IAudioContext;
  config: SpeakerConfig;
  speakerEngine: SpeakerEngine;

  constructor({
    audioContext,
    data,
    config,
    speakerEngine,
  }: {
    audioContext: IAudioContext;
    speakerEngine: SpeakerEngine;
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
    this.speakerEngine = speakerEngine;
    this.audioContext = audioContext;
    this.config = config;
    this.speakerData = data;
    this.speakerId = speakerId;
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

    const Player = (() => {
      if (this.config.mode.startsWith("prefetch-sync"))
        return SpeakerPrefetchSyncPlayer;
      if (this.config.mode.startsWith("stream-sync"))
        return SpeakerSyncStreamer;
      if (this.config.mode.startsWith("prefetch")) return SpeakerPrefetchPlayer;
      if (this.config.mode.startsWith("progressive-sync"))
        return SpeakerProgressiveSyncPlayer;
      return SpeakerStreamer;
    })();

    console.log(`init player ${this.speakerId}: ${Player.name}`);
    this.player = new Player({
      audioContext: this.audioContext,
      id: this.speakerId,
      uri: this.uri,
      config: this.config,
    });

    this.player.audio.addEventListener("playing", () => {
      if (this.player.isSafeToPlay && this.speakerEngine.playing)
        this.updateVolume();
    });
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

  log(string: string) {
    speakerLog(`${this.speakerId}] ` + string);
  }

  /**
   * Updates / (Schedules a update to if not playing) volume to match speaker track configurations using the `fade()` function
   * @memberof SpeakerTrack
   */
  updateVolume() {
    if (this.calculatedVolume < 0.05) this.player.fadeOutAndPause();
    else {
      this.player.play();
      this.player.fade(this.calculatedVolume);
    }

    return this.calculatedVolume;
  }

  get logline(): string {
    return `${this} (${this.uri})`;
  }

  play() {
    if (this.calculatedVolume < 0.05) return; // no need to play

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
