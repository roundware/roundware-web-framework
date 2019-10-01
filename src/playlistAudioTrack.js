import { hasOwnProperty, random } from './utils';
import {
  makeInitialTrackState,
  LoadingState,
} from './TrackStates';

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

  get randomFadeInDuration() {
    return Math.min(
      random(this.durationLowerBound,this.fadeInLowerBound),
      [this.durationUpperBound - this.durationLowerBound] / 2
    );
  }

  get durationLowerBound() {
    return this.duration[0];
  }

  get durationUpperBound() {
    return this.duration[1];
  }

  get fadeInLowerBound() {
    return this.fadeInTime[0];
  }

  get fadeInUpperBound() {
    return this.fadeInTime[1];
  }
}

const LOGGABLE_AUDIO_ELEMENT_EVENTS = [
  'abort',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'playing',
  'stalled',
  'waiting'
];

export class PlaylistAudiotrack {
  constructor({ audioContext, windowScope, audioData = {}, playlist }) {
    this.id = audioData.id;
    this.data = audioData;
    this.playlist = playlist;
    this.playing = false;
    this.trackOptions = new TrackOptions(audioData);
    this.windowScope = windowScope;
    
    const audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';

    const audioSrc = audioContext.createMediaElementSource(audioElement);
    const gainNode = audioContext.createGain();

    audioSrc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    LOGGABLE_AUDIO_ELEMENT_EVENTS.forEach(name => audioElement.addEventListener(name,() => console.log(`${this}: ${name}`)));

    audioElement.addEventListener('error',evt => console.warn('audio element error',evt));
    audioElement.addEventListener('ended',() => this.onAudioEnded());

    this.audioContext = audioContext;
    this.audioElement = audioElement;
    this.gainNode = gainNode;
    this.state = makeInitialTrackState(this,this.trackOptions);
  }

  onAudioEnded() {
    this.audioElement.src = '';
    console.log(`${this} audio ended`);
    delete this.currentAsset;

    const newState = new LoadingState(this,this.trackOptions);
    this.transition(newState);
  } 
  
  play() {
    this.state.start();
  }

  async playAsset(nextAsset,{ fadeInDuration, finalVolume }) {
    const { audioElement, gainNode, audioContext: { currentTime } } = this;
    const { file: audioURL } = nextAsset;

    audioElement.src = audioURL;

    const logline = `asset #${nextAsset.id}`;
    console.log('Playing',logline);
    gainNode.gain.exponentialRampToValueAtTime(0.001,currentTime);
    
    //console.info("CONSOLEDEBUG",{ currentTime, fadeInDuration, finalVolume });

    try {
      await audioElement.play();
      gainNode.gain.exponentialRampToValueAtTime(finalVolume,currentTime + fadeInDuration);
      this.currentAsset = nextAsset;
      return true;
    } catch(err) {
      delete this.currentAsset;
      console.error(`${this} unable to play`,this.currentAsset,err);
      return false;
    }
  }

  async pause() {
    console.log(`Pausing ${this}`);

    if (this.audioElement) await this.audioElement.pause();
  }

  transition(newState) {
    if (this.state && this.state.finish) this.state.finish();

    //console.info({ newState });
    this.state = newState;
    this.state.start();
  }

  nextAsset() {
    const asset = this.playlist.next(this);
    //console.log(`${this} next: ${asset}`);

    return asset;
  }

  toString() {
    const { id } = this.data;
    return `Audiotrack #${id}`;
  }
}
