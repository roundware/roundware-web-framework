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
  /** Enable EMA-based geo smoothing (default: false) */
  geoSmoothingEnabled?: boolean;
  /** EMA alpha in [0,1], lower = more smoothing (default: 0.15) */
  geoSmoothingAlpha?: number;
  /** Discard updates with accuracy worse than this (meters). Default: 20 */
  geoSmoothingMinAccuracyMeters?: number;
  /** Minimum movement before emitting new point (meters). Default: 0 (disabled) */
  geoSmoothingMinEmitDeltaMeters?: number;
  /** Reset EMA if jump exceeds this (meters). Default: 50 */
  geoSmoothingResetJumpMeters?: number;
  /** Throttle geolocation update handling (ms). Default: 0 (no throttle) */
  geoUpdateThrottleMs?: number;
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
  // probability that each individual speaker slot will rotate to a different available speaker
  // 0.0 = never rotate, 1.0 = always rotate (not recommended)
  speakerRotationProbability?: number;
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

  // new speaker fade-in configuration
  newSpeakerFadeInDurationMs?: number; // default: 2000 (2 seconds)

  // newly submitted speaker priority configuration
  prioritizeNewlySubmitted?: boolean; // default: true - whether to prioritize newly submitted speakers
  newlySubmittedPriorityDurationMs?: number; // default: 30000 (30 seconds) - how long to prioritize newly submitted speakers

  // GPS smoothing configuration
  geoSmoothingEnabled?: boolean; // Enable EMA-based geo smoothing (default: false)
  geoSmoothingAlpha?: number; // EMA alpha in [0,1], lower = more smoothing (default: 0.15)
  geoSmoothingMinAccuracyMeters?: number; // Discard updates with accuracy worse than this (meters). Default: 20
  geoSmoothingMinEmitDeltaMeters?: number; // Minimum movement before emitting new point (meters). Default: 0 (disabled)
  geoSmoothingResetJumpMeters?: number; // Reset EMA if jump exceeds this (meters). Default: 50
  geoUpdateThrottleMs?: number; // Throttle geolocation update handling (ms). Default: 0 (no throttle)
};
