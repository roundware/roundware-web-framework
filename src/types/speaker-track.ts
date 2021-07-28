import {
  Coord,
  Feature,
  LineString,
  MultiPolygon,
  Point,
  Polygon,
} from "@turf/helpers";
import { IAudioContext, IGainNode } from "standardized-audio-context";
import { PrefetchAudioType } from ".";

export type ISpeakerTrack = {
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
    | Feature<MultiPolygon, { [name: string]: any }>
    | Feature<Polygon, { [name: string]: any }>;
  currentVolume: number;
  audio: any;
  gainNode: IGainNode<IAudioContext> | undefined;
  readonly logline: string;
  outerBoundaryContains(point: Coord): boolean;
  attenuationShapeContains(point: Coord): boolean;
  attenuationRatio(atPoint: Coord): number;
  calculateVolume(): number;
  buildAudio(): {};
  updateParams(
    isPlaying: boolean,
    opts: { listenerPoint: { geometry: Point } }
  ): any;
  updateVolume(): {};
  play(): void;
  pause(): void;
  toString(): string;
};
