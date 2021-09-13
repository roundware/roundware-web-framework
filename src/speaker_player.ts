import {
  IAudioContext,
  IGainNode,
  IMediaElementAudioSourceNode,
} from "standardized-audio-context";
import { buildAudioContext, cleanAudioURL, speakerLog } from "./utils";

/**
 *
 * Basic audio utilities for playing speakers audio
 * @export
 * @class SpeakerPlayer
 */
export class SpeakerPlayer {
  private _prefetch: boolean;
  private _fadeDuration: number;
  private _audio: HTMLAudioElement;
  private _audioSrc: IMediaElementAudioSourceNode<IAudioContext>;
  private _gainNode: IGainNode<IAudioContext>;
  private _context: IAudioContext;
  playing: boolean = false;
  fading: boolean = false;
  private _id: number;
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
    this._audio = new Audio();
    this._audio.crossOrigin = "anonymous";
    const cleanUrl = cleanAudioURL(url);
    this._audio.src = cleanUrl;
    this._audio.loop = true;
    this._audio.preload = "auto";

    this._audioSrc = this._context.createMediaElementSource(this._audio);
    this._gainNode = this._context.createGain();

    this._audioSrc.connect(this._gainNode);
    this._gainNode.connect(this._context.destination);

    this._gainNode.gain.setValueAtTime(0, 0); // initially 0 and fade later

    this._audio.addEventListener("play", () => (this.playing = true));
    this._audio.addEventListener("pause", () => (this.playing = false));

    this._prefetch = prefetch;
    this._fadeDuration = fadingDurationInSeconds;
  }

  async play() {
    // calling play() while already playing will cause distortion
    if (this.playing) return true;
    try {
      if (this._context.state !== "running") {
        await this._context.resume();
      }
      await this._audio.play();
      this.playing = true;
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  }

  _fadingDestination: number = 0;

  fade(
    toVolume: number = this._fadingDestination,
    durationInSeconds: number = this._fadeDuration
  ) {
    this._fadingDestination = toVolume;

    if (this.fading) return;

    // assume it's already at the expected volume,
    // because there's always a small difference in decimals as gain.value is not accurate.
    if (Math.abs(this.volume() - toVolume) < 0.05) return;

    if (!this.playing) {
      // schedule to fade when it starts playing.
      this._audio.addEventListener("play", () => this.fade(), { once: true });

      return;
    }

    if (this._audio.paused) return;

    this._gainNode.gain.cancelScheduledValues(0);

    this._gainNode.gain.linearRampToValueAtTime(
      toVolume,
      this._context.currentTime + durationInSeconds
    );

    setTimeout(() => {
      speakerLog(`${this._id}: volume faded to "${this.volume()}""`);
      this.fading = false;
    }, durationInSeconds * 1000);
  }

  pause() {
    if (!this._audio.paused) {
      this._audio.pause();
      this.playing = false;
    }
  }

  fadeOutAndPause() {
    if (this._audio.paused) return;
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
