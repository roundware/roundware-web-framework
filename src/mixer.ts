import { AssetPool } from "./assetPool";
import { Playlist } from "./playlist";
import { Roundware } from "./roundware";
import { SpeakerTrack } from "./speaker_track";
import {
  Coordinates,
  GeoListenModeType,
  IAssetData,
  IMixParams,
} from "./types";

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
  speakerTracks: SpeakerTrack[] = [];

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
    if (this.speakerTracks) {
      for (const t of this.speakerTracks) {
        //@ts-ignore
        t.updateParams(this.playing, params);
      }
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

  initContext() {
    if (!this.playlist) {
      const audioContext = buildAudioContext(this._windowScope);

      if (!this.mixParams.listenerPoint)
        throw new Error(`listenerPoint was missing from mixParams!`);
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
   * @returns boolean - playing
   */
  toggle(): boolean {
    // Build the audio context and playlist if it doesn't exist yet.
    this.initContext();

    if (this.playing) {
      this.playing = false;
      if (this.playlist) this.playlist.pause();
      this.speakerTracks.forEach((s) => s.pause());
    } else {
      this.playing = true;
      if (this.playlist) this.playlist.play();
      this.speakerTracks.forEach((s) => s.play());
    }

    return this.playing;
  }
}
