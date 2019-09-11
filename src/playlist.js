import { AssetPool } from './assetPool';

export class Playlist {
  constructor({ ...assetPoolOptions }) {
    this.assetPool = new AssetPool(assetPoolOptions);
    this.playingTracks = {};
  }

  get currentlyPlayingAssets() {
    return Object.entries(this.playingTracks);
  }

  next(forTrack) {
    const filterOutAssets = this.currentlyPlayingAssets;
    const nextAsset = this.assetPool.nextForTrack(forTrack,{ filterOutAssets });
    this.playingTracks[forTrack] = nextAsset;

    return nextAsset;
  }
}
