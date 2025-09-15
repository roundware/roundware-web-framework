import { LineString, MultiLineString, MultiPolygon } from "geojson";
import { IAudioContext } from "standardized-audio-context";
import { SpeakerConfig } from "./roundware";

export interface ISpeakerData {
  id: number;
  maxvolume: number;
  minvolume: number;
  uri: string;
  backupuri?: string;
  varianturis?: string[];
  attenuation_distance: number;
  shape?: MultiPolygon;
  boundary?: MultiLineString;
  attenuation_border?: LineString;
  parents?: number[];
  children?: number[];
  activeyn?: boolean;
  code?: string;
  created?: string; // or Date
  updated?: string; // or Date
  fill_color?: string;
  border_color?: string;
  project_id?: number;
}

export interface ISpeakerFilters {}

export interface ISpeakerPlayer extends EventTarget {
  isSafeToPlay: boolean;
  playing: boolean;
  audio: HTMLAudioElement;
  loaded: boolean;
  loadedPercentage: number;
  id: number;
  config: SpeakerConfig;
  play(): Promise<boolean>;
  pause(): void;
  replay(): void;
  timerStart(): void;
  timerStop(): void;
  fade(destinationVolume?: number, duration?: number): void;
  fadeOutAndPause(): void;
  cancelFadeOutAndPause(): void;
  log(string: string): void;
  onLoadingProgress(callback: (newPercent: number) => void): void;
  onEnd(callback: () => void): void;
  fetch(): Promise<void>;
  offload(): void;
  isFetching: boolean;
  mode:
    | "prefetch"
    | "prefetch_sync"
    | "progressive_sync"
    | "stream"
    | "stream_sync";
}

export type SpeakerConstructor = {
  audioContext: IAudioContext;
  uri: string;
  id: number;
  config: SpeakerConfig;
};
