import { SpeakerTrack } from './speaker_track';
import { Playlist } from './playlist';
import { coordsToPoints } from './utils';
import { PlaylistTrack } from './playlist_track';

export class Mixer {
  constructor({ client, listenerLocation, filters = [], sortMethods = [], audioCtx, mixParams = {} }) {
    this.audioCtx = audioCtx || new AudioContext();

    const audiotracks = client.audiotracks();
    const assets = client.assets();
    const speakers = client.speakers();
    const listenerPoint = coordsToPoints(listenerLocation);

    this.playlist = new Playlist({ 
      assets,
      filters,
      sortMethods,
      mixParams,
    });

    //console.info({ assets, filters, sortMethods, mixParams });

    this.playlistTracks = audiotracks.map(audioData => new PlaylistTrack({ 
      audioCtx: this.audioCtx, 
      playlist: this.playlist,
      audioData,
      listenerPoint
    }));

    this.speakerTracks = speakers.map(speakerData => new SpeakerTrack({
      audioCtx: this.audioCtx,
      listenerPoint,
      data: speakerData
    }));

    this.playing = false;
  }

  updateListenerLocation(newCoordinates) {
    const newPoint = coordsToPoints(newCoordinates);
    // TODO need to propagate this to playlist, which updates mixParams using new location
    [this.playlist,...this.speakerTracks].forEach(t => t.updateListenerPoint(newPoint.geometry));
  }

  toString() {
    return 'Roundware Mixer';
  }

  toggle() {
    if (this.playing) {
      console.log(`Pausing ${this}`);

      this.playing = false;
      this.speakerTracks.forEach(s => s.pause());
      this.playlistTracks.forEach(p => p.pause());
    } else {
      console.log(`Playing ${this}`);
      
      this.playing = true;
      this.speakerTracks.forEach(s => s.play());
      this.playlistTracks.forEach(p => p.play());
    }

    return this.playing;
  }
}
