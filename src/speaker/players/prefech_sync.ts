import {
  IAudioBuffer,
  IAudioBufferSourceNode,
  IAudioContext,
  IGainNode,
  IStereoPannerNode,
} from "standardized-audio-context";
import { SpeakerConfig } from "../../types/roundware";
import { ISpeakerPlayer, SpeakerConstructor } from "../../types/speaker";
import { NEARLY_ZERO, speakerLog } from "../../utils";
import { BufferEffectsProcessor } from "../buffer_effects_processor";

export class SpeakerPrefetchSyncPlayer
  extends EventTarget
  implements ISpeakerPlayer
{
  mode: ISpeakerPlayer["mode"] = "prefetch_sync";
  isSafeToPlay: boolean = true;
  playing: boolean = false;
  loaded = false;
  audio: HTMLAudioElement;
  source?: IAudioBufferSourceNode<IAudioContext>;
  id: number;
  gainNode: IGainNode<IAudioContext>;
  uri: string;
  // pan node
  panNode: IStereoPannerNode<IAudioContext>;
  context: IAudioContext;
  config: SpeakerConfig;
  loadedPercentage = 0;

  originalBuffer?: IAudioBuffer;
  currentBuffer?: IAudioBuffer;

  isFetching: boolean = false;

  constructor({ audioContext, id, uri, config }: SpeakerConstructor) {
    super();
    this.audio = new Audio();
    this.id = id;
    this.context = audioContext;
    this.config = config;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = NEARLY_ZERO;
    this.panNode = audioContext.createStereoPanner();
    this.panNode.pan.value = 0;
    this.uri = uri;
    this.fetch();
  }

  async fetch(): Promise<void> {
    const request = new XMLHttpRequest();
    this.isFetching = true;
    request.open("GET", this.uri, true);
    request.timeout = Infinity;
    request.responseType = "arraybuffer";
    request.onprogress = (ev) => {
      this.loadedPercentage = Number(((ev.loaded / ev.total) * 100).toFixed(2));

      this.loadingCallback(this.loadedPercentage);
    };
    const speakerContext = this;
    request.onload = function () {
      var audioData = request.response;

      speakerContext.context.decodeAudioData(
        audioData,
        function (buffer) {
          speakerContext.isFetching = false;

          speakerContext.originalBuffer = new BufferEffectsProcessor(
            buffer,
            speakerContext.context,
            speakerContext.config.effects || {}
          )
            .microFadeInAndOut()
            .delayAndClip()
            .reverbAndClip()
            .getBuffer();

          speakerContext.currentBuffer = speakerContext.originalBuffer;

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

  offload(): void {}

  started = false;
  async play(): Promise<boolean> {
    this.cancelFadeOutAndPause();
    if (!this.loaded || !this.started) {
      this.log(`not loaded or started yet`);
      return false;
    }
    if (this.playing) {
      this.fade();
      return true;
    }

    this.connectToDest();

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
    if (!this.currentBuffer) return 0;
    return (this.config.length || this.currentBuffer?.duration) - this.pausedAt;
  }

  endTimeout: NodeJS.Timeout | null = null;
  loopInterval: NodeJS.Timeout[] = [];

  async timerStart(offset?: number) {
    if (this.started || !this.currentBuffer) {
      return;
    }

    // see timerStop() note
    this.initializeSource();
    if (!this.source) return;

    // resume audio context if suspended
    if (this.context.state !== "running") {
      await this.context.resume();
    }

    if (this.loopInterval?.length) {
      this.loopInterval.forEach((i) => clearInterval(i));
      this.loopInterval = [];
    }

    // start now will so stay in sync with other speakers, from last paused time
    this.source.start(this.context.currentTime, offset || this.pausedAt);

    if (this.config.loop) {
      const finalDuration = this.config.length || this.currentBuffer.duration;
      this.log(`looping every ${finalDuration} seconds`);
      const that = this;
      if (this.pausedAt == 0) {
        this.loopInterval?.push(
          setInterval(() => {
            that.log(`looping`);
            that.dispatchEvent(new Event("loop"));
          }, finalDuration * 1000)
        );
      } else {
        this.log(`looping after ${finalDuration - this.pausedAt} seconds`);
        this.loopInterval?.push(
          setTimeout(() => {
            that.log(`looping`);
            that.dispatchEvent(new Event("loop"));
            that.loopInterval.push(
              setInterval(() => {
                that.log(`looping`);
                that.dispatchEvent(new Event("loop"));
              }, finalDuration * 1000)
            );
          }, finalDuration * 1000 - this.pausedAt * 1000)
        );
      }
    }

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
    this.loopInterval?.forEach((i) => clearInterval(i));
    this.loopInterval = [];
  }

  initializeSource() {
    if (!this.currentBuffer) return;
    // disconnect previous ones as we are going to create new
    this.disconnect();

    // create new source
    this.source = this.context.createBufferSource();

    this.source.buffer = this.currentBuffer;

    if (this.config.loop) {
      this.source.loop = true;
      this.source.loopEnd = this.config.length || this.currentBuffer.duration;
    } else {
      this.source.loop = false;
    }

    // connect to audio context
    this.connectToDest();

    this.started = false;

    console.log(`init`);
    this.fade();
  }

  connectToDest() {
    this.source
      ?.connect(this.gainNode)
      .connect(this.panNode)
      .connect(this.context.destination);
  }

  disconnect() {
    this.gainNode.disconnect();
    this.panNode.disconnect();
  }

  pause(): void {
    if (!this.playing) return;
    this.disconnect();
    this.playing = false;
  }
  _fadingDestination = 0;
  _fading = false;
  _fadingTimeout: NodeJS.Timeout | null = null;

  fade(toVolume: number = this._fadingDestination, duration: number = 3): void {
    if (this._fadingDestination === toVolume && this._fading) return;
    this._fadingDestination = toVolume;
    if (!this.playing) return;
    if (this._fadingTimeout) {
      clearTimeout(this._fadingTimeout);
    }
    this._fading = true;
    this.gainNode.gain.cancelAndHoldAtTime(this.context.currentTime);
    this.log(`startng fade ${this.volume} -> ${this._fadingDestination}`);
    this.gainNode.gain.exponentialRampToValueAtTime(
      this._fadingDestination || NEARLY_ZERO,
      this.context.currentTime + duration
    );

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

  updateBufferAndPlayNow(buffer: IAudioBuffer) {
    this.timerStop();
    this.currentBuffer = buffer;

    this.timerStart();
  }

  setPanPosition(pan: number) {
    this.panNode.pan.value = pan;
  }

  getOriginalBuffer() {
    return this.originalBuffer;
  }

  getRemainingSecondsUntilNextLoopPoint() {
    if (!this.currentBuffer) return 0;

    const currentDuration = this.currentBuffer.duration;

    // use modulas to get the remaining duration until next loop point;
    const nextLoopPointInSeconds =
      currentDuration -
      ((this.context.currentTime - this.startedAt) % currentDuration);

    // 0 - 0.1
    if (nextLoopPointInSeconds >= 0 && nextLoopPointInSeconds <= 0.1) {
      return 0;
    }

    // approximately currentDuration later (assume this is now!)
    if (Math.abs(nextLoopPointInSeconds - currentDuration) <= 0.1) {
      return 0;
    }

    return nextLoopPointInSeconds;
  }
}
