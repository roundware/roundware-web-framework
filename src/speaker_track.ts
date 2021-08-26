import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
// import pointToLineDistance from './vendor/turf/point-to-line-distance';
import pointToLineDistance from "@turf/point-to-line-distance";
import lineToPolygon from "@turf/line-to-polygon";
import { cleanAudioURL } from "./utils";
import { IAudioContext, IGainNode } from "standardized-audio-context";
import { Coord, Feature, LineString, Point, Properties } from "@turf/helpers";
import { PrefetchAudioType } from "./types";
import { MultiPolygon } from "@turf/helpers";
import { Polygon } from "@turf/helpers";
import { ISpeakerData } from "./types/speaker";

const convertLinesToPolygon = (shape: any) => lineToPolygon(shape);
const FADE_DURATION_SECONDS = 3;
const NEARLY_ZERO = 0.001;

/** A Roundware speaker under the control of the client-side mixer, representing 'A polygonal geographic zone within which an ambient audio stream broadcasts continuously to listeners.
 * Speakers can overlap, causing their audio to be mixed together accordingly.  Volume attenuation happens linearly over a specified distance from the edge of the Speaker’s defined zone.'
 * (quoted from https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/Speaker.swift)
 * */
export class SpeakerTrack {
  prefetch: PrefetchAudioType;
  audioContext: IAudioContext;
  speakerId: string;
  maxVolume: number;
  minVolume: number;
  attenuationDistanceKm: number;
  uri: string;
  listenerPoint: Point;
  playing: boolean;
  attenuationBorderPolygon:
    | Feature<MultiPolygon, { [name: string]: any }>
    | Feature<Polygon, { [name: string]: any }>;
  attenuationBorderLineString: Feature<LineString, { [name: string]: any }>;
  outerBoundary:
    | Feature<
        MultiPolygon,
        {
          [name: string]: any;
        }
      >
    | Feature<
        Polygon,
        {
          [name: string]: any;
        }
      >;
  currentVolume: number;
  audio: HTMLAudioElement | undefined;
  gainNode: IGainNode<IAudioContext> | undefined;

  constructor({
    audioContext,
    listenerPoint,
    prefetchAudio,
    data,
  }: {
    audioContext: IAudioContext;
    listenerPoint: Feature<Point>;
    prefetchAudio: PrefetchAudioType;
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
    this.audioContext = audioContext;
    this.speakerId = speakerId;
    this.maxVolume = maxVolume;
    this.minVolume = minVolume;
    this.attenuationDistanceKm = attenuationDistance / 1000;
    this.uri = uri;

    this.listenerPoint = listenerPoint.geometry;

    this.playing = false;

    this.attenuationBorderPolygon = convertLinesToPolygon(attenuation_border);
    this.attenuationBorderLineString = attenuation_border;

    this.outerBoundary = convertLinesToPolygon(boundary);
    this.currentVolume = NEARLY_ZERO;
  }

  outerBoundaryContains(point: Coord) {
    // @ts-ignore
    return booleanPointInPolygon(point, this.outerBoundary);
  }

  attenuationShapeContains(point: Coord) {
    // @ts-ignore
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
  async buildAudio() {
    if (this.audio) return this.audio;

    const { audioContext, uri } = this;
    const cleanURL = cleanAudioURL(uri);

    let audio: HTMLAudioElement;
    if (this.prefetch) {
      // Download the speaker audio fully before playing it.
      const response = await fetch(cleanURL);
      const blob = await response.blob();
      audio = new Audio(URL.createObjectURL(blob));
    } else {
      audio = new Audio(cleanURL);
    }
    audio.crossOrigin = "anonymous";
    audio.loop = true;

    const audioSrc = audioContext.createMediaElementSource(audio);
    const gainNode = audioContext.createGain();

    audioSrc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    this.gainNode = gainNode;
    this.audio = audio;
    this.audioContext = audioContext;

    return this.audio;
  }

  async updateParams(
    isPlaying: boolean,
    opts: { listenerPoint: Feature<Point> }
  ) {
    if (opts && opts.listenerPoint) {
      this.listenerPoint = opts.listenerPoint.geometry;
    }

    const newVolume = await this.updateVolume();
    if (!this.audio) throw new Error(`Audio is undefined! use buildAudio()`);
    if (isPlaying != this.playing) {
      if (newVolume < 0.05) {
        this.audio.pause();
      } else {
        await this.audio.play();
      }
    }
  }

  async updateVolume() {
    const newVolume = this.calculateVolume();

    this.currentVolume = newVolume;

    const secondsFromNow =
      this.audioContext.currentTime + FADE_DURATION_SECONDS;

    await this.buildAudio();
    if (this.gainNode)
      this.gainNode.gain.linearRampToValueAtTime(newVolume, secondsFromNow);

    //console.info(`Setting '${this}' volume: ${newVolume.toFixed(2)} over ${FADE_DURATION_SECONDS} seconds`);

    return newVolume;
  }

  get logline(): string {
    return `${this} (${this.uri})`;
  }

  async play() {
    const newVolume = await this.updateVolume();

    if (newVolume < 0.05) return;

    try {
      //console.log('Playing',this.logline);
      if (!this.audio)
        throw new Error(`Audio is undefined! Please use buildAudio()`);
      await this.audio.play();
      console.info("Speaker Audio Started!");
      this.playing = true;
    } catch (err) {
      console.error("Unable to play", this.logline, err);
    }
  }

  pause() {
    try {
      //console.log('Pausing',this.logline);
      if (!this.audio)
        throw new Error(`Audio is undefined! Please use buildAudio()`);
      this.audio?.pause();
      this.playing = false;
    } catch (err) {
      console.error("Unable to pause", this.logline, err);
    }
  }

  toString() {
    const { speakerId } = this;
    return `SpeakerTrack (${speakerId})`;
  }
}
