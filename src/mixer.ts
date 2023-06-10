import { IAudioContext } from "standardized-audio-context";
import { AssetPool } from "./assetPool";
import { Playlist } from "./playlist";
import { AssetPriorityType, Roundware } from "./roundware";
import { SpeakerTrack } from "./speaker_track";
import {
  Coordinates,
  GeoListenModeType,
  IMixParams,
  ITimedAssetData,
} from "./types";
import { IAssetData, IDecoratedAsset } from "./types/asset";

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

  private _client: Roundware;
  private _prefetchSpeakerAudio: any | boolean;

  mixParams: IMixParams;
  playlist: Playlist | undefined;
  assetPool: AssetPool;
  speakerTracks: SpeakerTrack[] | undefined;
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
    if (this.playing === false) {
      this._client.events?.logEvent(`play_stream`);
    }
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
    if (this.playing === true) {
      this._client.events?.logEvent(`pause_stream`);
    }
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
    this.endedSpeakersLength += 1;
    console.log(
      `some speaker ended`,
      this.endedSpeakersLength,
      this.speakerTracks?.length
    );
    if (this.endedSpeakersLength == this.speakerTracks?.length) {
      this.allSpeakersEndCallback();
    }
  }

  replay() {
    this.endedSpeakersLength = 0;
    const that = this;
    this.speakerTracks?.forEach((s) => {
      s.player.pause();
      s.player.replay();
      that.play();
    });
  }

  initializeSpeakers() {
    this.endedSpeakersLength = 0;
    const speakers = this._client.speakers();
    const that = this;

    this.speakerTracks = speakers.map(
      (speakerData) =>
        new SpeakerTrack({
          audioContext: that.audioContext,
          listenerPoint: that.mixParams.listenerPoint!,
          data: speakerData,
          config: that.mixParams.speakerConfig || {
            sync: false,
            length: 600,
            loop: false,
            prefetch: false,
          },
          mixer: that,
        })
    );

    this.speakerTracks.forEach((s) =>
      s.player.onEnd(() => that.handleSpeakerEnd())
    );
    this.updateParams(this.mixParams);
  }

  allSpeakersEndCallback = () => {};
  onAllSpeakersEnd(callback: () => void) {
    this.allSpeakersEndCallback = callback;
  }
}
