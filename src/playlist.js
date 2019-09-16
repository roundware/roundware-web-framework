import { AssetPool } from './assetPool';

export class Playlist {
  constructor({ listenerPoint = {}, ...assetPoolOptions }) {
    this.listenerPoint = listenerPoint;
    this.playingTracks = {};
    this.assetPool = new AssetPool(assetPoolOptions);
  }

  get currentlyPlayingAssets() {
    return Object.entries(this.playingTracks);
  }

  updateListenerPoint(point) {
    this.listenerPoint = point;
  }

  next(forTrack) {
    const filterOutAssets = this.currentlyPlayingAssets;

    const nextAsset = this.assetPool.nextForTrack(forTrack,{
      filterOutAssets,
      listenerPoint: this.listenerPoint
    });

    this.playingTracks[forTrack] = nextAsset;

    return nextAsset;
  }
}
