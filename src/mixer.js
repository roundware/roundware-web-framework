import { SpeakerTrack } from './speaker_track';
import { Playlist } from './playlist';
import { buildAudioContext, coordsToPoints, getUrlParam } from './utils';
import { AssetPool } from './assetPool';

export class Mixer {
  constructor({ client, windowScope, listenerLocation, filters = [], sortMethods = [], mixParams = {} }) {
    const audioContext = buildAudioContext(windowScope);
    let selectTrackId = getUrlParam(windowScope.location, 'rwfSelectTrackId');
    let audioTracks = client.audiotracks();

    if (selectTrackId) {
      selectTrackId = Number(selectTrackId);
      audioTracks = audioTracks.filter(t => t.id === selectTrackId);

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
      mixParams
    });

    this.audioContext = audioContext;

    this.playlist = new Playlist({
      audioTracks,
      listenerPoint,
      assetPool,
      audioContext,
      windowScope
    });

    this.speakerTracks = speakers.map(speakerData => new SpeakerTrack({
      audioContext,
      listenerPoint,
      data: speakerData
    }));

    this.playing = false;
  }

  updateParams({ listenerLocation, ...params }) {
    if (listenerLocation) {
      params.listenerPoint = coordsToPoints(listenerLocation);
    }

    this.playlist.updateParams(params);
    this.speakerTracks.forEach(t => t.updateParams(params));
  }

  skipTrack(trackId) {
    if (this.playlist) this.playlist.skip(trackId);
  }

  replayTrack(trackId) {
    if (this.playlist) this.playlist.replay(trackId);
  }

  toString() {
    return 'Roundware Mixer';
  }

  toggle() {
    if (this.playing) {
      this.playing = false;

      this.playlist.pause();
      this.speakerTracks.forEach(s => s.pause());
    } else {
      this.playing = true;
      this.playlist.play();
      this.speakerTracks.forEach(s => s.play());
    }

    return this.playing;
  }
}
