import { Point, Feature } from "@turf/helpers";
import { Polygon } from "@turf/helpers";
import { MultiPolygon } from "@turf/helpers";
import { PlaylistAudiotrack } from "../playlistAudioTrack";
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
export interface IAssetData {
  weight?: number;
  locationPoint?: Feature<Point>;
  listenerPoint?: Point;
  tag_ids?: number[];
  timedAssetStart?: number;
  timedAssetEnd?: number;
  playCount?: number;
  shape?: Polygon | MultiPolygon | null;
  lastListenTime?: number | Date;
  created?: string | Date;
  start_time?: number;
  start?: number;
  end_time?: number;
  file?: string;
  latitude?: number;
  volume?: number;
  longitude?: number;
  id?: number;
  activeRegionLength?: number;
  activeRegionUpperBound?: number;
  activeRegionLowerBound?: number;
  user?: {
    username: string;
    email: string;
  } | null;
  description?: string;
  filename?: string;
  submitted?: boolean;
  updated?: string | Date;
  media_type?: string;
  audio_length_in_seconds?: number;
  session_id?: number;
  project_id?: number;
  language_id?: number;
  envelope_ids?: number[];
  description_loc_ids?: number[];
  alt_text_loc_ids?: number[];

  [index: string]:
    | number
    | string
    | number[]
    | Polygon
    | MultiPolygon
    | Date
    | Point
    | Feature<Point>
    | {
        username: string;
        email: string;
      }
    | undefined
    | null
    | boolean;
}

export type IMixParams = {
  ordering?: string;
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
};

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

export type ITrack = {
  mixParams: IMixParams;
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
