import { SpeakerTrack } from './speaker_track';
import { Playlist } from './playlist';
import { coordsToPoints } from './utils';
import { PlaylistTrack } from './playlist_track';

export class Mixer {
  constructor({ client, startingListenerCoordinates, filters = [], sortMethods = [], audioCtx, mixParams = {} }) {
    this.audioCtx = audioCtx || new AudioContext();

    const audiotracks = client.audiotracks();
    const assets = client.assets();
    const speakers = client.speakers();
    const startingListenerPoint = coordsToPoints(startingListenerCoordinates);

    this.playlist = new Playlist({ 
      assets,
      filters,
      sortMethods,
      mixParams
    });

    this.playlistTracks = audiotracks.map(audioData => {
      const track = new PlaylistTrack({ 
        audioCtx: this.audioCtx, 
        playlist: this.playlist,
        audioData
      });

      return track;
    });

    this.speakerTracks = speakers.map(speakerData => {
      return new SpeakerTrack({
        audioCtx: this.audioCtx,
        startingListenerPoint,
        data: speakerData,
      });
    });

    this.playing = false;
  }

  updatePosition(newCoordinates) {
    const newPoint = coordsToPoints(newCoordinates);
    // TODO need to propagate this to playlist, which updates mixParams using new location
    this.speakerTracks.forEach(s => s.updateListenerPoint(newPoint.geometry));
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
