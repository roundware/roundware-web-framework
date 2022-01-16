import {
  IAudioBuffer,
  IAudioBufferSourceNode,
  IAudioContext,
  IGainNode,
} from "standardized-audio-context";
import { ISpeakerPlayer } from "./types/speaker";
import { speakerLog } from "./utils";

export class SpeakerPrefetchPlayer implements ISpeakerPlayer {
  isSafeToPlay: boolean = true;
  playing: boolean = false;
  loaded = false;
  audio: HTMLAudioElement;
  source: IAudioBufferSourceNode<IAudioContext>;
  id: number;
  gainNode: IGainNode<IAudioContext>;
  context: IAudioContext;

  loadedPercentage = 0;

  buffer?: IAudioBuffer;

  constructor(audioContext: IAudioContext, id: number, uri: string) {
    this.audio = new Audio();
    this.id = id;
    this.context = audioContext;
    const source = audioContext.createBufferSource();
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0;
    var request = new XMLHttpRequest();
    source.loop = true;
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
          source.buffer = buffer;

          source.connect(speakerContext.gainNode);
          speakerContext.gainNode.connect(audioContext.destination);
          source.loop = true;
          speakerContext.loaded = true;
          speakerContext.log(`loaded successfully`);
        },

        function (e) {
          speakerContext.log("Error with decoding audio data " + e.message);
        }
      );
    };

    request.send();
    this.source = source;
  }

  started = false;
  async play(): Promise<boolean> {
    if (!this.loaded) {
      this.log(`not loaded yet`);
      return false;
    }

    if (this.playing) return true;
    this.playing = true;
    if (this.started) {
      this.gainNode.connect(this.context.destination);
      return true;
    }
    try {
      return true;
    } catch (e) {
      // @ts-ignore
      this.log(`error playing ${e.message}`);
      this.playing = false;
      return false;
    }
  }
  timerStart(): void {
    if (this.started) return;
    this.source.start();
    this.started = true;
  }
  timerStop(): void {
    // if (this.buffer) this.source.buffer = this.buffer;
  }
  pause(): void {
    if (!this.playing) return;
    this.gainNode.disconnect();
    this.playing = false;
  }
  _fadingDestination = 0;
  _fading = false;
  fade(toVolume: number = this._fadingDestination, duration: number = 3): void {
    if (this._fadingDestination === toVolume && this._fading) return;
    this._fadingDestination = toVolume;

    // assume it's already at the expected volume,
    // because there's always a small difference in decimals as gain.value is not accurate.
    if (Math.abs(this.volume - this._fadingDestination) < 0.05) return;

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
    this.log(`startng fade ${this.volume} -> ${this._fadingDestination}`);
    this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
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
}
