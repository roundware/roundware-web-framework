import { SpeakerTrack } from './speaker_track';
import { Playlist } from './playlist';
import { buildAudioContext, coordsToPoints } from './utils';
import { AssetPool } from './assetPool';

export class Mixer {
  constructor({ client, windowScope, listenerLocation, filters = [], sortMethods = [], mixParams = {} }) {
    const audioContext = buildAudioContext(windowScope);

    const audioTracks = client.audiotracks().filter(t => t.id !== 40); // temporarily disabling one track for testing purposes
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

    //console.info({ assets, filters, sortMethods, mixParams });

    this.speakerTracks = speakers.map(speakerData => new SpeakerTrack({
      audioContext,
      listenerPoint,
      data: speakerData
    }));

    this.playing = false;
  }

  updateParams({ listenerLocation, ...params}) {
    if (listenerLocation) {
      params.listenerPoint = coordsToPoints(listenerLocation);
    }

    this.playlist.updateParams(params);
    this.speakerTracks.forEach(t => t.updateParams(params));
  }

  toString() {
    return 'Roundware Mixer';
  }

  toggle() {
    if (this.playing) {
      //console.log(`Pausing ${this}`);

      this.playing = false;
      this.playlist.pause();
      this.speakerTracks.forEach(s => s.pause());
    } else {
      //console.log(`Playing ${this}`);
      
      this.playing = true;
      this.playlist.play();
      this.speakerTracks.forEach(s => s.play());
    }

    return this.playing;
  }
}
