import {
  IAudioContext,
  IGainNode,
  IMediaElementAudioSourceNode,
} from "standardized-audio-context";
import { silenceAudioBase64 } from "../playlistAudioTrack";
import { SpeakerConfig } from "../types/roundware";
import { ISpeakerPlayer, SpeakerConstructor } from "../types/speaker";
import { cleanAudioURL, speakerLog } from "../utils";

/**
 *
 * Basic audio utilities for playing speakers audio
 * @export
 * @class SpeakerPlayer
 */
export class SpeakerStreamer implements ISpeakerPlayer {
  private _fadeDuration: number;
  audio: HTMLAudioElement;
  private _audioSrc: IMediaElementAudioSourceNode<IAudioContext>;
  private _gainNode: IGainNode<IAudioContext>;
  private _context: IAudioContext;
  playing: boolean = false;
  fading: boolean = false;
  id: number;
  private cleanUrl: string;
  isSafeToPlay = false;
  loaded: boolean = true;
  loadedPercentage: number = 100;
  config: SpeakerConfig;
  /**
   * Creates an instance of SpeakerPlayer.
   * @param {string} url URL of the audio
   * @memberof SpeakerPlayer
   */
  constructor({ audioContext, uri, id, config }: SpeakerConstructor) {
    this._context = audioContext;
    this.id = id;
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.cleanUrl = cleanAudioURL(uri, false);
    this.config = config;
    this.audio.preload = "none";
    this.audio.src = silenceAudioBase64;
    this.audio.load();
    this.audio.loop = true;
    this.audio.autoplay = false;

    this._audioSrc = this._context.createMediaElementSource(this.audio);
    this._gainNode = this._context.createGain();

    this._audioSrc.connect(this._gainNode);
    this._gainNode.connect(this._context.destination);

    this._gainNode.gain.value = 0; // initially 0 and fade later

    // -------------------------------------------
    // settings the play state
    this.audio.addEventListener("playing", () => {
      if (!this.isSafeToPlay) return;
      this.playing = true;
      this.log(`Playing event`);
    });
    ["ended", "error", "pause", "about"].forEach((e) => {
      this.audio.addEventListener(e, () => {
        if (!this.isSafeToPlay) return;
        this.playing = false;
        this.log(`Pause event`);
      });
    });
    // -------------------------------------------

    this.audio.addEventListener("load", () => {
      this.log(`loading audio...`);
    });
    this.audio.addEventListener("waiting", () => {
      this.log(`waiting to load... ${this.audio.src}`);
    });

    this._fadeDuration = 3;
  }

  log(string: string, force = false) {
    (this.isSafeToPlay || force) && speakerLog(`${this.id}: ${string}`);
  }

  _alreadyTryingToPlay = false;
  async play() {
    // if not yet safe to play must retry again

    if (!this.isSafeToPlay) {
      return false;
    }

    // previous promise wasn't resolved yet
    // if we again try to play() we might get
    // Play request was inturrupted by another play request error
    if (this._alreadyTryingToPlay) {
      return false;
    }
    if (this.playing) {
      return true;
    }
    try {
      if (this._context.state !== "running") {
        await this._context.resume();
      }

      this._alreadyTryingToPlay = true;
      await this.audio.play();

      this._alreadyTryingToPlay = false;
      this.isSafeToPlay = true;

      this.log(`Playing! Volume: ${this.volume()} ${this.audio.src}`);
      return true;
    } catch (e) {
      this._alreadyTryingToPlay = false;
      // @ts-ignore
      this.log(`failed to play, trying again. ${e?.message}`);

      return false;
    }
  }

  _fadingDestination: number = 0;
  _fading: boolean = false;
  fade(
    toVolume: number = this._fadingDestination,
    durationInSeconds: number = this._fadeDuration
  ) {
    if (this._fadingDestination === toVolume && this._fading) return;
    this._fadingDestination = toVolume;

    // assume it's already at the expected volume,
    // because there's always a small difference in decimals as gain.value is not accurate.
    if (Math.abs(this.volume() - this._fadingDestination) < 0.05) return;

    if (!this.playing || !this.isSafeToPlay) {
      console.log(`scheduled to fade on audio starts playing`);
      this.audio.addEventListener(
        "playing",
        () => {
          this.log(`fading...`);
          this.fade();
        },
        {
          once: true,
        }
      );

      // schedule to fade when it starts playing.
      return;
    }
    speakerLog(
      `${this.id}: startng fade ${this.audio.volume} -> ${this._fadingDestination}`
    );

    this._fading = true;
    this._gainNode.gain.linearRampToValueAtTime(
      this._fadingDestination,
      this._context.currentTime + durationInSeconds
    );

    setTimeout(() => {
      speakerLog(`${this.id}: volume faded to "${this.volume()}""`);
      this._fading = false;
    }, durationInSeconds * 1000);
  }

  pause() {
    if (this.playing) {
      this.log(`pausing from track`);
      this.audio.pause();
    }
    this.playing = false;
  }

  fadeOutAndPause() {
    if (!this.playing) return;
    if (this.volume() < 0.05) return this.pause();

    this._gainNode.gain.linearRampToValueAtTime(
      0,
      this._context.currentTime + this._fadeDuration
    );
    setTimeout(() => {
      // if audio was fading to something else
      // and couldn't managed to fade to 0 in 3 seconds, try again
      if (this.volume() > 0.05) this.fadeOutAndPause();
      else this.pause();
    }, this._fadeDuration * 1000);
  }
  volume() {
    return this._gainNode.gain.value;
  }

  started = false;
  timerStart(): void {
    if (this.started || this._alreadyTryingToPlay) return;
    const that = this;
    this.audio.src = silenceAudioBase64;
    this.started = true;

    this._alreadyTryingToPlay = true;
    this.audio.play().then(() => {
      that.audio.src = that.cleanUrl;
      this.audio.addEventListener(
        "loadedmetadata",
        () => {
          that.audio.currentTime = 0;
        },
        { once: true }
      );

      that.audio.pause();
      this._alreadyTryingToPlay = false;
      this.isSafeToPlay = true;
      that.log(`Safe to play`);
    });
  }
  timerStop(): void {}
  onLoadingProgress(callback: (newPercent: number) => void): void {
    callback(100);
  }

  onEnd(callback: () => void): void {
    this.audio.onended = callback;
  }
  replay(): void {
    this.audio.currentTime = 0;
  }
}
