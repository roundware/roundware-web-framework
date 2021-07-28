import { Coordinates, AssetT, TimedAssetT } from ".";
import { IApiClient } from "./api-client";
import { IAsset } from "./asset";
import { IAudioTrack } from "./audioTrack";
import { IEnvelope } from "./envelope";
import { IGeoPosition } from "../geo-position";
import { AudioTrack, IMixer } from "./mixer";
import { IProject } from "../project";
import { ISession } from "../session";
import { ISpeaker } from "./speaker";
import { ITimedAsset } from "../timed_asset";
import { IUser } from "../user";
import { ISpeakerData } from "./speaker";

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
  connect(): Promise<{ uiConfig: unknown }>;
  get mixParams(): object;
  getAssets(options: object): Promise<unknown[]>;
  get assetPool(): unknown;
  getAssetsFromPool(
    assetFilter: object,
    extraParams: object
  ): Promise<unknown[]>;
  updateAssetPool(): Promise<void>;
  loadAssetPool(): Promise<unknown>;
  activateMixer(activationParams: object): Promise<IMixer>;
  play(firstPlayCallback: (value: Coordinates) => any): Promise<unknown>;
  pause(): void;
  kill(): void;
  replay(): void;
  skip(): void;
  tags(): void;
  update(data: object): void;

  assets(): AssetT[];
  timedAssets(): TimedAssetT[] | [];
  audiotracks(): AudioTrack[];
  saveAsset(
    audioData: object,
    fileName: string,
    data: object
  ): Promise<unknown>;
  makeEnvelope(): Promise<IEnvelope>;
  //  findTagDecription(tagId: string, tagType: string): undefined | string;
  vote(assetId: string, voteType: unknown, value: unknown): Promise<unknown>;
  getAsset(id: string): Promise<unknown>;
  getEnvelope(id: string): Promise<unknown>;
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
  speakerFilters?: unknown;
  assetFilters: object;
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
