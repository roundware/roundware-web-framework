import { LineString, MultiLineString, MultiPolygon } from "geojson";
import { IAudioContext } from "standardized-audio-context";
import { SpeakerConfig } from "./roundware";

export interface ISpeakerData {
  id: number;
  max_volume: number;
  min_volume: number;
  uri: string;
  backup_uri?: string;
  variant_uris?: string[];
  attenuation_distance: number;
  shape?: MultiPolygon;
  boundary?: MultiLineString;
  attenuation_border?: LineString;
  parents?: number[];
  children?: number[];
  is_active?: boolean;
  code?: string;
  created_at?: string;
  updated_at?: string;
  fill_color?: string;
  border_color?: string;
  project_id?: number;

  /** @deprecated v2 field name — use max_volume */
  maxvolume?: number;
  /** @deprecated v2 field name — use min_volume */
  minvolume?: number;
  /** @deprecated v2 field name — use backup_uri */
  backupuri?: string;
  /** @deprecated v2 field name — use variant_uris */
  varianturis?: string[];
  /** @deprecated v2 field name — use is_active */
  activeyn?: boolean;
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
