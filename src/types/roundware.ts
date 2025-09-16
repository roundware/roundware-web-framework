import { Coordinates, GeoListenModeType } from ".";
import { ApiClient } from "../api-client";
import { Asset } from "../asset";
import { Audiotrack } from "../audiotrack";
import { GeoPosition } from "../geo-position";
import { Project } from "../project";
import { Session } from "../session";
import { Speaker } from "../speaker";
import { TimedAsset } from "../timed_asset";
import { User } from "../user";
import { IAssetFilters } from "./asset";

import { ISpeakerFilters } from "./speaker";

export interface IOptions {
  apiClient?: ApiClient;
  deviceId: string;
  clientType?: string;
  geoListenMode: GeoListenModeType;
}
export interface IRoundwareConstructorOptions extends IOptions {
  serverUrl: string;
  projectId: number;
  speakerFilters?: ISpeakerFilters;
  assetFilters: IAssetFilters;
  listenerLocation: Coordinates;
  user?: User;
  geoPosition?: GeoPosition;
  session?: Session;
  project?: Project;
  speaker?: Speaker;
  asset?: Asset;
  timedAsset?: TimedAsset;
  audiotrack?: Audiotrack;
  assetUpdateInterval?: number;
  keepPausedAssets?: boolean;
  speakerConfig: SpeakerConfig;
}

export type EffectsConfig = {
  microFadeInDurationInMs?: number;
  fadeInDurationInMs?: number;
  delayTimeInMs?: number;
  feedback?: number;
  wetDryRatio?: number; // Wet vs dry ratio (0-1, 0=no reverb, 1=all wet)
  reverbRoomSize?: number; // Room size (0-1)
  reverbDamping?: number; // High frequency damping (0-1)
  pan?: number[];
};

export type SpeakerConfig = {
  /** mode */
  mode:
    | "prefetch-sync"
    | "stream-sync"
    | "prefetch"
    | "stream"
    | "progressive-sync"
    | `progressive-sync-basePlusMax${number}Random`;

  loop?: boolean;
  length?: number;
  acceptableDelayMs?: number;
  syncCheckInterval?: number;
  replaceWithNoneProbability?: number;
  slotConsiderationProbability?: number;
  loopPointUpdateProbability?: number;
  // list of fractions from which app will select randomly one of
  // negative values will play the audio in reverse for the specified fraction
  // e.g., [1/2, 1/1, -1/2, 1/8] - negative values play backwards
  loopFractions?: number[];
  effects?: EffectsConfig;

  // distance before starting the fetch
  prefetchDistanceMeters?: number;

  // variant URI configuration
  minVariantLoops?: number; // default: 2
  maxVariantLoops?: number; // default: 4
  variantCrossfadeDurationMs?: number; // default: 1000

  // always-on speakers - these speakers will always play when available (in range)
  alwaysOnWhenAvailable?: number[]; // array of speaker IDs that should always play when available
};
