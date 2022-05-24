import {
  IAudioContext,
  IGainNode,
  IMediaElementAudioSourceNode,
} from "standardized-audio-context";
import { SpeakerConfig } from "../types/roundware";
import { ISpeakerPlayer, SpeakerConstructor } from "../types/speaker";
import { cleanAudioURL, speakerLog } from "../utils";

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
  private _fadingTimeout?: NodeJS.Timeout;

  constructor({ audioContext, config, uri, id }: SpeakerConstructor) {
    this.id = id;
    this.config = config;
    this.uri = cleanAudioURL(uri);
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
    if (this.playing) return true;
    try {
      if (this.context.state !== "running") {
        await this.context.resume();
      }

      await this.audio.play();

      this.playing = true;

      if (!this.started) {
        global._roundwareSpeakerStartedAt = new Date();
        this.started = true;
      } else if (
        global._roundwareSpeakerPausedAt instanceof Date &&
        global._roundwareSpeakerStartedAt instanceof Date
      ) {
        const pausedTime =
          new Date().getTime() - global._roundwareSpeakerPausedAt.getTime();
        global._roundwareSpeakerStartedAt = new Date(
          global._roundwareSpeakerStartedAt.getTime() + pausedTime
        );
        global._roundwareSpeakerPausedAt = null;
      }

      this.log(`Playing...`);
    } catch (e) {
      console.error(e);
      this.playing = false;
    }
    return true;
  }

  pause(): void {
    this.playing = false;
    this.audio.pause();

    global._roundwareSpeakerPausedAt = new Date();
  }
  replay(): void {
    this.audio.currentTime = 0;
  }

  timerStart(): void {
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

  fade(toVolume: number = this.fadingDestination, duration: number = 3): void {
    if (this.fadingDestination == toVolume && this.fading) return;
    this.fadingDestination = toVolume;

    // already at that volume
    if (Math.abs(this.gainNode.gain.value - this.fadingDestination) < 0.05)
      return;
    this.log(
      `startng fade ${this.gainNode.gain.value} -> ${this.fadingDestination}`
    );
    this.gainNode.gain.cancelScheduledValues(0);

    this.gainNode.gain.linearRampToValueAtTime(
      this.fadingDestination,
      this.context.currentTime + duration
    );
    if (this._fadingTimeout) {
      clearTimeout(this._fadingTimeout);
    }
    this._fadingTimeout = setTimeout(() => {
      this.fading = false;
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
    const startedAt: Date = global._roundwareSpeakerStartedAt || new Date();
    if (!(startedAt instanceof Date)) return;
    if (!this.playing) return;

    const elapsedTime = new Date().getTime() - startedAt.getTime();
    if (elapsedTime > this.audio.duration * 1000) return;

    const audioTime = this.audio.currentTime * 1000;

    const difference = elapsedTime - audioTime;

    this.log(
      `Difference: ${difference} ms; Volume: ${this.gainNode.gain.value}`
    );
    if (Math.abs(difference) < (this.config.acceptableDelayMs || 50)) {
      // within acceptable range;
      this.audio.playbackRate = 1;
    } else if (Math.abs(difference) > (this.config.syncCheckInterval || 2500)) {
      // difference is too much; try to seek instead; seek bit ahead to compensate buffering time
      this.log(`Seeking to ${(elapsedTime + 500) / 1000}s`);
      this.audio.currentTime = (elapsedTime + 500) / 1000;

      this.audio.playbackRate = 1;
    } else {
      this.audio.playbackRate =
        1 + difference / (this.config.syncCheckInterval || 2500);
      this.log(`Changing Playback rate to ${this.audio.playbackRate}`);
    }
  }
}
