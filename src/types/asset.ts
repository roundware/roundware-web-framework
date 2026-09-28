import { Polygon, MultiPolygon, Feature, Point } from "geojson";

export interface IAssetData {
  id: number;
  description: string;
  latitude: number;
  longitude: number;
  shape?: Polygon | MultiPolygon | null;
  file: null | string;
  volume: number;
  submitted: boolean;

  created_at: string | Date;
  updated_at: string | Date;
  weight: number;

  start_time: number;
  end_time: number;

  media_type: string;
  audio_length_sec: number;
  tag_ids: number[];

  session_id: number;
  project_id?: number;

  language_id: number;
  envelope_id: number | null;
  /** The main asset of this asset's bundle; null for a main asset. */
  parent_asset_id?: number | null;

  /** @deprecated v2 field name — use created_at */
  created?: string | Date;
  /** @deprecated v2 field name — use updated_at */
  updated?: string | Date;
  /** @deprecated v2 field name — use audio_length_sec */
  audio_length_in_seconds?: number;
  /** @deprecated v2 field name — use envelope_id */
  envelope_ids?: number[];
  /** @deprecated v2 field — removed in v3 */
  filename?: string;
  /** @deprecated v2 field — removed in v3 */
  description_loc_ids?: number[];
  /** @deprecated v2 field — removed in v3 */
  alt_text_loc_ids?: number[];
  /** @deprecated v2 field — removed in v3, user_id is on asset but user object not exposed */
  user?: {
    username: string;
    email: string;
  } | null;
  /** @deprecated v2 field — use project_id */
  project?: number;
}

export interface IAssetFilters extends Partial<IAssetData> {
  created__gte?: string;
}
export interface IDecoratedAsset extends IAssetData {
  activeRegionLowerBound: number;
  timedAssetStart?: number;
  timedAssetEnd?: number;
  locationPoint: Feature<Point>;
  listenerPoint?: Point;
  playCount: number;
  lastListenTime?: number;
  status?: "paused" | "resumed";
  pausedFromTrackId?: number;
  resume_time?: number | undefined;
  activeRegionLength: number;
  activeRegionUpperBound: number;
}
