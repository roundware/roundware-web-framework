import { Point } from "@turf/helpers";
import { Coord } from "@turf/helpers";
import { Polygon } from "@turf/helpers";
import { MultiPolygon } from "@turf/helpers";
export type Coordinates = {
  longitude: number;
  latitude: number;
};

export interface AssetT {
  weight?: number;
  locationPoint?: Point;
  listenerPoint?: Point;
  tag_ids?: string[];
  timedAssetStart?: number;
  timedAssetEnd?: number;
  playCount?: number;
  shape?: Polygon | MultiPolygon;
  lastListenTime?: number;
  created?: Date;
  start_time?: number;
  end_time?: number;
  file?: string;
  latitude?: number;
  longitude?: number;
  id?: number | string;
  activeRegionLength?: number;
  activeRegionUpperBound?: number;
  activeRegionLowerBound?: number;
}

export type ListenTagIds = unknown;

export type MixParams = {
  ordering?: string;
  listenerPoint?: Point;
};

export type LookupTableT = object;

export type TimedAssetT = {
  asset_id: string | number;
  start?: number;
  end?: number;
};

export type TrackT = {
  mixParams: MixParams;
};

export type AssetPoolType = {};

export interface GeoPositionType extends Coordinates {
  getLastCoords(): Coordinates;
}

export interface PrefetchAudioType {}

export interface IAudioData {
  id: string | number;
}
