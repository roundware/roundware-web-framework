import { IAssetData, IMixParams } from ".";
import { IAssetPool } from "./assetPool";

export interface IPlaylist {
  play(): void;
  replay(trackId: number): void;
  updateParams(data?: IMixParams | any): void;
  skip(trackId?: number): void;
  pause(): void;
  currentlyPlayingAssets: IAssetData[] | undefined;
  assetPool: IAssetPool;
}
