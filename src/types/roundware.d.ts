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
  apiClient: ApiClient;
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
  prefetchSpeakerAudio?: boolean;
  keepPausedAssets?: boolean;
}
