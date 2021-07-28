import { AssetT, TimedAssetT, TrackT } from ".";

export interface IAssetPool {
  updateAssets(assets: AssetT[], timedAssets: TimedAssetT[]): void;
  nextForTrack(
    track: TrackT,
    stateParams: {
      filterOutAssets?: AssetT[];
    }
  ): AssetT | undefined;
}
