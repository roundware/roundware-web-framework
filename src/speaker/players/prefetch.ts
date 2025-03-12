import {
  IAudioBuffer,
  IAudioBufferSourceNode,
  IAudioContext,
  IGainNode,
} from "standardized-audio-context";

import { SpeakerConfig } from "../../types/roundware";
import { ISpeakerPlayer, SpeakerConstructor } from "../../types/speaker";
import { NEARLY_ZERO, speakerLog } from "../../utils";

/**
 *
 * Basic audio utilities for playing speakers audio
 * @export
 * @class SpeakerPrefetchPlayer
 */
export class SpeakerPrefetchPlayer
  extends EventTarget
  implements ISpeakerPlayer
{
  mode: ISpeakerPlayer["mode"] = "prefetch";
  isSafeToPlay: boolean = true;
  playing: boolean = false;
  loaded = false;
  audio: HTMLAudioElement;
  source?: IAudioBufferSourceNode<IAudioContext>;
  id: number;
  gainNode: IGainNode<IAudioContext>;
  context: IAudioContext;
  config: SpeakerConfig;
  loadedPercentage = 0;

  buffer?: IAudioBuffer;

  isFetching = false;

  constructor({ audioContext, id, uri, config }: SpeakerConstructor) {
    super();
    this.log("SpeakerPrefetchPlayer constructor");

    this.audio = new Audio();
    this.id = id;
    this.context = audioContext;
    this.config = config;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = NEARLY_ZERO;

    var request = new XMLHttpRequest();

    request.open("GET", uri, true);
    request.timeout = Infinity;
    request.responseType = "arraybuffer";
    request.onprogress = (ev) => {
      this.loadedPercentage = Number(((ev.loaded / ev.total) * 100).toFixed(2));
      this.loadingCallback(this.loadedPercentage);
    };
    const speakerContext = this;

    this.isFetching = true;

    request.onload = function () {
      var audioData = request.response;

      audioContext.decodeAudioData(
        audioData,
        function (buffer) {
          speakerContext.isFetching = false;
          speakerContext.buffer = buffer;
          // @ts-ignore
          global._roundwareTotalAudioBufferSize +=
            buffer.length * buffer.numberOfChannels * 4;
          speakerContext.loaded = true;
          speakerContext.log(`loaded successfully`);
        },

        function (e) {
          speakerContext.log("Error with decoding audio data " + e.message);
        }
      );
    };

    request.send();
  }

  async fetch(): Promise<void> {}

  offload(): void {}

  lastStartedAtSeconds = 0;
  lastStartedAtTime = 0;
  async play(): Promise<boolean> {
    this.cancelFadeOutAndPause();
    if (!this.loaded || !this.source) {
      this.log(`not loaded or started yet`);
      this.initializeSource();
      return false;
    }
    if (this.playing) {
      this.fade();
      return true;
    }

    this.source.start(0, this.pausedAtSeconds);
    this.lastStartedAtSeconds = this.pausedAtSeconds;
    this.lastStartedAtTime = this.context.currentTime;
    this.log("playing...");

    this.gainNode.connect(this.context.destination);
    this.playing = true;
    return true;
  }

  replay() {
    this.playing = false;
    this.initializeSource();
    this.timerStart();
  }

  async timerStart() {
    // resume audio context if suspended
    if (this.context.state !== "running") {
      await this.context.resume();
    }

    if (!this.source) return;
    this.initializeSource();

    this.fade();
  }

  timerStop(): void {}

  initializeSource() {
    if (!this.buffer) return;
    // disconnect previous ones as we are going to create new
    this.gainNode.disconnect();
    this.source?.disconnect();

    // create new source
    this.source = this.context.createBufferSource();

    // buffer already downloaded from constructor
    this.source.buffer = this.buffer;

    if (this.config.loop) {
      this.source.loop = true;
      this.source.loopEnd = this.config.length || this.buffer.duration;
    } else {
      this.source.loop = false;
    }

    // connect to audio context
    this.source.connect(this.gainNode).connect(this.context.destination);

    this.fade();
  }

  pausedAtSeconds = 0;
  pause(): void {
    if (!this.playing) return;
    this.gainNode.disconnect();
    this.source?.stop();

    this.playing = false;

    const elapsedSeconds = this.context.currentTime - this.lastStartedAtTime;
    this.pausedAtSeconds = this.lastStartedAtSeconds + elapsedSeconds;

    this.source = undefined;
  }
  _fadingDestination = 0;
  _fading = false;
  _fadingTimeout: NodeJS.Timeout | null = null;
  fade(toVolume: number = this._fadingDestination, duration: number = 3): void {
    if (this._fadingDestination == toVolume && this._fading) return;
    this._fadingDestination = toVolume;
    if (!this.playing) {
      this.play();
    }

    // already at that volume
    if (Math.abs(this.volume - this._fadingDestination) < 0.05) return;
    this.log(`startng fade ${this.volume} -> ${this._fadingDestination}`);
    this.gainNode.gain.cancelScheduledValues(0);

    this.gainNode.gain.exponentialRampToValueAtTime(
      this._fadingDestination || NEARLY_ZERO,
      this.context.currentTime + duration
    );
    if (this._fadingTimeout) {
      clearTimeout(this._fadingTimeout);
    }
    this._fadingTimeout = setTimeout(() => {
      this._fading = false;
    }, duration * 1000);
  }

  _fadeOutAndPauseTimeout: NodeJS.Timeout | null = null;
  fadeOutAndPause(): void {
    if (!this.playing) return;
    this.fade(0);
    this.log(`fading out and pausing`);
    this._fadeOutAndPauseTimeout = setTimeout(() => {
      this.pause();
    }, 3000);
  }

  cancelFadeOutAndPause(): void {
    if (this._fadeOutAndPauseTimeout)
      clearTimeout(this._fadeOutAndPauseTimeout);
  }

  log(string: string): void {
    speakerLog(`${this.id}] ${string}`);
  }
  get volume() {
    return this.gainNode.gain.value;
  }
  loadingCallback = (number: number) => {};
  onLoadingProgress(callback: (newPercent: number) => void): void {
    this.loadingCallback = callback;
  }
  endCallback = () => {};
  onEnd(callback: () => void) {
    this.endCallback = callback;
    console.log(`callback set`);
  }
}
