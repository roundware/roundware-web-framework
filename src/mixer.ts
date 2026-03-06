import { IAudioContext } from "standardized-audio-context";
import { AssetPool } from "./assetPool";
import { Playlist } from "./playlist";
import { Roundware, AssetPriorityType } from "./roundware";
import { Coordinates, GeoListenModeType, IMixParams } from "./types";
import { IAssetData, IDecoratedAsset } from "./types/asset";

import { buildAudioContext, coordsToPoints, getUrlParam } from "./utils";
import { SpeakerEngine } from "./speaker/speaker_engine";

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

  private _client: Roundware;
  private _prefetchSpeakerAudio: any | boolean;

  mixParams: IMixParams;
  playlist: Playlist | undefined;
  speakerEngine: SpeakerEngine | undefined;
  assetPool: AssetPool;

  audioContext: IAudioContext;

  constructor({
    client,
    listenerLocation,
    filters,
    sortMethods = [],
    mixParams = {},
  }: {
    client: Roundware;
    listenerLocation: Coordinates;
    filters?: (
      asset: IDecoratedAsset,
      mixParams: IMixParams
    ) => AssetPriorityType;
    sortMethods?: string[];
    mixParams: IMixParams;
  }) {
    this.playing = false;

    this._client = client;

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
      filterChain: filters,
      sortMethods,
      mixParams: this.mixParams,
    });
    this.audioContext = buildAudioContext();
  }

  updateParams({ listenerLocation, ...params }: IMixParams) {
    if (listenerLocation) {
      params.listenerPoint = coordsToPoints({
        latitude: listenerLocation.latitude!,
        longitude: listenerLocation.longitude!,
      });
    }
    this.mixParams = { ...this.mixParams, ...params };
    this.playlist?.updateParams(params);

    // Create the SpeakerEngine on the first location update so that
    // nearby speaker audio can be prefetched before the user presses play.
    // The AudioContext starts suspended but XHR downloads and decodeAudioData
    // both work in that state — only actual playback requires a running context.
    this.initSpeakers();
    this.speakerEngine?.updateParams?.(this.mixParams);
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
   * Creates the SpeakerEngine if it doesn't exist yet.
   * Called from updateParams() so that speaker audio buffers begin
   * prefetching as soon as the listener's position is known — well
   * before the user presses play.
   */
  private initSpeakers() {
    if (this.speakerEngine) return;
    if (!this.mixParams.speakerConfig) return;
    if (!this._client.speakers()?.length) return;

    this.speakerEngine = new SpeakerEngine(
      this._client.speakers(),
      this.audioContext,
      this.mixParams.speakerConfig
    );
    console.info(`SpeakerEngine initialized (pre-play prefetch enabled)`);
  }

  /**
   * Builds the playlist instance if it doesn't exist yet.
   * Also ensures the SpeakerEngine exists (idempotent).
   */
  initContext() {
    if (!this.playlist) {
      if (!this.mixParams.listenerPoint)
        return console.error(
          `[mixer] listenerPoint was missing while initiating mixer!`
        );
      const listenerPoint = this.mixParams.listenerPoint;

      let selectTrackId: string | number | null = getUrlParam(
        window.location.toString(),
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
        audioContext: this.audioContext,
      });

      // Ensure SpeakerEngine exists (may already have been created
      // by updateParams during pre-play prefetching)
      this.initSpeakers();

      this.updateParams(this.mixParams);
      console.info(`Mixer Activated`);
    }
  }

  /**
   * @param  {boolean} true to play false to stop
   * @returns boolean
   */
  toggle(play?: boolean): boolean {
    if (typeof play == "boolean") {
      // do based on what asked..
      play ? this.play() : this.stop();
    } else {
      // automatically decide based on playing status
      this.playing ? this.stop() : this.play();
    }

    return this.playing;
  }

  async play() {
    this.initContext();
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    // console.log(`playing`);
    // consssole.log(this.audioContext.currentTime);
    if (this.playing === false) {
      this._client.events?.logEvent(`play_stream`);
    }
    this.playing = true;
    if (this.playlist) this.playlist.play();
    this.speakerEngine?.play();
  }

  stop() {
    this.initContext();
    if (this.playing === true) {
      this._client.events?.logEvent(`pause_stream`);
    }
    this.playing = false;
    if (this.playlist) this.playlist.pause();
    this.speakerEngine?.stop();
  }
}
