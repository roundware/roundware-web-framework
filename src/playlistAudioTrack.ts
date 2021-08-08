import { getUrlParam, timestamp } from "./utils";
import { makeInitialTrackState } from "./TrackStates";
import { TrackOptions } from "./mixer/TrackOptions";
import { IAudioContext, IGainNode } from "standardized-audio-context";
import { IAssetData, IAudioData, IMixParams } from "./types";
import { IAudioTrackData } from "./types/audioTrack";
import { Playlist } from "./playlist";
import { ITrackStates } from "./types/track-states";
import { ITrackOptions } from "./types/mixer/TrackOptions";

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
const LOGGABLE_AUDIO_ELEMENT_EVENTS = [
  "pause",
  "play",
  "playing",
  "waiting",
  "stalled",
]; // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#Events
const NEARLY_ZERO = 0.01; // webaudio spec says you can't use 0.0 as a value due to floating point math concerns

export class PlaylistAudiotrack {
  trackId: number;
  timedAssetPriority: any;
  playlist: Playlist;
  playing: boolean;
  windowScope: Window;
  currentAsset: IAssetData | undefined;
  audioContext: IAudioContext;
  audioElement: HTMLAudioElement;
  gainNode: IGainNode<IAudioContext> | undefined;
  trackOptions: TrackOptions;
  mixParams: IMixParams;
  state: ITrackStates | undefined;
  constructor({
    audioContext,
    windowScope,
    audioData,
    playlist,
  }: {
    audioContext: IAudioContext;
    windowScope: Window;
    audioData: IAudioTrackData;
    playlist: Playlist;
  }) {
    this.trackId = audioData.id;
    this.timedAssetPriority = audioData.timed_asset_priority;
    this.playlist = playlist;
    this.playing = false;
    this.windowScope = windowScope;

    const audioElement = new Audio();

    audioElement.crossOrigin = "anonymous";
    audioElement.loop = false;

    const audioSrc = audioContext.createMediaElementSource(audioElement);
    const gainNode = audioContext.createGain();

    audioSrc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    LOGGABLE_AUDIO_ELEMENT_EVENTS.forEach((name) =>
      audioElement.addEventListener(name, () =>
        console.log(`\t[${this} audio ${name} event]`)
      )
    );

    audioElement.addEventListener("error", () => this.onAudioError());
    audioElement.addEventListener("ended", () => this.onAudioEnded());

    const trackOptions = new TrackOptions(
      (param) => getUrlParam(windowScope.location.toString(), param),
      audioData
    );

    this.audioContext = audioContext;
    this.audioElement = audioElement;
    this.gainNode = gainNode;
    this.trackOptions = trackOptions;
    this.mixParams = { timedAssetPriority: audioData.timed_asset_priority };

    this.setInitialTrackState();
  }

  setInitialTrackState() {
    this.state = makeInitialTrackState(this, this.trackOptions);
  }

  onAudioError(evt?: any) {
    console.warn(`\t[${this} audio error, skipping to next track]`, evt);
    this.setInitialTrackState();
  }

  onAudioEnded() {
    console.log(`\t[${this} audio ended event]`);
  }

  play() {
    console.log(`${timestamp} ${this}: ${this.state}`);
    if (!this.state)
      console.warn(`No Initial track state. call \`setInitialTrackState()\``);
    else this.state.play();
  }

  updateParams(params = {}) {
    this.mixParams = { ...this.mixParams, ...params };
    if (this.state) this.state.updateParams(this.mixParams);
    else console.warn(`State is undefined!`);
  }

  // Halts any scheduled gain changes and holds at current level
  // @see https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelAndHoldAtTime

  holdGain(): void {
    const {
      audioContext: { currentTime },
    } = this;

    this.gainNode?.gain.cancelScheduledValues(currentTime);
  }

  setZeroGain() {
    const {
      audioContext: { currentTime },
    } = this;
    this.gainNode?.gain.setValueAtTime(NEARLY_ZERO, currentTime); // http://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
  }

  // exponentialRampToValueAtTime sounds more gradual for fading in
  fadeIn(fadeInDurationSeconds: number): boolean {
    const currentAsset = this.currentAsset;
    if (!currentAsset || !currentAsset.volume) {
      console.warn(`currentAsset is undefined!`);
      return false;
    }

    const randomVolume = this.trackOptions.randomVolume;

    const finalVolume = randomVolume * currentAsset.volume;

    try {
      this.setZeroGain();
      this.playAudio();
      this.rampGain(finalVolume, fadeInDurationSeconds);
      return true;
    } catch (err) {
      this.currentAsset = undefined;
      console.warn(`${this} unable to play`, currentAsset, err);
      return false;
    }
  }

  rampGain(
    finalVolume: number,
    durationSeconds: number,
    rampMethod = "exponentialRampToValueAtTime"
  ) {
    const {
      audioContext: { currentTime },
    } = this;

    console.log(
      `\t[ramping ${this} gain to ${finalVolume.toFixed(
        2
      )} (${durationSeconds.toFixed(1)}s - ${rampMethod})]`
    );

    const gain = this.gainNode?.gain;
    if (!gain) return;
    try {
      gain.setValueAtTime(gain.value, currentTime); // http://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
      // @ts-ignore library failed to provide index signature
      gain[rampMethod](finalVolume, currentTime + durationSeconds);
      return true;
    } catch (err) {
      console.warn(`Unable to ramp gain ${this}`, err);
      return false;
    }
  }

  // linearRampToValueAtTime sounds more gradual for fading out
  fadeOut(fadeOutDurationSeconds: number) {
    return this.rampGain(
      NEARLY_ZERO,
      fadeOutDurationSeconds,
      "linearRampToValueAtTime"
    ); // 'exponentialRampToValueAtTime');
  }

  loadNextAsset(): IAssetData | false | null {
    const { audioElement, currentAsset } = this;
    if (
      !currentAsset ||
      !currentAsset.playCount ||
      !currentAsset.lastListenTime
    ) {
      console.warn(`currentAsset properties were undefined!`);
      return false;
    }
    if (currentAsset) {
      currentAsset.playCount++;
      currentAsset.lastListenTime = new Date();
    }

    const newAsset = this.playlist.next(this);
    this.currentAsset = newAsset;

    if (newAsset) {
      const { file, start } = newAsset;
      console.log(`\t[loading next asset ${this}: ${file}]`);

      if (typeof file == "string") {
        audioElement.src = file;
      }
      audioElement.currentTime = start! >= NEARLY_ZERO ? start! : NEARLY_ZERO; // value but must fininite

      this.audioElement = audioElement;

      return newAsset;
    }

    return null;
  }

  pause() {
    console.log(`${timestamp} pausing ${this}`);
    if (!this.state)
      return console.warn(`pause() was called on a undefined state!`);
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

  skip() {
    const { state } = this;
    console.log(`Skipping ${this}`);
    if (state) state.skip();
  }

  replay() {
    const { state } = this;
    console.log(`Replaying ${this}`);
    if (state) state.replay();
  }

  transition(newState: ITrackStates) {
    const {
      state,
      playlist: { elapsedTimeMs },
    } = this;

    console.log(
      `${timestamp} ${this}: '${state}' ➜  '${newState}' (${(
        elapsedTimeMs / 1000
      ).toFixed(1)}s elapsed)`
    );

    if (!this.state) return console.warn(`!current state was undefined`);
    this.state.finish();
    this.state = newState;
    this.state.play();
  }

  toString() {
    return `Track #${this.trackId}`;
  }
}
