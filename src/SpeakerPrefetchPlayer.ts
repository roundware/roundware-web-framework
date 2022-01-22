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
    if (this.playing) return true;

    this.gainNode.connect(this.context.destination);
    this.playing = true;
    return true;
  }

  startedAt = 0;
  pausedAt = 0;

  timerStart(): void {
    if (this.started || !this.buffer) {
      return;
    }

    // see timerStop() note
    this.initializeSource();
    if (!this.source) return;
    // start now will so stay in sync with other speakers, from last paused time
    this.source.start(this.context.currentTime, this.pausedAt);
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

    this.source.onended = this.endCallback;

    this.fade();
  }

  pause(): void {
    if (!this.playing) return;
    this.gainNode.disconnect();
    this.playing = false;
  }
  _fadingDestination = 0;
  _fading = false;
  fade(toVolume: number = this._fadingDestination, duration: number = 3): void {
    if (toVolume > 0.05) {
      // make sure souce connected to node
      this.play();
    }
    if (this._fadingDestination === toVolume && this._fading) return;
    this._fadingDestination = toVolume;

    // assume it's already at the expected volume,
    // because there's always a small difference in decimals as gain.value is not accurate.
    if (this._fadingDestination > 0.05) {
      // make sure souce connected to node
      this.play();
    }
    this.log(`startng fade ${this.volume} -> ${this._fadingDestination}`);
    this.gainNode.gain.cancelScheduledValues(0);
    this._fading = true;
    this.gainNode.gain.linearRampToValueAtTime(
      this._fadingDestination,
      this.context.currentTime + duration
    );

    setTimeout(() => {
      speakerLog(`volume faded to "${this.volume}""`);
      this._fading = false;
    }, duration * 1000);
  }
  fadeOutAndPause(): void {
    this.fade(0);
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
  }
}
