import { Howler } from "howler";
import { cleanAudioURL, speakerLog } from "./utils";

/**
 *
 * Basic audio utilities for playing speakers audio
 * @export
 * @class SpeakerPlayer
 */
export class SpeakerPlayer {
  _prefetch: boolean;
  _fadeDuration: number;
  _audio: HTMLAudioElement;
  _audioSrc: MediaElementAudioSourceNode;
  _gainNode: GainNode;

  playing: boolean = false;
  fading: boolean = false;
  /**
   * Creates an instance of SpeakerPlayer.
   * @param {string} url URL of the audio
   * @memberof SpeakerPlayer
   */
  constructor(
    url: string,
    prefetch: boolean = true,
    fadingDurationInSeconds: number = 3
  ) {
    // activates howler context
    Howler.mute(false);
    Howler.volume(1);

    this._audio = new Audio(cleanAudioURL(url));
    this._audio.crossOrigin = "anonymous";
    this._audio.loop = true;
    this._audio.preload = "none";

    this._audioSrc = Howler.ctx.createMediaElementSource(this._audio);
    this._gainNode = Howler.ctx.createGain();

    this._audioSrc.connect(this._gainNode);
    this._gainNode.connect(Howler.ctx.destination);

    this._gainNode.gain.value = 0; // initially 0 and fade later

    this._audio.addEventListener("play", () => (this.playing = true));
    this._audio.addEventListener("pause", () => (this.playing = false));
    this._prefetch = prefetch;
    this._fadeDuration = fadingDurationInSeconds;
  }

  play() {
    // calling play() while already playing will cause distortion
    if (this.playing) return true;
    try {
      this._audio.play().then(() => (this.playing = true));
    } catch (e) {
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
    if (Math.abs(this.volume() - toVolume) < 0.01) return;

    if (!this.playing) {
      // schedule to fade on it starts playing.
      this._audio.addEventListener("play", () => this.fade(), { once: true });
      return;
    }

    if (this._audio.paused) return;

    this._gainNode.gain.cancelScheduledValues(0);
    speakerLog(`fade started from ${this.volume()} to ${toVolume}`);
    this._gainNode.gain.linearRampToValueAtTime(
      toVolume,
      Howler.ctx.currentTime + durationInSeconds
    );
    setTimeout(() => {
      speakerLog(`fade ended at ${this.volume()}`);
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

    this.fade(0);
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
