import { Playlist } from './playlist';
import { PlaylistTrack } from './playlist_track';

export class Mixer {
  constructor(client,audioCtx,{ filters, sortMethods } = {}) {
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

    this.playlistTracks = this.audiotracks.map(
      audiotrack => new PlaylistTrack(this.audioCtx,audiotrack,() => this.playlist.onNextAsset())
    );

    // wire up speakers to receive geoposition updates and adjust volumes...could use spatial audio here
  }

  toString() {
    return 'Roundware Mixer';
  }

  play() {
    this.playlistTracks.forEach(t => t.play());
  }
}
