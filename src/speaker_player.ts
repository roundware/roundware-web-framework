import {
  IAudioContext,
  IGainNode,
  IMediaElementAudioSourceNode,
} from "standardized-audio-context";
import { silenceAudioBase64 } from "./playlistAudioTrack";
import { cleanAudioURL, makeAudioSafeToPlay, speakerLog } from "./utils";

/**
 *
 * Basic audio utilities for playing speakers audio
 * @export
 * @class SpeakerPlayer
 */
export class SpeakerPlayer {
  private _prefetch: boolean;
  private _fadeDuration: number;
  audio: HTMLAudioElement;
  private _audioSrc: IMediaElementAudioSourceNode<IAudioContext>;
  private _gainNode: IGainNode<IAudioContext>;
  private _context: IAudioContext;
  playing: boolean = false;
  fading: boolean = false;
  private _id: number;
  private _isSafeToPlay = false;
  /**
   * Creates an instance of SpeakerPlayer.
   * @param {string} url URL of the audio
   * @memberof SpeakerPlayer
   */
  constructor(
    audioContext: IAudioContext,
    id: number,
    url: string,
    prefetch: boolean = true,
    fadingDurationInSeconds: number = 3
  ) {
    this._context = audioContext;
    this._id = id;
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    const cleanUrl = cleanAudioURL(url);
    this.audio.src = silenceAudioBase64;
    this.audio.loop = true;
    this.audio.preload = "auto";
    this.audio.autoplay = false;

    this._audioSrc = this._context.createMediaElementSource(this.audio);
    this._gainNode = this._context.createGain();

    this._audioSrc.connect(this._gainNode);
    this._gainNode.connect(this._context.destination);

    this._gainNode.gain.setValueAtTime(0, 0); // initially 0 and fade later

    makeAudioSafeToPlay(
      this.audio,
      () => (this._isSafeToPlay = true),
      cleanUrl
    );

    ["ended", "error", "pause"].forEach((e) => {
      this.audio.addEventListener(e, () => (this.playing = false));
    });
    this._prefetch = prefetch;
    this._fadeDuration = fadingDurationInSeconds;
  }

  async play() {
    if (!this._isSafeToPlay) return false;
    if (this.playing) return true;
    try {
      if (this._context.state !== "running") {
        await this._context.resume();
      }
      await this.audio.play();
      this.playing = true;
      speakerLog(`${this._id}: Speaker started! ${this.audio.src}`);
    } catch (e) {
      console.error(`Error playing speaker: ${this._id}`, e);
      return false;
    }
    return true;
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
    if (Math.abs(this.volume() - this._fadingDestination) < 0.01) return;

    if (!this.playing) {
      // schedule to fade when it starts playing.
      this.audio.addEventListener("playing", () => this.fade(), {
        once: true,
      });
      return;
    }

    this._gainNode.gain.cancelScheduledValues(0);
    this._fading = true;
    this._gainNode.gain.linearRampToValueAtTime(
      toVolume,
      this._context.currentTime + durationInSeconds
    );

    setTimeout(() => {
      speakerLog(`${this._id}: volume faded to "${this.volume()}""`);
      this._fading = false;
    }, durationInSeconds * 1000);
  }

  pause() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  fadeOutAndPause() {
    if (this.audio.paused) return;
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
}
