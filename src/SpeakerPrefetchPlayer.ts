import {
  IAudioBuffer,
  IAudioBufferSourceNode,
  IAudioContext,
  IGainNode,
} from "standardized-audio-context";
import { SpeakerConfig } from "./types/roundware";
import { ISpeakerPlayer, SpeakerConstructor } from "./types/speaker";
import { speakerLog } from "./utils";

export class SpeakerPrefetchPlayer implements ISpeakerPlayer {
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

  constructor({ audioContext, id, uri, config }: SpeakerConstructor) {
    this.audio = new Audio();
    this.id = id;
    this.context = audioContext;
    this.config = config;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;

    var request = new XMLHttpRequest();

    request.open("GET", uri, true);
    request.timeout = Infinity;
    request.responseType = "arraybuffer";
    request.onprogress = (ev) => {
      this.loadedPercentage = Number(((ev.loaded / ev.total) * 100).toFixed(2));

      this.loadingCallback(this.loadedPercentage);
    };
    const speakerContext = this;
    request.onload = function () {
      var audioData = request.response;

      audioContext.decodeAudioData(
        audioData,
        function (buffer) {
          speakerContext.buffer = buffer;

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

  started = false;
  async play(): Promise<boolean> {
    if (!this.loaded || !this.started) {
      this.log(`not loaded or started yet`);
      return false;
    }
    if (this.playing) {
      this.fade();
      return true;
    }

    this.gainNode.connect(this.context.destination);
    this.playing = true;
    return true;
  }

  replay() {
    this.pausedAt = 0;
    this.playing = false;
    this.initializeSource();
    this.timerStart();
  }
  startedAt = 0;
  pausedAt = 0;

  get remainingDuration() {
    if (!this.buffer) return 0;
    return (this.config.length || this.buffer?.duration) - this.pausedAt;
  }

  endTimeout: NodeJS.Timeout | null = null;

  async timerStart() {
    if (this.started || !this.buffer) {
      return;
    }

    // see timerStop() note
    this.initializeSource();
    if (!this.source) return;

    // resume audio context if suspended
    if (this.context.state !== "running") {
      await this.context.resume();
    }
    // start now will so stay in sync with other speakers, from last paused time
    this.source.start(this.context.currentTime, this.pausedAt);

    if (this.endTimeout) {
      clearTimeout(this.endTimeout);
    }
    this.endTimeout = setTimeout(() => {
      this.endCallback();
      this.log(`speaker end`);
    }, this.remainingDuration * 1000);

    this.fade();
    this.startedAt = this.context.currentTime;
    this.started = true;
  }

  timerStop(): void {
    /**
     * note: we cant just stop the source and resume
     * start() and stop() are allow to called only once
     *
     * so need to
     * note the current time as paused time (incremented with previous paused times)
     * destroy current source
     * and next time needs to start, create new source
     * we can pass the already downloaded buffer
     * start with offset as last paused time
     */
    this.source?.stop();
    this.pausedAt += this.context.currentTime - this.startedAt;
    this.log(`next time will start from ${this.pausedAt}`);
    this.source = undefined;
    this.started = false;
    if (this.endTimeout) {
      clearTimeout(this.endTimeout);
    }
  }

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

    this.started = false;

    console.log(`init`);
    this.fade();
  }

  pause(): void {
    if (!this.playing) return;
    this.gainNode.disconnect();
    this.playing = false;
  }
  _fadingDestination = 0;
  _fading = false;
  _fadingTimeout: NodeJS.Timeout | null = null;
  fade(toVolume: number = this._fadingDestination, duration: number = 3): void {
    if (this._fadingDestination == toVolume && this._fading) return;
    this._fadingDestination = toVolume;
    if (!this.playing) return;

    // already at that volume
    if (Math.abs(this.volume - this._fadingDestination) < 0.05) return;
    this.log(`startng fade ${this.volume} -> ${this._fadingDestination}`);
    this.gainNode.gain.cancelScheduledValues(0);

    this.gainNode.gain.linearRampToValueAtTime(
      this._fadingDestination,
      this.context.currentTime + duration
    );
    if (this._fadingTimeout) {
      clearTimeout(this._fadingTimeout);
    }
    this._fadingTimeout = setTimeout(() => {
      this._fading = false;
    }, duration * 1000);
  }
  fadeOutAndPause(): void {
    if (!this.playing) return;
    this.fade(0);
    this.log(`fading out and pausing`);
    setTimeout(() => {
      this.pause();
    }, 3000);
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
