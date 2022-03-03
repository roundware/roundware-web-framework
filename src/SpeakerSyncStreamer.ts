import {
  IAudioContext,
  IGainNode,
  IMediaElementAudioSourceNode,
} from "standardized-audio-context";
import { silenceAudioBase64 } from "./playlistAudioTrack";
import { SpeakerConfig } from "./types/roundware";
import { ISpeakerPlayer, SpeakerConstructor } from "./types/speaker";
import { cleanAudioURL, makeAudioSafeToPlay, speakerLog } from "./utils";

export type SpeakerState = "playing" | "waiting";
export class SpeakerSyncStreamer implements ISpeakerPlayer {
  isSafeToPlay: boolean = true;
  playing: boolean = false;
  audio: HTMLAudioElement;
  loaded: boolean;
  loadedPercentage: number;
  id: number;
  config: SpeakerConfig;
  uri: string;
  gainNode: IGainNode<IAudioContext>;
  mediaSource: IMediaElementAudioSourceNode<IAudioContext>;
  context: IAudioContext;
  state: SpeakerState;
  constructor({ audioContext, config, uri, id }: SpeakerConstructor) {
    this.id = id;
    this.config = config;
    this.uri = cleanAudioURL(uri, true);
    this.loaded = true;
    this.loadedPercentage = 100;
    this.context = audioContext;
    this.audio = new Audio(this.uri);
    this.audio.loop = config.loop || false;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;
    this.mediaSource = audioContext.createMediaElementSource(this.audio);
    this.mediaSource.connect(this.gainNode).connect(audioContext.destination);
    this.audio.preload = "auto";
    this.state = "waiting";
    const that = this;
    this.audio.addEventListener("playing", () => that.setState("playing"));
    this.audio.addEventListener("waiting", () => that.setState("waiting"));

    this.log(`sync streamer initiaed`);
  }

  started = false;

  async play(): Promise<boolean> {
    if (this.playing) return true;
    if (this.started) {
      // set gain to last paused
      this.gainNode.connect(this.context.destination);
      this.gainNode.gain.value = 1;
      this.playing = true;
      this.log(`Playing... ${this.audio.currentTime}`);
      return true;
    }
    try {
      await this.audio.play();
      this.log(`Started...`);
      this.started = true;
      return true;
    } catch (e) {
      console.error(`Failed to play`, e);
      return false;
    }
  }
  pause(): void {
    this.playing = false;
    this.gainNode.disconnect();
  }
  replay(): void {
    this.audio.currentTime = 0;
  }
  timerStart(): void {
    this.play();
  }
  timerStop(): void {
    this.pause();
  }
  fadingDestination = 0;
  fading = false;
  fade(destinationVolume?: number, duration: number = 3): void {
    // if (this.fadingDestination == destinationVolume && this.fading) {
    //   return;
    // }
    // if (typeof destinationVolume == "number") {
    //   this.fadingDestination = destinationVolume;
    // }

    // this.gainNode.gain.linearRampToValueAtTime(
    //   this.fadingDestination,
    //   this.context.currentTime + duration
    // );
    // setTimeout(() => {
    //   this.fading = false;
    // }, 3000);
    this.gainNode.gain.value = 1;
  }
  fadeOutAndPause(): void {
    this.fade(0);
  }
  log(string: string): void {
    speakerLog(`[${this.id}] ${string}`);
  }
  onLoadingProgress(callback: (newPercent: number) => void): void {}
  onEnd(callback: () => void): void {}
  updateTime(newTime: number): void {
    this.audio.currentTime = newTime;
  }

  stateCallback: (newState: SpeakerState) => void = () => {};
  onStateUpdate(callback: (newState: SpeakerState) => any) {
    this.stateCallback = callback;
  }
  setState(newState: "playing" | "waiting") {
    this.state = newState;
    this.stateCallback(this.state);
  }
}
