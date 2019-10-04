import { PlaylistAudiotrack } from './playlistAudioTrack';

export class Playlist {
  constructor({ audioTracks = [], listenerPoint = {}, assetPool, ...playlistTrackOptions }) {
    this.listenerPoint = listenerPoint;
    this.playingTracks = {};
    this.assetPool = assetPool;
    this.playing = false;
    this.startTime = new Date();

    const trackMap = new Map();

    audioTracks.forEach(audioData => {
      const track = new PlaylistAudiotrack({ 
        audioData,
        ...playlistTrackOptions,
        playlist: this,
      });

      trackMap.set(track,null);
    },{});

    this.trackMap = trackMap;
  }

  get tracks() {
    return [...this.trackMap.keys()];
  }

  get currentlyPlayingAssets() {
    const trackMapAssets = [...this.trackMap.values()];
    return trackMapAssets.filter(Boolean); // remove null values
  }

  updateListenerPoint(point) {
    this.listenerPoint = point;
    if (this.playing) this.play(); // in case new assets are now available
  }

  play() {
    this.tracks.forEach(t => t.play());
    this.playing = true;
  }

  pause() {
    this.tracks.forEach(t => t.pause());
    this.playing = false;
  }

  next(forTrack) {
    const filterOutAssets = this.currentlyPlayingAssets;

    const nextAsset = this.assetPool.nextForTrack(forTrack,{
      filterOutAssets,
      playlistStartTime: this.startTime,
      listenerPoint: this.listenerPoint
    });

    this.trackMap[forTrack] = nextAsset;

    return nextAsset;
  }
}
