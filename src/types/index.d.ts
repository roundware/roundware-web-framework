import { Point } from "@turf/helpers";
import { Coord } from "@turf/helpers";
import { Polygon } from "@turf/helpers";
import { MultiPolygon } from "@turf/helpers";
export type Coordinates = {
  longitude?: number;
  latitude?: number;
};

export interface IAssetData {
  weight?: number;
  locationPoint?: Point;
  listenerPoint?: Point;
  tag_ids?: string[];
  timedAssetStart?: number;
  timedAssetEnd?: number;
  playCount?: number;
  shape?: Polygon | MultiPolygon;
  lastListenTime?: number | Date;
  created?: Date;
  start_time?: number;
  start?: number;
  end_time?: number;
  file?: string;
  latitude?: number;
  volume?: number;
  longitude?: number;
  id?: number | string;
  activeRegionLength?: number;
  activeRegionUpperBound?: number;
  activeRegionLowerBound?: number;
  [index: string]:
    | number
    | string
    | string[]
    | Polygon
    | MultiPolygon
    | Date
    | Point
    | undefined;
}

export type IMixParams = {
  ordering?: string;
  listenerPoint?: Point;
  timedAssetPriority?: IAudioData[`timed_asset_priority`];
  listenerLocation?: Coordinates;
  listenTagIds?: unknown[];
  geoListenMode?: number;
  latitude?: number;
  longitude?: number;
  tagIds?: string[] | number[];
};

export interface IInitialParams {}

export interface IUiConfig {
  speak?: {
    display_items?: {
      id?: string;
    };
  }[];
  listen?: {
    group_short_name?: string;
  };
  [index: string]: any;
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
  timed_asset_priority: any;
  id: string | number;
}

export interface GeoPositionOptions {
  defaultCoords: Coordinates;
  geoListenMode: unknown;
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