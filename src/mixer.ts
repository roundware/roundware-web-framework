import { IAudioContext } from "standardized-audio-context";
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
  audioContext: IAudioContext;

  constructor({
    client,
    windowScope,
    listenerLocation,
    filters = [],
    sortMethods = [],
    mixParams = {},
  }: {
    client: Roundware;
    windowScope: Window;
    listenerLocation: Coordinates;
    filters?: unknown[];
    sortMethods?: unknown[];
    mixParams: IMixParams;
  }) {
    this.playing = false;

    this._windowScope = windowScope;
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
      // @ts-ignore here it asks for a function
      filters,
      sortMethods,
      mixParams: this.mixParams,
    });
    this.audioContext = buildAudioContext(this._windowScope);
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
      if (!this.mixParams.listenerPoint)
        return console.error(
          `[mixer] listenerPoint was missing while initiating mixer!`
        );
      const listenerPoint = this.mixParams.listenerPoint;

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
        audioContext: this.audioContext,
        windowScope: this._windowScope,
      });

      this.initializeSpeakers();
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

  play() {
    this.initContext();
    // console.log(`playing`);
    // consssole.log(this.audioContext.currentTime);

    this.playing = true;
    if (this.playlist) this.playlist.play();
    if (Array.isArray(this.speakerTracks)) {
      this.speakerTracks.forEach((s) => {
        s.player.timerStart();
        s.play();
      });
    }
  }

  stop() {
    this.initContext();
    this.playing = false;
    if (this.playlist) this.playlist.pause();
    if (Array.isArray(this.speakerTracks))
      this.speakerTracks.forEach((s) => {
        s.player.timerStop();
        s.pause();
      });
  }

  endedSpeakersLength = 0;
  handleSpeakerEnd() {
    this.endedSpeakersLength++;
    if (this.endedSpeakersLength == this.speakerTracks?.length) {
      this.allSpeakersEndCallback();
    }
  }

  initializeSpeakers() {
    this.endedSpeakersLength = 0;
    const speakers = this._client.speakers();
    this.speakerTracks = speakers.map(
      (speakerData) =>
        new SpeakerTrack({
          audioContext: this.audioContext,
          listenerPoint: this.mixParams.listenerPoint!,
          data: speakerData,
          config: this.mixParams.speakerConfig || {
            sync: false,
            length: 600,
            loop: false,
            prefetch: false,
          },
        })
    );
    this.speakerTracks.forEach((s) => s.player.onEnd(this.handleSpeakerEnd));
  }

  allSpeakersEndCallback = () => {};
  onAllSpeakersEnd(callback: () => void) {
    this.allSpeakersEndCallback = callback;
  }
}
