import { PlaylistAudiotrack } from './playlistAudioTrack';
import { getUrlParam } from './utils';

export class Playlist {
  constructor({ audioTracks = [], listenerPoint = {}, windowScope, assetPool, ...playlistTrackOptions }) {
    this.listenerPoint = listenerPoint;
    this.playingTracks = {};
    this.assetPool = assetPool;
    this.playing = false;

    let elapsedTimeMs = 0;
    const timerSecs = getUrlParam(windowScope.location,'rwfTimerSeconds');

    if (timerSecs) {
      const elapsedSecs = Number(timerSecs);
      elapsedTimeMs = elapsedSecs * 1000;
      console.log(`Setting playlist timer to ${elapsedSecs.toFixed(1)}s`);
    }

    this.elapsedTimeMs = elapsedTimeMs;
    const trackMap = new Map();

    audioTracks.forEach(audioData => {
      const track = new PlaylistAudiotrack({ 
        audioData,
        ...playlistTrackOptions,
        windowScope,
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

  updateParams({ listenerPoint, ...params}) {
    if (listenerPoint) this.listenerPoint = listenerPoint;
    this.tracks.forEach(t => t.updateParams(params));
  }

  play() {
    this.tracks.forEach(t => t.play());
    this.playlistLastStartedAt = new Date;
    this.playing = true;
  }

  pause() {
    this.tracks.forEach(t => t.pause());

    if (this.playlistLastStartedAt) {
      this.elapsedTimeMs = this.elapsedTimeMs + (new Date - this.playlistLastStartedAt);
      console.info(`elapsed time ${(this.elapsedTimeMs / 1000).toFixed(1)}s`);
      delete this.playlistLastStartedAt;
    }

    this.playing = false;
  }

  next(forTrack) {
    const filterOutAssets = this.currentlyPlayingAssets;
    const now = new Date;
    const lastStartedAt = this.playlistLastStartedAt ? this.playlistLastStartedAt : now;
    const elapsedSinceLastStartMs = this.elapsedTimeMs + (now - lastStartedAt);
    const elapsedSeconds = elapsedSinceLastStartMs / 1000;

    const nextAsset = this.assetPool.nextForTrack(forTrack,{
      filterOutAssets,
      elapsedSeconds,
      listenerPoint: this.listenerPoint,
    });

    this.trackMap[forTrack] = nextAsset;

    return nextAsset;
  }
}
