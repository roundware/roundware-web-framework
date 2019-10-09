import { 
  hasOwnProperty, 
  random,
  timestamp
} from './utils';

import { makeInitialTrackState } from './TrackStates';

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
  constructor(params = {}) {
    this.volumeRange = [params.minvolume,params.maxvolume];
    this.duration = [params.minduration,params.maxduration];
    this.deadAir = [params.mindeadair,params.maxdeadair];
    this.fadeInTime = [params.minfadeintime,params.maxfadeintime];
    this.fadeOutTime = [params.minfadeouttime,params.maxfadeouttime];
    this.repeatRecordings = !!params.repeatrecordings;
    this.tags = params.tag_filters;
    this.bannedDuration = params.banned_duration || 600,
    this.startWithSilence = hasOwnProperty(params,'start_with_silence') ? !!params.start_with_silence : true;
    this.fadeOutWhenFiltered = hasOwnProperty(params,'fadeout_when_filtered') ? !!params.fadeout_when_filtered : true;
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

//const LOGGABLE_AUDIO_ELEMENT_EVENTS = ['loadstart','playing','stalled','waiting']; // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#Events
//const LOGGABLE_AUDIO_ELEMENT_EVENTS = ['playing','stalled']; // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#Events

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
    audioElement.loop = false;

    const audioSrc = audioContext.createMediaElementSource(audioElement);
    const gainNode = audioContext.createGain();

    audioSrc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    //LOGGABLE_AUDIO_ELEMENT_EVENTS.forEach(name => audioElement.addEventListener(name,() => console.log(`[${this} audio ${name} event]`)));

    audioElement.addEventListener('error',() => this.onAudioError());
    audioElement.addEventListener('ended',() => this.onAudioEnded());

    this.audioContext = audioContext;
    this.audioElement = audioElement;
    this.gainNode = gainNode;

    this.setInitialTrackState();
  }

  setInitialTrackState() {
    this.state = makeInitialTrackState(this,this.trackOptions);
  }

  onAudioError(evt) {
    console.warn(`${this} audio error, skipping to next track`,evt);
    this.setInitialTrackState();
  }

  onAudioEnded() {
    console.log(`[${this} audio ended event]`);
  } 
  
  play() {
    console.log(`${timestamp} ${this}: ${this.state}`);
    this.state.play();
  }

  wakeUp() {
    if (this.state.wakeUp) this.state.wakeUp();
  }

  // Halts any scheduled gain changes and holds at current level
  // @see https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelAndHoldAtTime
  holdGain() {
    const { gainNode: { gain }, audioContext: { currentTime } } = this;
    gain.cancelAndHoldAtTime(currentTime);
  }

  fadeIn(fadeInDurationSeconds) {
    const { 
      currentAsset,
      audioElement, 
      gainNode: { gain }, 
      audioContext: { currentTime } 
    } = this;

    gain.value = NEARLY_ZERO;

    const finalVolume = random(currentAsset.volume);
    
    //const logline = `asset #${nextAsset.id}`;
    //console.log(`${timestamp} Fading-in ${this} asset ${currentAsset.id}: ${fadeInDurationSeconds.toFixed(1)}s`);
    //console.info("CONSOLEDEBUG",{ currentTime, fadeInDuration, finalVolume });

    try {
      audioElement.play();
      gain.exponentialRampToValueAtTime(finalVolume,currentTime + fadeInDurationSeconds);
      return true;
    } catch(err) {
      delete this.currentAsset;
      console.warn(`${this} unable to play`,currentAsset,err);
      return false;
    }
  }

  rampGain(finalVolume,durationSeconds) {
    const { gainNode, audioContext: { currentTime } } = this;
    
    try {
      gainNode.gain.exponentialRampToValueAtTime(finalVolume,currentTime + durationSeconds);
      return true;
    } catch(err) {
      console.warn(`Unable to ramp gain ${this}`,err);
      return false;
    }
  }

  fadeOut(fadeOutDurationSeconds) {
    return this.rampGain(NEARLY_ZERO,fadeOutDurationSeconds);
  }

  loadNextAsset() {
    const { audioElement, currentAsset } = this;

    if (currentAsset) {
      currentAsset.playCount++;
      currentAsset.lastListenTime = new Date();
    }

    const asset = this.playlist.next(this);
    this.currentAsset = asset;

    if (asset) {
      //console.log(`Loading next asset`,asset);
      audioElement.src = asset.file;
      return asset;
    } else {
      return null;
    }
  }

  pause() {
    console.log(`${timestamp} pausing ${this}`);
    this.state.pause();
    if (this.audioElement) this.audioElement.pause();
  }

  transition(newState) {
    console.log(`${timestamp} ${this}: '${this.state}' ➜  '${newState}'`);
    this.state.finish();
    this.state = newState;
    this.state.play();
  }

  toString() {
    const { id } = this.data;
    return `Track #${id}`;
  }
}
