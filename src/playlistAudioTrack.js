import { timestamp } from './utils';
import { makeInitialTrackState } from './TrackStates';
import { TrackOptions } from './mixer/track_options';

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

//const LOGGABLE_AUDIO_ELEMENT_EVENTS = ['loadstart','playing','stalled','waiting']; // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#Events
const LOGGABLE_AUDIO_ELEMENT_EVENTS = ['pause','play','playing','waiting','stalled']; // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#Events

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
    
    LOGGABLE_AUDIO_ELEMENT_EVENTS.forEach(name => audioElement.addEventListener(name,() => console.log(`\t[${this} audio ${name} event]`)));

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
    console.warn(`\t[${this} audio error, skipping to next track]`,evt);
    this.setInitialTrackState();
  }

  onAudioEnded() {
    console.log(`\t[${this} audio ended event]`);
  } 
  
  play() {
    console.log(`${timestamp} ${this}: ${this.state}`);
    this.state.play();
  }

  updateParams(params = {}) {
    this.state.updateParams(params);
  }

  // Halts any scheduled gain changes and holds at current level
  // @see https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelAndHoldAtTime
  holdGain() {
    const { gainNode: { gain }, audioContext: { currentTime } } = this;
    gain.cancelAndHoldAtTime(currentTime);
  }

  setZeroGain() {
    const { gainNode: { gain } } = this;
    gain.value = NEARLY_ZERO;
  }

  fadeIn(fadeInDurationSeconds) {
    const { currentAsset, trackOptions: { randomVolume }} = this;
    const finalVolume = randomVolume * currentAsset.volume;
    
    console.info(`Fading in #${currentAsset.id} to random volume ${finalVolume.toFixed(1)}`);

    try {
      this.setZeroGain();
      this.playAudio();
      this.rampGain(finalVolume,fadeInDurationSeconds);
      return true;
    } catch(err) {
      delete this.currentAsset;
      console.warn(`${this} unable to play`,currentAsset,err);
      return false;
    }
  }

  rampGain(finalVolume,durationSeconds,rampMethod = 'exponentialRampToValueAtTime') {
    const { gainNode: { gain }, audioContext: { currentTime } } = this;
    
    console.log(`ramping gain of ${this} to ${finalVolume.toFixed(1)} over ${durationSeconds.toFixed(1)} seconds (${rampMethod})`);

    try {
      gain[rampMethod](finalVolume,currentTime + durationSeconds);
      return true;
    } catch(err) {
      console.warn(`Unable to ramp gain ${this}`,err);
      return false;
    }
  }

  fadeOut(fadeOutDurationSeconds) {
    return this.rampGain(NEARLY_ZERO,fadeOutDurationSeconds,'linearRampToValueAtTime');
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

  playAudio() {
    if (this.audioElement) this.audioElement.play();
  }
  
  pauseAudio() {
    this.holdGain();
    if (this.audioElement) this.audioElement.pause();
  }

  transition(newState) {
    const { state, playlist: { elapsedTimeMs } } = this;

    console.log(`${timestamp} ${this}: '${state}' ➜  '${newState}' (${(elapsedTimeMs / 1000).toFixed(1)}s elapsed runtime)`);

    this.state.finish();
    this.state = newState;
    this.state.play();
  }

  toString() {
    const { id } = this.data;
    return `Track #${id}`;
  }
}
