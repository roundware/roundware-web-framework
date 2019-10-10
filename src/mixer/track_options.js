import { hasOwnProperty, random } from '../utils';

export class TrackOptions {
  constructor(params = {}) {
    this.volumeRange = [params.minvolume,params.maxvolume];
    this.duration = [params.minduration,params.maxduration];
    this.deadAir = [params.mindeadair,params.maxdeadair];
    this.fadeInTime = [params.minfadeintime,params.maxfadeintime];
    this.fadeOutTime = [params.minfadeouttime,params.maxfadeouttime];
    this.repeatRecordings = !!params.repeatrecordings;
    this.tags = params.tag_filters;
    this.bannedDuration = params.banned_duration || 600,
    this.startWithSilence = hasOwnProperty(params,'start_with_silence') ? !!params.start_with_silence : true;
    this.fadeOutWhenFiltered = hasOwnProperty(params,'fadeout_when_filtered') ? !!params.fadeout_when_filtered : true;
  }

  get randomDeadAir() {
    return random(this.deadAirLowerBound,this.deadAirUpperBound);
  }

  get randomFadeInDuration() {
    return Math.min(
      random(this.fadeInLowerBound,this.fadeInUpperBound),
      this.durationHalfway
    );
  }

  get randomFadeOutDuration() {
    return Math.min(
      random(this.fadeOutLowerBound,this.fadeOutUpperBound),
      this.durationHalfway
    );
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
