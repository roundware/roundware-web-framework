import { random } from './utils';

/**
 Common sequence of states:
 Silence => FadingIn => PlayingAsset => FadingOut => Silence
 */

export class LoadingState {
  constructor(track,trackOptions) {
    this.track = track;
    this.trackOptions = trackOptions;
    this.asset = null;
  }

  start() {
    let newState;
    const nextAsset = this.asset || this.track.nextAsset();

    if (nextAsset) {
      const activeRegionLength = nextAsset.activeRegionLength; // activeRegion.upperBound - next.activeRegion.lowerBound
      const { durationUpperBound, durationLowerBound } = this.trackOptions;

      const minDuration = Math.min(durationLowerBound,activeRegionLength);
      const maxDuration = Math.min(durationUpperBound,activeRegionLength);
      const duration = random(minDuration,maxDuration);

      const latestStart = nextAsset.activeRegionUpperBound - duration;
      const start = random(nextAsset.activeRegionLowerBound,latestStart);

      newState = new PlayingState(this.track,this.trackOptions,{ 
        asset: nextAsset,
        start, 
        duration 
      });

      this.asset = nextAsset;
    } else {
      newState = new WaitingForAssetState(this.track,this.trackOptions);
    }

    this.track.transition(newState);
  }

  toString() {
    return `LoadingState Track ${this.track.id}`;
  }
}

class TimedTrackState {
  constructor(track,trackOptions) {
    this.track = track;
    this.windowScope = track.windowScope;
    this.trackOptions = trackOptions;
    this.timerId = null;
  }

  setNextStateTimer(timeMs,nextStateArgs) {
    this.timerId = this.windowScope.setTimeout(() => {
      this.setNextState(nextStateArgs);
    },timeMs);
  }

  finish() {
    if (this.timerId) this.windowScope.clearTimeout(this.timerId);
    delete this.timerId;
  }

  setNextState() {
    console.warn(`Track state '${this}' does not implement a next state`);
  }

  setLoadingState() {
    this.track.transition(new LoadingState(this.track,this.trackOptions));
  }
}

class DeadAirState extends TimedTrackState {
  constructor(track,trackOptions) {
    super(track,trackOptions);
    this.deadAirSeconds = this.trackOptions.randomDeadAir;
  }
  
  start() {
    this.setNextStateTimer(this.deadAirSeconds * 1000);
  }

  setNextState() {
    console.log(`Moving ${this} from DeadAir to Loading`);
    this.setLoadingState();
  }

  toString() {
    return `DeadAirState Track ${this.track.id} (dead for ${this.deadAirSeconds.toFixed(1)} secs)`;
  }
}

class FadingOutState extends TimedTrackState {
  constructor(track,trackOptions,{ fadeOutDuration }) {
    super(track,trackOptions);
    this.fadeOutDuration = fadeOutDuration;
  }

  start() {
    const { track, fadeOutDuration } = this;

    if (track.fadeOut(fadeOutDuration)) {
      this.stateCompleteSeconds = fadeOutDuration * 1000;
      this.setNextStateTimer(this.stateCompleteSeconds * 1000);
    } else {
      this.setLoadingState();
    }
  }

  setNextState() {
    this.track.transition(new DeadAirState(this.track,this.trackOptions));
  }

  toString() {
    return `FadingOutState Track ${this.track.id}`;
  }
}

class PlayingState extends TimedTrackState {
  constructor(track,trackOptions,{ asset, start = 0, duration }) {
    super(track,trackOptions);
    this.asset = asset;
    this.startAt = start;
    this.duration = duration;
  }

  start() {
    const { 
      asset,
      track,
      duration,
      trackOptions: { 
        randomFadeInDuration: fadeInDuration,
        randomFadeOutDuration: fadeOutDuration 
      }
    } = this;

    const finalVolume = random(track.volume);

    if (track.playAsset(asset,{ fadeInDuration, finalVolume })) {
      const startFadingOutMs = (duration - fadeOutDuration) * 1000;
      this.setNextStateTimer(startFadingOutMs,fadeOutDuration);
    } else {
      this.setLoadingState(); // unable to play asset, so we try to load a new one
    }
  }

  toString() {
    return `PlayingState Track ${this.track.id} (${Math.round(this.duration.toFixed(1))} duration secs)`;
  }
  
  setNextState(fadeOutDuration) {
    const { track, trackOptions } = this;
    track.transition(new FadingOutState(track,trackOptions,{ fadeOutDuration }));
  }
}

const DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS = 10000;

class WaitingForAssetState extends TimedTrackState {
  start() {
    this.setNextStateTimer(DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS);
  }

  setNextState() {
    const { track, trackOptions } = this;
    const loadingState = new LoadingState(track,trackOptions);

    track.transition(loadingState);
  }

  toString() {
    const secs = (DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS / 1000).toFixed(1);
    return `WaitingForAssetState Track ${this.track.id} (wait for ${secs} secs)`;
  }
}

export const makeInitialTrackState = (track,trackOptions) => {
  const { startWithSilence } = trackOptions;

  const stateClass = startWithSilence ? DeadAirState : LoadingState;
  const newState = new stateClass(track,trackOptions);

  return newState;
};
