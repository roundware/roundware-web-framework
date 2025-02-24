import { IAudioContext, IStereoPannerNode } from "standardized-audio-context";
import { random } from "./utils";

export class AudioPanner {
  minpanpos: number;
  maxpanpos: number;
  minpanduration: number;
  maxpanduration: number;
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
    minpanpos: number = 0,
    maxpanpos: number = 0,
    minpanduration: number = 0,
    maxpanduration: number = 0,
    panNode: IStereoPannerNode<IAudioContext>,
    audioContext: IAudioContext
  ) {
    this.minpanpos = minpanpos;
    this.maxpanpos = maxpanpos;
    this.minpanduration = minpanduration;
    this.maxpanduration = maxpanduration;
    this.panNode = panNode;
    this.audioContext = audioContext;
    this.updateParams();
    this.panNode.pan.value = random(this.minpanpos, this.maxpanpos);
  }

  updateParams() {
    // when it's first time use random value for initial else use final
    this.finalPosition = random(this.minpanpos, this.maxpanpos);
    this.duration = random(this.minpanduration, this.maxpanduration);
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
