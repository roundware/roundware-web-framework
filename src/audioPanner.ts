import { Howl } from "howler";

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
  sound?: Howl;

  constructor(
    minpanpos: number = 0,
    maxpanpos: number = 0,
    minpanduration: number = 0,
    maxpanduration: number = 0
  ) {
    this.minpanpos = minpanpos;
    this.maxpanpos = maxpanpos;
    this.minpanduration = minpanduration;
    this.maxpanduration = maxpanduration;
    this.updateParams();
  }

  updateAudioInstance(howl: Howl) {
    this.clear();
    this.sound = howl;
  }

  calculatePerSecondChange() {
    this.panPositionChangePerSecond =
      (this.finalPosition! - this.initialPosition!) / this.duration!;
  }
  updateParams() {
    // when it's first time use random value for initial else use final
    if (this.finalPosition === undefined) {
      this.initialPosition = randomFromRange(this.minpanpos, this.maxpanpos);
    } else this.initialPosition = this.finalPosition;

    this.finalPosition = randomFromRange(this.minpanpos, this.maxpanpos);
    this.duration = randomFromRange(this.minpanduration, this.maxpanduration);
    this.currentPosition = this.initialPosition;

    this.calculatePerSecondChange();

    function randomFromRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
  }

  start() {
    if (this.initialPosition! > this.finalPosition!)
      this.panningTowards = "left";
    else this.panningTowards = "right";

    //  create a timeout loop function
    this.timerId = setTimeout(() => {
      this.sound!.stereo(this.currentPosition!);
      if (!this.sound?.playing()) return this.start();

      let isCompletelyPanned;
      // toward left means final position is lesser than initial
      // toward right means final position is greater than intiial
      if (this.panningTowards === `left`) {
        isCompletelyPanned = this.currentPosition! <= this.finalPosition!;
      } else isCompletelyPanned = this.currentPosition! >= this.finalPosition!;

      if (!isCompletelyPanned) {
        this.currentPosition! += this.panPositionChangePerSecond!;
        // keep ramping until it reaches final position
        this.start();
      } else {
        // now make current as initial and new random as final
        this.updateParams();
        this.start();
      }
    }, 1000);
  }

  clear() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}
