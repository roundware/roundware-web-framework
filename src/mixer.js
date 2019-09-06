import { SpeakerTrack } from './speaker_track';
import { Playlist } from './playlist';
import { coordsToPoints } from './utils';
//import { PlaylistTrack } from './playlist_track';

export class Mixer {
  constructor({ client, startingListenerCoordinates, filters, sortMethods, audioCtx }) {
    this.audioCtx = audioCtx || new AudioContext();
    this.audiotracks = client.audiotracks();
    this.assets = client.assets();
    this.speakers = client.speakers();

    this.playlist = new Playlist({ 
      assets: this.assets,
      filters,
      sortMethods
    });

    //this.playlistTracks = this.audiotracks.map(audioData => {
      //const track = new PlaylistTrack({ 
        //audioCtx: this.audioCtx, 
        //playlist: this.playlist,
        //audioData
      //});
      //return track;
    //});

    const startingListenerPoint = coordsToPoints(startingListenerCoordinates);

    this.speakerTracks = this.speakers.map(speakerData => {
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
    this.speakerTracks.forEach(s => s.updateListenerPoint(newPoint.geometry));
  }

  toString() {
    return 'Roundware Mixer';
  }

  async toggle() {
    const promises = [];

    if (this.playing) {
      console.log(`Pausing ${this}`);
      this.playing = false;
      this.speakerTracks.forEach(s => promises.push(s.pause()));
      // TODO pause playlisttracks
    } else {
      console.log(`Playing ${this}`);
      this.playing = true;
      this.speakerTracks.forEach(s => promises.push(s.play()));
      // TODO play playlisttracks
    }

    try {
      await Promise.all(promises);
      console.log(`All ${this} tracks`,this.playing ? 'playing' : 'paused');
    } catch (err) {
      console.error(`Unable to toggle all ${this} tracks due to error`,err);
    }

    return this.playing;
  }
}
