import { SpeakerTrack } from './speaker_track';
import { Playlist } from './playlist';
import { coordsToPoints } from './utils';
import { AssetPool } from './assetPool';

export class Mixer {
  constructor({ client, audioContext, windowScope, listenerLocation, filters = [], sortMethods = [], mixParams = {} }) {
    this.audioContext = audioContext;

    const audioTracks = client.audiotracks();
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

  updateListenerLocation(newCoordinates) {
    const newPoint = coordsToPoints(newCoordinates);
    [this.playlist,...this.speakerTracks].forEach(t => t.updateListenerPoint(newPoint.geometry));
  }

  toString() {
    return 'Roundware Mixer';
  }

  toggle() {
    if (this.playing) {
      console.log(`Pausing ${this}`);

      this.playing = false;
      this.playlist.pause();
      this.speakerTracks.forEach(s => s.pause());
    } else {
      console.log(`Playing ${this}`);
      
      this.playing = true;
      this.playlist.play();
      this.speakerTracks.forEach(s => s.play());
    }

    return this.playing;
  }
}
