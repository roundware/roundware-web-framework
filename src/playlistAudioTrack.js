import { hasOwnProperty } from './utils';

/*
@see https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/AudioTrack.swift

 Audiotracks data looks like this:

 [{
   "id": 8,
   "minvolume": 0.7,
   "maxvolume": 0.7,
   "minduration": 200.0,
   "maxduration": 250.0,
   "mindeadair": 1.0,
   "maxdeadair": 3.0,
   "minfadeintime": 2.0,
   "maxfadeintime": 4.0,
   "minfadeouttime": 0.3,
   "maxfadeouttime": 1.0,
   "minpanpos": 0.0,
   "maxpanpos": 0.0,
   "minpanduration": 10.0,
   "maxpanduration": 20.0,
   "repeatrecordings": false,
   "active": true,
   "start_with_silence": false,
   "banned_duration": 600,
   "tag_filters": [],
   "project_id": 9
 }] 
*/

class TrackOptions {
  constructor(audioData = {}) {
    this.volumeRange = [audioData.minvolume,audioData.maxvolume];
    this.duration = [audioData.minduration,audioData.maxduration];
    this.deadAir = [audioData.mindeadair,audioData.maxdeadair];
    this.fadeInTime = [audioData.minfadeintime,audioData.maxfadeintime];
    this.fadeOutTime = [audioData.minfadeouttime,audioData.maxfadeouttime];
    this.repeatRecordings = !!audioData.repeatrecordings;
    this.tags = audioData.tag_filters;
    this.bannedDuration = audioData.banned_duration || 600,
    this.startWithSilence = hasOwnProperty(audioData,'start_with_silence') ? !!audioData.start_with_silence : true;
    this.fadeOutWhenFiltered = hasOwnProperty(audioData,'fadeout_when_filtered') ? !!audioData.fadeout_when_filtered : true;
  }
}

export class PlaylistAudiotrack {
  constructor({ audioContext, audioData = {}, playlist }) {
    this.data = audioData;
    this.playlist = playlist;
    this.playing = false;

    this.id = audioData.id;

    this.trackOptions = new TrackOptions(audioData);
    
    const audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';

    audioElement.addEventListener('ended',() => {
      audioElement.src = '';
      if (this.playing) this.play(); // NOTE: makes play() recursive
    }); 

    const audioSrc = audioContext.createMediaElementSource(audioElement);
    audioSrc.connect(audioContext.destination);

    this.audioElement = audioElement;
  }

  async play() {
    const { playlist, audioElement } = this;

    if (audioElement.src === '' || audioElement.ended) {
      const asset = playlist.next(this);

      if (!asset) return;

      const { file: audioURL, id: assetId } = asset;

      audioElement.src = audioURL;
      this.currentAssetId = assetId;
    }

    const logline = `play ${this}: asset #${this.currentAssetId}`;
    console.log(logline);

    try {
      await audioElement.play();
      this.playing = true;
    } catch(err) {
      console.error(`Unable to ${logline}`,err);
    }
  }

  async pause() {
    if (!this.playing) return;

    console.log(`Pausing ${this}`);

    if (this.audioElement) await this.audioElement.pause();
    this.playing = false;
  }

  toString() {
    const { id } = this.data;
    return `PlaylistAudiotrack (Audiotrack ID #${id})`;
  }
}
