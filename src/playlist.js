import { PlaylistAudiotrack } from './playlistAudioTrack';
import { getUrlParam } from './utils';

export class Playlist {
  constructor({ audioTracks = [], listenerPoint = {}, windowScope, assetPool, ...playlistTrackOptions }) {
    this.listenerPoint = listenerPoint;
    this.playingTracks = {};
    this.assetPool = assetPool;
    this.playing = false;
    this.listenTagIds = [];

    let elapsedTimeMs = 0;
    const timerSecs = getUrlParam(windowScope.location,'rwfTimerSeconds');

    if (timerSecs) {
      const elapsedSecs = Number(timerSecs);
      elapsedTimeMs = elapsedSecs * 1000;
      console.log(`Setting playlist timer to ${elapsedSecs.toFixed(1)}s`);
    }

    this._elapsedTimeMs = elapsedTimeMs;
    const trackIdMap = {};
    const trackMap = new Map();

    audioTracks.forEach(audioData => {
      const track = new PlaylistAudiotrack({ 
        audioData,
        ...playlistTrackOptions,
        windowScope,
        playlist: this,
      });

      trackIdMap[track.trackId] = track;
      trackMap.set(track,true);
    },{});

    this.trackMap = trackMap;
    this.trackIdMap = trackIdMap;
  }

  get tracks() {
    return [...this.trackMap.keys()];
  }

  get currentlyPlayingAssets() {
    const trackMapAssets = [...this.trackMap.values()];
    return trackMapAssets.filter(Boolean); // remove null values
  }

  updateParams({ listenerPoint, listenTagIds = [], ...params}) {
    if (listenerPoint) this.listenerPoint = listenerPoint;
    this.listenTagIds = listenTagIds.map(t => Number(t));
    this.tracks.forEach(t => t.updateParams(params));
  }

  play() {
    this.tracks.forEach(t => t.play());
    this.playlistLastStartedAt = new Date;
    this.playing = true;
  }

  skip(trackId) {
    const track = this.trackIdMap[Number(trackId)];
    if (track) track.skip();
  }

  replay(trackId) {
    const track = this.trackIdMap[Number(trackId)];
    if (track) track.replay();
  }

  pause() {
    this.tracks.forEach(t => t.pause());

    if (this.playlistLastStartedAt) {
      this._elapsedTimeMs = this._elapsedTimeMs + (new Date - this.playlistLastStartedAt);
      delete this.playlistLastStartedAt;
    }

    this.playing = false;
  }

  get elapsedTimeMs() {
    const now = new Date;
    const lastStartedAt = this.playlistLastStartedAt ? this.playlistLastStartedAt : now;
    const elapsedSinceLastStartMs = now - lastStartedAt;

    return this._elapsedTimeMs + elapsedSinceLastStartMs;
  }

  next(forTrack) {
    const { assetPool, currentlyPlayingAssets: filterOutAssets, elapsedTimeMs, listenTagIds } = this;
    const elapsedSeconds = elapsedTimeMs / 1000;

    const nextAsset = assetPool.nextForTrack(forTrack,{
      filterOutAssets,
      elapsedSeconds,
      listenerPoint: this.listenerPoint,
      listenTagIds
    });

    this.trackMap[forTrack] = nextAsset;

    return nextAsset;
  }
}
