import { 
  hasOwnProperty, 
  random 
} from './utils';

import {
  makeInitialTrackState,
  LoadingState,
} from './TrackStates';

const NEARLY_ZERO = 0.01; // webaudio spec says you can't use 0.0 as a value due to floating point math concerns

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


 asset looks like:

 {
  alt_text_loc_ids: []
  audio_length_in_seconds: 14.4
  created: "2019-03-13T20:09:34.237155"
  description: ""
  description_loc_ids: []
  end_time: 14.396
  envelope_ids: [6204]
  file: "https://prod.roundware.com/rwmedia/20190313-200933-43867.mp3"
  filename: "20190313-200933-43867.wav"
  id: 11511
  language_id: 1
  latitude: 42.4985662
  longitude: -71.2809467
  media_type: "audio"
  project_id: 27
  session_id: 43867
  shape: null
  start_time: 0
  submitted: true
  tag_ids: [290]
  updated: "2019-03-13T20:09:34.237155"
  user: null
  volume: 1
  weight: 50 
  }

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

  get randomDeadAir() {
    return random(this.deadAirLowerBound,this.deadAirUpperBound);
  }

  get randomFadeInDuration() {
    return Math.min(
      random(this.durationLowerBound,this.fadeInLowerBound),
      this.durationHalfway
    );
  }

  get randomFadeOutDuration() {
    return Math.min(
      random(this.fadeOutLowerBound,this.fadeOutUpperBound),
      this.durationHalfway
    );
  }

  get deadAirLowerBound() {
    return this.deadAir[0];
  }

  get deadAirUpperBound() {
    return this.deadAir[1];
  }

  get durationLowerBound() {
    return this.duration[0];
  }

  get durationUpperBound() {
    return this.duration[1];
  }

  get durationHalfway() {
    return (this.durationUpperBound - this.durationLowerBound) / 2;
  }

  get fadeInLowerBound() {
    return this.fadeInTime[0];
  }

  get fadeInUpperBound() {
    return this.fadeInTime[1];
  }

  get fadeOutLowerBound() {
    return this.fadeOutTime[0];
  }

  get fadeOutUpperBound() {
    return this.fadeOutTime[1];
  }
}

const LOGGABLE_AUDIO_ELEMENT_EVENTS = ['loadstart','playing','stalled','waiting']; // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#Events

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
    
    LOGGABLE_AUDIO_ELEMENT_EVENTS.forEach(name => audioElement.addEventListener(name,() => console.log(`${this}: audio ${name}`)));

    audioElement.addEventListener('error',() => this.onAudioError());
    audioElement.addEventListener('ended',() => this.onAudioEnded());

    this.audioContext = audioContext;
    this.audioElement = audioElement;
    this.gainNode = gainNode;
    this.state = makeInitialTrackState(this,this.trackOptions);
  }

  onAudioError() {
    console.warn(`${this} audio element error, skipping to next track`);
    const newState = new LoadingState(this,this.trackOptions);
    this.transition(newState);
  }

  onAudioEnded() {
    const { trackOptions, currentAsset } = this;

    console.log(`${this} audio ended`);

    currentAsset.playCount++;
    currentAsset.lastListenTime = new Date();
    delete this.currentAsset;

    const newState = new LoadingState(this,trackOptions);
    this.transition(newState);
  } 
  
  play() {
    console.log(`Starting ${this}: '${this.state}'`);
    this.state.start();
  }

  fadeOut(fadeOutDurationSeconds) {
    const { gainNode, audioContext: { currentTime } } = this;
    
    console.log(`Fading out ${this} for ${fadeOutDurationSeconds}`);

    try {
      gainNode.gain.exponentialRampToValueAtTime(NEARLY_ZERO,currentTime + fadeOutDurationSeconds);
      return true;
    } catch(err) {
      console.warn(`Unable to fade out ${this}`,err);
      return false;
    }
  }

  async playAsset(nextAsset,{ fadeInDuration, finalVolume }) {
    const { audioElement, gainNode, audioContext: { currentTime } } = this;
    const { file: audioURL } = nextAsset;

    audioElement.src = audioURL;

    const logline = `asset #${nextAsset.id}`;
    console.log(`Playing ${logline}, fading-in over ${fadeInDuration} seconds`);
    gainNode.gain.exponentialRampToValueAtTime(NEARLY_ZERO,currentTime);
    
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
    if (this.state) {
      console.log(`Finishing ${this.state}`);
      if (this.state.finish) this.state.finish();
    }

    this.state = newState;
    console.log(`Starting ${this.state}`);
    this.state.start();
  }

  nextAsset() {
    const asset = this.playlist.next(this);
    return asset;
  }

  toString() {
    const { id } = this.data;
    return `Audiotrack #${id}`;
  }
}
