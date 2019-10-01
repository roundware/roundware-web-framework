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
    } else {
      newState = new WaitingForAssetState(this.track,this.trackOptions);
    }

    this.track.transition(newState);
  }
}

class PlayingState {
  constructor(track,trackOptions,{ asset, start = 0, duration }) {
    this.track = track;
    this.trackOptions = trackOptions;
    this.asset = asset;
    this.startAt = start;
    this.duration = duration;
  }

  async start() {
    const { 
      asset,
      track,
      trackOptions: { randomFadeInDuration: fadeInDuration } 
    } = this;

    const finalVolume = random(track.volume);

    if (!track.playAsset(asset,{ fadeInDuration, finalVolume })) {
      track.transition(new LoadingState(this.track,this.trackOptions));
    }
  }
}

const DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS = 10000;

class WaitingForAssetState {
  constructor(track,trackOptions) {
    this.track = track;
    this.windowScope = track.windowScope;
    this.trackOptions = trackOptions;
    this.timerId = null;
  }

  start() {
    this.timerId = this.windowScope.setTimeout(() => {
      const loadingState = new LoadingState(this.track,this.trackOptions);
      this.track.transition(loadingState);
    },DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS);
    console.log('Waiting for asset state started timer',this.timerId);
  }

  finish() {
    if (this.timerId) this.windowScope.clearTimeout(this.timerId);
    delete this.timerId;
  }
}

export const makeInitialTrackState = (track,trackOptions) => {
  //const { startWithSilence } = trackOptions;

  //const newState = 
  //this.startWithSilence ? 
  //new DeadAirState(this.track,this.trackOptions) : 
  //new LoadingState(this.track,this.trackOptions);

  const newState = new LoadingState(track,trackOptions);
  return newState;
};
