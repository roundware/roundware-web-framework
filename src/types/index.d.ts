import { Feature, Point } from "@turf/helpers";
import { TrackOptions } from "../mixer/TrackOptions";
import { PlaylistAudiotrack } from "../playlistAudioTrack";
import { IRoundwareConstructorOptions } from "./roundware";
export type Coordinates = {
  longitude?: number;
  latitude?: number;
};
/*
 * DISABLED: 0,
 * MANUAL: 1,
 * AUTOMATIC: 2,
 */
export type GeoListenModeType = 0 | 1 | 2;

export type IMixParams = {
  ordering?: "by_likes" | "by_weight" | "random";
  listenerPoint?: Feature<Point>;
  timedAssetPriority?: IAudioData[`timed_asset_priority`];
  listenerLocation?: Coordinates;
  listenTagIds?: number[];
  geoListenMode?: GeoListenModeType;
  latitude?: number;
  longitude?: number;
  tagIds?: string[] | number[];
  recordingRadius?: number;
  getListenMode?: number;
  minDist?: number;
  maxDist?: number;
  startDate?: Date;
  endDate?: Date;
  sessionId?: number;
  keepPausedAssets?: boolean;
  bannedDuration?: number;
} & Partial<IRoundwareConstructorOptions> &
  Partial<TrackOptions>;

export interface IInitialParams {}

export interface ITag {
  default_state: boolean;
  id: number;
  parent_id: null | number;
  tag_display_text: string;
  tag_id: number;
}

export interface ITagGroup {
  display_items: ITag[];
  group_short_name?: string;
  header_display_text?: string;
  selection_method?: "user" | "random_single" | "random_double";
}
export interface IUiConfig {
  speak?: ITagGroup[];
  listen?: ITagGroup[];
  [index: string]: ITagGroup[] | undefined;
}

export type ILookupTable = object;

export type ITimedAssetData = {
  asset_id: string | number;
  start?: number;
  end?: number;
};

export type AssetPoolType = {};

export interface IGeoPosition extends Coordinates {
  getLastCoords(): Coordinates;
}

export interface PrefetchAudioType {}

export interface IAudioData extends Blob {
  timed_asset_priority?: any;
  id?: string | number;
}

export interface GeoPositionOptions {
  defaultCoords: Coordinates;
  geoListenMode: GeoListenModeType;
}

export interface IGeoPosition {
  geolocation: Geolocation;
  isEnabled: boolean;
  updateCallback: CallableFunction;
  disable(): void;
  toString(): string;
  getLastCoords(): Coordinates;
  connect(geoUpdateCallback: CallableFunction): void;
  enable(): void;
  waitForInitialGeolocation(): Promise<Coordinates>;
}

export interface ISession {
  connect(): Promise<number | string>;
  sessionId: number | undefined;
}

export type ITrackIdMap = {
  [trackId in string | number]: PlaylistAudiotrack;
};
