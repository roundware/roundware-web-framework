import { Feature } from "@turf/helpers";
import { Point } from "@turf/helpers";
import { Polygon } from "@turf/helpers";
import { MultiPolygon } from "@turf/helpers";

export interface IAssetData {
  id: number;
  description: string;
  latitude: number;
  longitude: number;
  shape?: Polygon | MultiPolygon | null;
  filename: string;
  file: null | string;
  volume: number;
  submitted: boolean;

  created: string | Date;
  updated: string | Date;
  weight: number;
  start_time: number;
  end_time: number;

  user?: {
    username: string;
    email: string;
  } | null;

  media_type: string;
  audio_length_in_seconds: number;
  tag_ids: number[];

  session_id: number;
  project_id?: number;

  language_id: number;
  envelope_ids: number[];
  description_loc_ids: number[];
  alt_text_loc_ids: number[];
  project?: number;

  [index: string]:
    | number
    | string
    | number[]
    | Polygon
    | Date
    | MultiPolygon
    | {
        username: string;
        email: string;
      }
    | undefined
    | null
    | boolean
    | Point
    | Feature<Point>;
}

export interface IAssetFilters extends Partial<IAssetData> {}
export interface IDecoratedAsset extends IAssetData {
  activeRegionLowerBound: number;
  timedAssetStart?: number;
  timedAssetEnd?: number;
  locationPoint: Feature<Point>;
  listenerPoint?: Point;
  playCount: number;
  lastListenTime?: number | Date;

  [index: string]:
    | number
    | Feature<Point>
    | Point
    | Date
    | string
    | undefined
    | number[]
    | null
    | Polygon
    | MultiPolygon
    | boolean
    | {
        username: string;
        email: string;
      };
}
