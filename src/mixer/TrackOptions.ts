import { IAudioTrackData } from "../types/audioTrack";
import { hasOwnProperty, random } from "../utils";

export class TrackOptions {
  volumeRange: number[];
  duration: number[];
  deadAir: number[];
  fadeInTime: number[];
  fadeOutTime: number[];
  repeatRecordings: boolean;
  tags: string[] | number[];
  bannedDuration: number;
  startWithSilence: boolean;
  fadeOutWhenFiltered: boolean;
  fadeOutMultiplier: number;
  constructor(
    urlParamLookup: (param: string) => string | number,
    params: IAudioTrackData
  ) {
    this.volumeRange = [params.minvolume, params.maxvolume];
    this.duration = [params.minduration, params.maxduration];
    this.deadAir = [params.mindeadair, params.maxdeadair];
    this.fadeInTime = [params.minfadeintime, params.maxfadeintime];
    this.fadeOutTime = [params.minfadeouttime, params.maxfadeouttime];
    this.repeatRecordings = !!params.repeatrecordings;
    this.tags = params.tag_filters;
    this.bannedDuration =
      typeof params.banned_duration != "number" ? 600 : params.banned_duration;
    this.startWithSilence = hasOwnProperty(params, "start_with_silence")
      ? !!params.start_with_silence
      : true;
    this.fadeOutWhenFiltered = hasOwnProperty(params, "fadeout_when_filtered")
      ? !!params.fadeout_when_filtered
      : true;
    this.fadeOutMultiplier = 1;

    const fadeOutMultiplierParam = urlParamLookup("rwfFadeOutMultiplier");

    if (fadeOutMultiplierParam) {
      this.fadeOutMultiplier = Number(fadeOutMultiplierParam);
      console.log("Applying fade-out multiplier", this.fadeOutMultiplier);
    }
  }

  get randomVolume() {
    return random(this.volumeRangeLowerBound, this.volumeRangeUpperBound);
  }

  get randomDeadAir() {
    return random(this.deadAirLowerBound, this.deadAirUpperBound);
  }

  get randomFadeInDuration() {
    return Math.min(
      random(this.fadeInLowerBound, this.fadeInUpperBound),
      this.durationHalfway
    );
  }

  get randomFadeOutDuration() {
    return Math.min(
      random(this.fadeOutLowerBound, this.fadeOutUpperBound),
      this.durationHalfway
    );
  }

  get volumeRangeLowerBound() {
    return this.volumeRange[0];
  }

  get volumeRangeUpperBound() {
    return this.volumeRange[1];
  }

  get deadAirLowerBound() {
    return this.deadAir[0];
  }

  get deadAirUpperBound() {
    return this.deadAir[1];
  }

  get durationLowerBound() {
    return this.duration[0];
  }

  get durationUpperBound() {
    return this.duration[1];
  }

  get durationHalfway() {
    return (this.durationUpperBound - this.durationLowerBound) / 2;
  }

  get fadeInLowerBound() {
    return this.fadeInTime[0];
  }

  get fadeInUpperBound() {
    return this.fadeInTime[1];
  }

  get fadeOutLowerBound() {
    return this.fadeOutTime[0];
  }

  get fadeOutUpperBound() {
    return this.fadeOutTime[1];
  }
}
