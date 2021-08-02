import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { getUrlParam } from "./utils";
import { Point } from "@turf/helpers";

import { IAudioContext } from "standardized-audio-context";
import { IAudioTrackData } from "./types/audioTrack";
import { IMixParams, ITrack } from "./types";
import { Roundware } from "./roundware";
import { AssetPool } from "./assetPool";

export class Playlist {
  listenerPoint: Point;
  playingTracks: IAudioTrackData[];
  assetPool: AssetPool;
  playing: boolean;
  listenTagIds: number[];
  _client: Roundware;
  _elapsedTimeMs: number;
  trackMap: Map<any, any>;
  trackIdMap: {};
  playlistLastStartedAt: Date | undefined;

  constructor({
    client,
    audioTracks = [],
    listenerPoint,
    windowScope,
    assetPool,
    ...playlistTrackOptions
  }: {
    client: Roundware;
    audioTracks?: IAudioTrackData[];
    listenerPoint: Point;
    windowScope: Window;
    assetPool: AssetPool;
    audioContext?: IAudioContext;
  }) {
    this.listenerPoint = listenerPoint;
    this.playingTracks = [];
    this.assetPool = assetPool;
    this.playing = false;
    this.listenTagIds = [];
    this._client = client;

    let elapsedTimeMs = 0;
    const timerSecs = getUrlParam(
      windowScope.location.toString(),
      "rwfTimerSeconds"
    );

    if (timerSecs) {
      const elapsedSecs = Number(timerSecs);
      elapsedTimeMs = elapsedSecs * 1000;
      console.log(`Setting playlist timer to ${elapsedSecs.toFixed(1)}s`);
    }

    this._elapsedTimeMs = elapsedTimeMs;
    const trackIdMap = {};
    const trackMap = new Map();

    audioTracks.forEach((audioData: IAudioTrackData) => {
      // @ts-ignore
      const track = new PlaylistAudiotrack({
        audioData,
        ...playlistTrackOptions,
        windowScope,
        playlist: this,
      });

      // @ts-ignore
      trackIdMap[track.trackId] = track;
      trackMap.set(track, null);
    }, {});

    this.trackMap = trackMap;
    this.trackIdMap = trackIdMap;
  }

  get tracks() {
    // @ts-ignore
    return [...this.trackMap.keys()];
  }

  get currentlyPlayingAssets() {
    const assets = [];
    // @ts-ignore
    for (const a of this.trackMap.values()) {
      if (a) {
        assets.push(a);
      }
    }
    return assets;
  }

  updateParams({ listenerPoint, listenTagIds, ...params }: IMixParams) {
    if (listenerPoint) this.listenerPoint = listenerPoint;
    if (listenTagIds) {
      this.listenTagIds = listenTagIds.map((t) => Number(t));
    }
    this.tracks.forEach((t) => t.updateParams(params));
  }

  play() {
    this.tracks.forEach((t) => t.play());
    this.playlistLastStartedAt = new Date();
    this.playing = true;
  }

  skip(trackId?: number) {
    if (typeof trackId == "undefined") return;
    // @ts-ignore
    const track = this.trackIdMap[Number(trackId)];
    if (track) track.skip();
  }

  replay(trackId: number) {
    // @ts-ignore
    const track = this.trackIdMap[Number(trackId)];
    if (track) track.replay();
  }

  pause() {
    this.tracks.forEach((t) => t.pause());

    if (this.playlistLastStartedAt) {
      this._elapsedTimeMs =
        this._elapsedTimeMs +
        (new Date().getMilliseconds() -
          this.playlistLastStartedAt.getMilliseconds());
      delete this.playlistLastStartedAt;
    }

    this.playing = false;
  }

  get elapsedTimeMs() {
    const now = new Date();
    const lastStartedAt = this.playlistLastStartedAt
      ? this.playlistLastStartedAt
      : now;
    const elapsedSinceLastStartMs =
      now.getMilliseconds() - lastStartedAt.getMilliseconds();

    return this._elapsedTimeMs + elapsedSinceLastStartMs;
  }

  next(forTrack: PlaylistAudiotrack) {
    const {
      assetPool,
      currentlyPlayingAssets: filterOutAssets,
      elapsedTimeMs,
      listenTagIds,
    } = this;
    const elapsedSeconds = elapsedTimeMs / 1000;

    const nextAsset = assetPool.nextForTrack(forTrack, {
      filterOutAssets,
      elapsedSeconds,
      listenerPoint: this.listenerPoint,
      listenTagIds,
    });

    this.trackMap.set(forTrack, nextAsset);
    this._client._triggerOnPlayAssets();

    return nextAsset;
  }
}
