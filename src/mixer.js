import { Playlist } from './playlist';
//import { PlaylistTrack } from './playlist_track';
import { SpeakerTrack } from './speaker_track';

export class Mixer {
  constructor({ client, audioCtx, filters, sortMethods }) {
    //this.client = client;
    // TODO: need to tell the client to notify us when geoposition or tags change,
    // so we can recompute the playlist
    this.audioCtx = audioCtx;
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

    this.speakerTracks = this.speakers.map(speakerData => {
      return new SpeakerTrack({
        audioCtx: this.audioCtx,
        data: speakerData,
      });
    });
  }

  toString() {
    return 'Roundware Mixer';
  }

  play() {
    console.log('Playing',this);
    this.speakerTracks.forEach(s => s.play());
    //this.playlistTracks.forEach(t => t.play());
  }
}
