import { IAudioContext, IStereoPannerNode } from "standardized-audio-context";
import { random } from "./utils";

export class AudioPanner {
  min_pan_pos: number;
  max_pan_pos: number;
  min_pan_duration: number;
  max_pan_duration: number;
  panPositionChangePerSecond?: number;
  finalPosition?: number;
  initialPosition?: number;
  duration?: number;
  currentPosition?: number;
  panningTowards?: string;
  timerId?: NodeJS.Timeout;
  panNode: IStereoPannerNode<IAudioContext>;
  audioContext: IAudioContext;
  constructor(
    min_pan_pos: number = 0,
    max_pan_pos: number = 0,
    min_pan_duration: number = 0,
    max_pan_duration: number = 0,
    panNode: IStereoPannerNode<IAudioContext>,
    audioContext: IAudioContext
  ) {
    this.min_pan_pos = min_pan_pos;
    this.max_pan_pos = max_pan_pos;
    this.min_pan_duration = min_pan_duration;
    this.max_pan_duration = max_pan_duration;
    this.panNode = panNode;
    this.audioContext = audioContext;
    this.updateParams();
    this.panNode.pan.value = random(this.min_pan_pos, this.max_pan_pos);
  }

  updateParams() {
    // when it's first time use random value for initial else use final
    this.finalPosition = random(this.min_pan_pos, this.max_pan_pos);
    this.duration = random(this.min_pan_duration, this.max_pan_duration);
    this.currentPosition = this.initialPosition;
  }

  start() {
    this.panNode.pan.linearRampToValueAtTime(
      this.finalPosition!,
      this.audioContext.currentTime + this.duration!
    );
    //  create a timeout loop function
    this.timerId = setTimeout(() => {
      this.updateParams();
      this.start();
    }, this.duration! * 1000);
  }

  clear() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}
