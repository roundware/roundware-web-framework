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
  private cleanUrl: string;
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
    this.cleanUrl = cleanAudioURL(url);
    this.audio.preload = "none";
    this.audio.src = silenceAudioBase64;
    this.audio.loop = true;
    this.audio.autoplay = false;

    this._audioSrc = this._context.createMediaElementSource(this.audio);
    this._gainNode = this._context.createGain();

    this._audioSrc.connect(this._gainNode);
    this._gainNode.connect(this._context.destination);

    this._gainNode.gain.setValueAtTime(0, 0); // initially 0 and fade later

    makeAudioSafeToPlay(
      this.audio,
      () => {
        this._isSafeToPlay = true;
      },
      this.cleanUrl
    );

    this.audio.addEventListener("playing", () => {
      if (!this._isSafeToPlay) return;
      this.playing = true;
      this.log(`Playing event`);
    });
    ["ended", "error", "pause", "about"].forEach((e) => {
      this.audio.addEventListener(e, () => {
        if (!this._isSafeToPlay) return;
        this.playing = false;
        this.log(`Pause event`);
      });
    });

    this.audio.addEventListener("load", () => {
      this.log(`loading audio...`);
    });
    this.audio.addEventListener("waiting", () => {
      this.log(`waiting to load... ${this.audio.src}`);
    });

    this._prefetch = prefetch;
    this._fadeDuration = fadingDurationInSeconds;
  }

  log(string: string) {
    this._isSafeToPlay && speakerLog(`${this._id}: ${string}`);
  }

  _alreadyTryingToPlay = false;
  async play() {
    // if not yet safe to play must retry again

    if (!this._isSafeToPlay) {
      this.log(`waiting for user iteraction`);
      return false;
    }
    if (this.audio.src == silenceAudioBase64) {
      this.audio.src = this.cleanUrl;
    }
    // previous promise wasn't resolved yet
    // if we again try to play() we might get
    // Play request was inturrupted by another play request error
    if (this._alreadyTryingToPlay) {
      this.log(`already trying to play`);
      return true;
    }
    if (this.playing) {
      speakerLog(`${this._id}: already playing at volume ${this.volume()}`);
      return true;
    }
    try {
      if (this._context.state !== "running") {
        await this._context.resume();
      }

      this._alreadyTryingToPlay = true;
      await this.audio.play();
      this._alreadyTryingToPlay = false;
      this._isSafeToPlay = true;
      this.playing = true;
      this.log(`Playing! Volume: ${this.volume()} ${this.audio.src}`);
      return true;
    } catch (e) {
      this._alreadyTryingToPlay = false;
      // @ts-ignore
      this.log(`failed to play ${e?.message}`);
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

    if (!this.playing || !this._isSafeToPlay) {
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
      `${this._id}: startng fade ${this.audio.volume} -> ${this._fadingDestination}`
    );
    this._gainNode.gain.cancelScheduledValues(0);
    this._fading = true;
    this._gainNode.gain.linearRampToValueAtTime(
      this._fadingDestination,
      this._context.currentTime + durationInSeconds
    );

    setTimeout(() => {
      speakerLog(`${this._id}: volume faded to "${this.volume()}""`);
      this._fading = false;
    }, durationInSeconds * 1000);
  }

  pause() {
    if (this.playing) {
      this.log(`pausing from track`);
      this.audio.pause();
    }
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
}
