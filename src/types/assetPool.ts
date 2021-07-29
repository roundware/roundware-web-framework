import { TimedAssetT, ITrack } from ".";
import { IAssetData } from ".";
import { Point } from "@turf/helpers";
export interface IAssetPool {
  updateAssets(assets: IAssetData[], timedAssets: TimedAssetT[]): void;
  nextForTrack(
    track: ITrack,
    stateParams: {
      filterOutAssets?: IAssetData[];

      elapsedSeconds?: number;
      listenerPoint?: Point;
      listenTagIds?: number[];
    }
  ): IAssetData | undefined;
}
