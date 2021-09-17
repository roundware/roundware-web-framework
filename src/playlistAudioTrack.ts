import { IAudioContext, IGainNode } from "standardized-audio-context";
import { AudioPanner } from "./audioPanner";
import { RoundwareEvents } from "./events";
import { AssetEnvelope } from "./mixer/AssetEnvelope";
import { TrackOptions } from "./mixer/TrackOptions";
import { Playlist } from "./playlist";
import { Roundware } from "./roundware";
import { makeInitialTrackState } from "./TrackStates";
import { IMixParams } from "./types";
import { IDecoratedAsset } from "./types/asset";
import { IAudioTrackData } from "./types/audioTrack";
import { ITrackStates } from "./types/track-states";
import { debugLogger, getUrlParam, playlistTrackLog, timestamp } from "./utils";
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
export const LOGGABLE_AUDIO_ELEMENT_EVENTS = [
  "pause",
  "play",
  "playing",
  "waiting",
  "stalled",
  "about",
  "canplay",
  "canplaythrough",
  "ended",
  "error",
  "loadeddata",
  "loadstart",
]; // see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#Events

export const LOGGABLE_HOWL_EVENTS = [
  "load",
  "loaderror",
  "playerror",
  "play",
  "end",
  "pause",
  "stop",
  "mute",
  "volume",
  "rate",
  "seek",
  "fade",
  "unlock",
];

export class PlaylistAudiotrack {
  /**
   * id of audiotrack
   * @type {number}
   * @memberof PlaylistAudiotrack
   */
  trackId: number;

  timedAssetPriority: any;

  /**
   * @type {Playlist}
   * @memberof PlaylistAudiotrack
   */
  playlist: Playlist;
  playing: boolean;
  windowScope: Window;
  currentAsset: IDecoratedAsset | null;

  gainNode: IGainNode<IAudioContext>;

  trackOptions: TrackOptions;
  mixParams?: IMixParams;
  state?: ITrackStates;

  assetEnvelope?: AssetEnvelope;

  audioPanner: AudioPanner;
  audioData: IAudioTrackData;

  /**
   *
   * Logs asset events to roundware server
   * @type {RoundwareEvents}
   * @memberof PlaylistAudiotrack
   */
  listenEvents?: RoundwareEvents;
  soundId?: number;
  audioContext: IAudioContext;
  audioElement: HTMLAudioElement;
  constructor({
    audioContext,
    windowScope,
    audioData,
    playlist,
    client,
  }: {
    audioContext: IAudioContext;
    windowScope: Window;
    audioData: IAudioTrackData;
    playlist: Playlist;
    client: Roundware;
  }) {
    this.trackId = audioData.id;
    this.timedAssetPriority = audioData.timed_asset_priority;
    this.playlist = playlist;
    this.playing = false;
    this.windowScope = windowScope;
    this.listenEvents = client.events;
    this.currentAsset = null;
    this.audioData = audioData;

    const audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.loop = false;

    const audioSrc = audioContext.createMediaElementSource(audioElement);

    this.gainNode = audioContext.createGain();
    const panNode = audioContext.createStereoPanner();

    audioSrc
      .connect(panNode)
      .connect(this.gainNode)
      .connect(audioContext.destination);

    // LOGGABLE_AUDIO_ELEMENT_EVENTS.forEach((name) =>
    //   audioElement.addEventListener(name, () =>
    //     console.log(`\t[${this} audio ${name} event]`)
    //   )
    // );

    audioElement.addEventListener("error", () => this.onAudioError());
    audioElement.addEventListener("ended", () => this.onAudioEnded());

    const trackOptions = new TrackOptions(
      (param) => getUrlParam(windowScope.location.toString(), param),
      audioData
    );

    audioElement.addEventListener("playing", () => {
      if (this.playlist.playing === false) return this.pauseAudio();
      this.listenEvents?.logAssetStart(this.currentAsset?.id!);
      this.playing = true;
    });

    audioElement.addEventListener("pause", () => {
      this.playing = false;
      this.listenEvents?.logAssetEnd(this.currentAsset?.id!);
    });

    audioElement.addEventListener("end", () =>
      this.listenEvents?.logAssetEnd(this.currentAsset?.id!)
    );

    this.audioContext = audioContext;
    this.audioElement = audioElement;

    this.trackOptions = trackOptions;
    this.mixParams = { timedAssetPriority: audioData.timed_asset_priority };

    const { minpanpos, maxpanpos, minpanduration, maxpanduration } = audioData;
    this.audioPanner = new AudioPanner(
      minpanpos,
      maxpanpos,
      minpanduration,
      maxpanduration,
      panNode,
      audioContext
    );
    this.audioPanner.start();
    this.setInitialTrackState();
  }

  setInitialTrackState() {
    this.state = makeInitialTrackState(this, this.trackOptions);
  }

  onAudioError(evt?: any) {
    playlistTrackLog(`${this} audio error, skipping to next track`);
    this.setInitialTrackState();
  }

  onAudioEnded() {
    playlistTrackLog(`${this} audio ended event`);
  }

  play() {
    if (!this.state) return;
    this.state.play();
  }

  updateParams(params: IMixParams = {}) {
    this.mixParams = { ...this.mixParams, ...params };
    if (this.state) this.state.updateParams(this.mixParams);
  }

  // Halts any scheduled gain changes and holds at current level
  // @see https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelAndHoldAtTime
  holdGain() {
    this.gainNode.gain.cancelScheduledValues(0);
  }

  setZeroGain() {
    this.gainNode.gain.value = 0;
  }

  fadeIn(fadeInDurationSeconds: number): boolean {
    const currentAsset = this.currentAsset;
    if (!currentAsset || !currentAsset.volume) return false;

    const randomVolume = this.trackOptions.randomVolume;

    const finalVolume = randomVolume * currentAsset.volume;

    try {
      this.setZeroGain();
      this.rampGain(finalVolume, fadeInDurationSeconds);
      return true;
    } catch (err) {
      playlistTrackLog(`${this} unable to fadeIn`);
      return false;
    }
  }

  /**
   * Schedules a Fade out and returns true if success
   *
   * @param {number} fadeOutDurationSeconds
   * @return {*}  {boolean}
   * @memberof PlaylistAudiotrack
   */
  fadeOut(fadeOutDurationSeconds: number): boolean {
    if (
      fadeOutDurationSeconds >
      this.currentAsset?.audio_length_in_seconds! -
        this.audioElement.currentTime
    )
      fadeOutDurationSeconds =
        this.currentAsset?.audio_length_in_seconds! -
        this.audioElement.currentTime;
    return this.rampGain(0, fadeOutDurationSeconds);
  }

  rampGain(
    finalVolume: number,
    durationSeconds: number,
    rampMethod:
      | "exponentialRampToValueAtTime"
      | "linearRampToValueAtTime" = "linearRampToValueAtTime"
  ) {
    console.log(
      `\t[ramping gain from ${
        this.gainNode.gain.value
      } to ${finalVolume.toFixed(2)} (${durationSeconds.toFixed(
        1
      )}s - ${rampMethod})]`
    );

    try {
      this.gainNode.gain.setValueAtTime(
        this.gainNode.gain.value,
        this.audioContext.currentTime
      );
      this.gainNode.gain[rampMethod](
        finalVolume,
        this.audioContext.currentTime + durationSeconds
      );
      return true;
    } catch (err) {
      console.warn(`Unable to ramp gain ${this}`, err);
      return false;
    }
  }

  /**
   *This will perform cleanup, get next asset to play and update/set the `src` property to current audio
   *
   * @return {*}  {(IAssetData | null)}
   * @memberof PlaylistAudiotrack
   */
  loadNextAsset(): IDecoratedAsset | null {
    let { audioElement, currentAsset, trackOptions } = this;

    if (currentAsset) {
      if (!currentAsset.playCount) currentAsset.playCount = 1;
      else currentAsset.playCount++;
      currentAsset.lastListenTime = new Date();
    }

    const newAsset = this.playlist.next(this);

    this.currentAsset = newAsset || null;

    if (newAsset) {
      const { file, start_time } = newAsset;
      playlistTrackLog(`loading next asset ${this}: ${file}]`);

      this.assetEnvelope = new AssetEnvelope(trackOptions, newAsset);
      if (typeof file !== "string") {
        return null;
      }
      audioElement.src = file;
      audioElement.currentTime = start_time || 0.01;
      this.audioElement = audioElement;

      return newAsset;
    }

    return null;
  }

  pause() {
    playlistTrackLog(`${timestamp} pausing ${this}`);
    if (!this.state) return;
    this.state.pause();
    this.pauseAudio();
  }

  playAudio() {
    try {
      if (this.audioContext.state !== "running") this.audioContext.resume();
      this.audioElement.play();
    } catch (e) {
      console.error(e);
      this.setInitialTrackState();
      this.transition(this.state!);
    }
  }

  pauseAudio() {
    this.audioElement.pause();
  }

  /**
   *
   * Fade Out currently playing asset quickly and get nextAsset
   * @return {void}
   * @memberof PlaylistAudiotrack
   */
  skip(): void {
    if (!this.playlist.playing) {
      this.setInitialTrackState();
      return;
    }
    this.fadeOut(this.trackOptions.fadeOutLowerBound);
    setTimeout(() => {
      this.pauseAudio();
      this.listenEvents?.logAssetEnd(this.currentAsset?.id!);
      const newState = makeInitialTrackState(this, this.trackOptions);
      if (this.playlist.playing) this.transition(newState);
    }, this.trackOptions.fadeOutLowerBound * 1000);
  }

  replay() {
    const { state } = this;
    playlistTrackLog(`Replaying ${this}`);
    if (state) state.replay();
  }

  transition(newState: ITrackStates) {
    const {
      state,
      playlist: { elapsedTimeMs },
    } = this;

    playlistTrackLog(
      `${timestamp} ${this}: '${state}' ➜  '${newState}' (${(
        elapsedTimeMs / 1000
      ).toFixed(1)}s elapsed)`
    );

    if (!this.state) return;
    this.state.finish();
    this.state = newState;
    if (this.playlist.playing) this.state.play();
  }

  toString() {
    return `Track #${this.trackId}`;
  }
}
