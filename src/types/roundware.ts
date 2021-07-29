import { Coordinates, IAssetData, IUiConfig, IMixParams, IAudioData } from ".";
import { IApiClient } from "./api-client";
import { IAsset, IAssetFilters } from "./asset";
import { IAudioTrack, IAudioTrackData } from "./audioTrack";
import { IEnvelope } from "./envelope";
import { IGeoPosition } from "../geo-position";
import { AudioTrack, IMixer } from "./mixer";
import { IProject } from "../project";
import { ISession } from "../session";
import { ISpeaker, ISpeakerFilters } from "./speaker";
import { ITimedAsset, ITimedAssetData } from "../timed_asset";
import { IUser } from "./user";
import { ISpeakerData } from "./speaker";
import { IAssetPool } from "./assetPool";

export interface IRoundware {
  speakers(): ISpeakerData[];
  updateLocation(listenerLocation: Coordinates): void;
  set onUpdateLocation(callback: CallableFunction);
  set onUpdateAssets(callback: CallableFunction);
  set onPlayAssets(callback: CallableFunction);
  _triggerOnPlayAssets(): void;
  get currentlyPlayingAssets(): unknown;
  enableGeolocation(mode: number): void;
  disableGeolocation(): void;
  connect(): Promise<{ uiConfig: IUiConfig }>;
  get mixParams(): IMixParams;
  getAssets(options: object): Promise<unknown[]>;
  get assetPool(): IAssetPool | undefined;
  getAssetsFromPool(
    assetFilter: IAssetFilters,
    extraParams: object
  ): Promise<IAssetData[]>;
  updateAssetPool(): Promise<void>;
  loadAssetPool(): Promise<IAssetData[]>;
  activateMixer(activationParams: object): Promise<IMixer>;
  play(firstPlayCallback: (value: Coordinates) => any): Promise<void>;
  pause(): void;
  kill(): void;
  replay(): void;
  skip(): void;
  tags(): void;
  update(data: object): void;

  assets(): IAssetData[];
  timedAssets(): ITimedAssetData[] | [];
  audiotracks(): IAudioTrackData[];
  saveAsset(
    audioData: IAudioData,
    fileName: string,
    data: object
  ): Promise<unknown>;
  makeEnvelope(): Promise<IEnvelope>;
  //  findTagDecription(tagId: string, tagType: string): undefined | string;
  vote(assetId: string, voteType: string, value: unknown): Promise<unknown>;
  getAsset(id: string): Promise<IAssetData>;
  getEnvelope(id: string | number): Promise<unknown>;
}

export interface IOptions {
  apiClient: IApiClient;
  deviceId: string;
  clientType: string;
  geoListenMode?: boolean;
}
export interface IRoundwareConstructorOptions extends IOptions {
  serverUrl: string;
  projectId: number;
  speakerFilters?: ISpeakerFilters;
  assetFilters: IAssetFilters;
  listenerLocation: Coordinates;
  user?: IUser;
  geoPosition?: IGeoPosition;
  session?: ISession;
  project?: IProject;
  speaker?: ISpeaker;
  asset?: IAsset;
  timedAsset?: ITimedAsset;
  audiotrack?: IAudioTrack;
  assetUpdateInterval?: number;
  prefetchSpeakerAudio?: unknown;
}
