import { SpeakerTrack } from "./speaker_track";
import { Playlist } from "./playlist";
import { buildAudioContext, coordsToPoints, getUrlParam } from "./utils";
import { AssetPool } from "./assetPool";

export const GeoListenMode = Object.freeze({
  DISABLED: 0,
  MANUAL: 1,
  AUTOMATIC: 2,
});

export class Mixer {
  constructor({
    client,
    windowScope,
    listenerLocation,
    filters = [],
    sortMethods = [],
    mixParams = {},
  }) {
    this.playing = false;
    const audioContext = buildAudioContext(windowScope);
    let selectTrackId = getUrlParam(windowScope.location, "rwfSelectTrackId");
    let audioTracks = client.audiotracks();

    if (selectTrackId) {
      selectTrackId = Number(selectTrackId);
      audioTracks = audioTracks.filter((t) => t.id === selectTrackId);

      console.info(`isolating track #${selectTrackId}`);
    }

    const assets = client.assets();
    const timedAssets = client.timedAssets();
    const speakers = client.speakers();
    const listenerPoint = coordsToPoints(listenerLocation);

    const assetPool = new AssetPool({
      assets,
      timedAssets,
      filters,
      sortMethods,
      mixParams,
    });

    this.audioContext = audioContext;
    this.mixParams = mixParams;
    this.playlist = new Playlist({
      client,
      audioTracks,
      listenerPoint,
      assetPool,
      audioContext,
      windowScope,
    });

    this.speakerTracks = speakers.map(
      (speakerData) =>
        new SpeakerTrack({
          audioContext,
          listenerPoint,
          data: speakerData,
        })
    );
  }

  updateParams({ listenerLocation, ...params }) {
    if (listenerLocation) {
      params.listenerPoint = coordsToPoints(listenerLocation);
    }
    this.mixParams = { ...this.mixParams, ...params };
    this.playlist.updateParams(params);
    this.speakerTracks.forEach((t) => t.updateParams(this.playing, params));
  }

  skipTrack(trackId) {
    if (this.playlist) this.playlist.skip(trackId);
  }

  replayTrack(trackId) {
    if (this.playlist) this.playlist.replay(trackId);
  }

  toString() {
    return "Roundware Mixer";
  }

  toggle() {
    if (this.playing) {
      this.playing = false;
      this.playlist.pause();
      this.speakerTracks.forEach((s) => s.pause());
    } else {
      this.playing = true;
      this.playlist.play();
      this.speakerTracks.forEach((s) => s.play());
    }

    return this.playing;
  }
}
