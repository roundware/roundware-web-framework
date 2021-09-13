import { AssetPool } from "./assetPool";
import { Playlist } from "./playlist";
import { Roundware } from "./roundware";
import { SpeakerTrack } from "./speaker_track";
import {
  Coordinates,
  GeoListenModeType,
  IMixParams,
  ITimedAssetData,
} from "./types";
import { IAssetData } from "./types/asset";

import { buildAudioContext, coordsToPoints, getUrlParam } from "./utils";

export const GeoListenMode: {
  DISABLED: GeoListenModeType;
  MANUAL: GeoListenModeType;
  AUTOMATIC: GeoListenModeType;
} = Object.freeze({
  DISABLED: 0,
  MANUAL: 1,
  AUTOMATIC: 2,
});

export class Mixer {
  playing: boolean;
  private _windowScope: Window;
  private _client: Roundware;
  private _prefetchSpeakerAudio: any | boolean;

  mixParams: IMixParams;
  playlist: Playlist | undefined;
  assetPool: AssetPool;
  speakerTracks: SpeakerTrack[] | undefined;

  constructor({
    client,
    windowScope,
    listenerLocation,
    prefetchSpeakerAudio,
    filters = [],
    sortMethods = [],
    mixParams = {},
  }: {
    client: Roundware;
    windowScope: Window;
    listenerLocation: Coordinates;
    prefetchSpeakerAudio: boolean | unknown;
    filters?: unknown[];
    sortMethods?: unknown[];
    mixParams: IMixParams;
  }) {
    this.playing = false;

    this._windowScope = windowScope;
    this._client = client;
    this._prefetchSpeakerAudio = prefetchSpeakerAudio;
    const assets: IAssetData[] = client.assets();
    const timedAssets = client.timedAssets();

    this.mixParams = {
      listenerPoint: coordsToPoints({
        latitude: listenerLocation.latitude!,
        longitude: listenerLocation.longitude!,
      }),
      ...mixParams,
    };

    this.assetPool = new AssetPool({
      assets,
      timedAssets,
      // @ts-ignore here it asks for a function
      filters,
      sortMethods,
      mixParams: this.mixParams,
    });
  }

  updateParams({ listenerLocation, ...params }: IMixParams) {
    if (listenerLocation) {
      params.listenerPoint = coordsToPoints({
        latitude: listenerLocation.latitude!,
        longitude: listenerLocation.longitude!,
      });
    }
    this.mixParams = { ...this.mixParams, ...params };
    if (this.playlist) {
      this.playlist.updateParams(params);
    }
    if (Array.isArray(this.speakerTracks)) {
      this.speakerTracks.forEach((t) =>
        t.updateParams(this.playing, { listenerPoint: params.listenerPoint })
      );
    }
  }
  /**
   * @param  {number} trackId
   */
  skipTrack(trackId: number) {
    if (this.playlist) this.playlist.skip(trackId);
  }

  skip() {}
  /**
   * @param  {number} trackId
   */
  replayTrack(trackId: number) {
    if (this.playlist) this.playlist.replay(trackId);
  }
  /**
   * @returns string
   */
  toString(): string {
    return "Roundware Mixer";
  }

  /**
   * Builds speaker tracks & playlist instance if it doesn't exist yet
   */
  initContext() {
    if (!this.playlist) {
      const audioContext = buildAudioContext(this._windowScope);
      if (!this.mixParams.listenerPoint)
        throw new Error(`listenerPoint was missing in mixer!`);
      const listenerPoint = this.mixParams.listenerPoint;
      const speakers = this._client.speakers();

      let selectTrackId: string | number | null = getUrlParam(
        this._windowScope.location.toString(),
        "rwfSelectTrackId"
      );
      let audioTracks = this._client.audiotracks();

      if (selectTrackId) {
        selectTrackId = Number(selectTrackId);
        audioTracks = audioTracks.filter((t) => t.id === selectTrackId);
        console.info(`isolating track #${selectTrackId}`);
      }

      this.playlist = new Playlist({
        client: this._client,
        audioTracks,
        listenerPoint,
        assetPool: this.assetPool,
        audioContext,
        windowScope: this._windowScope,
      });

      this.speakerTracks = speakers.map(
        (speakerData) =>
          new SpeakerTrack({
            audioContext,
            listenerPoint,
            prefetchAudio: this._prefetchSpeakerAudio,
            data: speakerData,
          })
      );

      this.updateParams(this.mixParams);
    }
  }

  /**
   * @param  {boolean} true to play false to stop
   * @returns boolean
   */
  toggle(play?: boolean): boolean {
    // Build the audio context and playlist if it doesn't exist yet.
    this.initContext();

    if (typeof play == "boolean") {
      // do based on what asked..
      play ? this.play() : this.stop();
    } else {
      // automatically decide based on playing status
      this.playing ? this.stop() : this.play();
    }

    return this.playing;
  }

  play() {
    this.playing = true;
    if (this.playlist) this.playlist.play();
    if (Array.isArray(this.speakerTracks))
      this.speakerTracks.forEach((s) => s.play());
  }

  stop() {
    this.playing = false;
    if (this.playlist) this.playlist.pause();
    if (Array.isArray(this.speakerTracks))
      this.speakerTracks.forEach((s) => s.pause());
  }
}
