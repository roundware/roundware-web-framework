import {
  IAudioContext,
  IGainNode,
  IMediaElementAudioSourceNode,
} from "standardized-audio-context";
import { silenceAudioBase64 } from "../playlistAudioTrack";
import { SpeakerConfig } from "../types/roundware";
import { ISpeakerPlayer, SpeakerConstructor } from "../types/speaker";
import { cleanAudioURL, makeAudioSafeToPlay, speakerLog } from "../utils";

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
    this.audio.crossOrigin = "anonymous";
    this.audio.loop = false;
    this.mediaSource = audioContext.createMediaElementSource(this.audio);
    this.mediaSource.connect(this.gainNode).connect(audioContext.destination);
    this.audio.preload = "auto";

    const that = this;

    this.log(`sync streamer initiaed`);
  }

  started = false;

  async play(): Promise<boolean> {
    try {
      await this.audio.play();
      this.playing = true;
      this.log(`Playing...`);
    } catch (e) {
      console.error(e);
      this.playing = false;
    }
    return true;
  }
  pause(): void {
    this.audio.pause();
  }
  replay(): void {
    this.audio.currentTime = 0;
  }

  startedAt: Date | null = null;
  timerStart(): void {
    this.startedAt = new Date();
    this.syncTracker = Number(
      setInterval(() => {
        this.trackSync();
      }, this.config.syncCheckInterval || 2500)
    );
    this.play();
  }
  timerStop(): void {
    this.pause();
    clearInterval(this.syncTracker);
  }
  fadingDestination = 0;
  fading = false;
  fade(destinationVolume?: number, duration: number = 3): void {
    if (
      typeof destinationVolume != "number" ||
      (destinationVolume == this.fadingDestination && this.fading)
    )
      return;
    this.fadingDestination = destinationVolume;

    if (this.gainNode.gain.value < 0.05 && destinationVolume > 0.05) {
      this.log(`Connected ${this.gainNode.numberOfOutputs}`);
      this.gainNode.connect(this.context.destination);
    }
    this.fading = true;
    this.gainNode.gain.linearRampToValueAtTime(
      destinationVolume,
      this.context.currentTime + duration
    );
    const that = this;
    setTimeout(() => {
      if (that.gainNode.gain.value < 0.05) {
        that.gainNode.disconnect();
        that.log(`Disconnected`);
      }
      that.fading = false;
    }, duration * 1000);
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

  syncTracker?: number;
  trackSync() {
    if (!(this.startedAt instanceof Date)) return;
    if (!this.playing) return;

    const currentTime = new Date().getTime() - this.startedAt.getTime();
    if (currentTime > this.audio.duration * 1000) return;

    const audioTime = this.audio.currentTime * 1000;

    const difference = currentTime - audioTime;

    this.log(`Difference: ${difference} ms`);
    if (Math.abs(difference) < (this.config.acceptableDelayMs || 50)) {
      // within acceptable range;
      this.audio.playbackRate = 1;
    } else if (Math.abs(difference) > 1000) {
      // difference is too much; try to seek instead;
      this.audio.currentTime = currentTime / 1000;
      this.audio.playbackRate = 1;
    } else {
      this.audio.playbackRate =
        1 + difference / (this.config.syncCheckInterval || 2500);
      this.log(`Changing Playback rate to ${this.audio.playbackRate}`);
    }
  }
}
