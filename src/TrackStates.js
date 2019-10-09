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

  play() {
    const { track, trackOptions } = this;
    const asset = track.loadNextAsset();
    
    let newState;

    if (asset) {
      const assetEnvelope = new AssetEnvelope(trackOptions,asset);
      newState = new FadingInState(track,trackOptions,{ assetEnvelope });
    } else {
      newState = new WaitingForAssetState(track,trackOptions);
    }

    this.track.transition(newState);
  }

  pause() {}
  finish() {}

  toString() {
    return 'Loading';
  }
}

class TimedTrackState {
  constructor(track,trackOptions) {
    this.track = track;
    this.windowScope = track.windowScope;
    this.trackOptions = trackOptions;
    this.timerId = null;
  }

  play(nextStateSecs = 0) {
    const { timerId, timeRemainingMs } = this;

    if (timerId) return; // state is already active/playing

    if (timeRemainingMs) {
      const timeRemainingSecs = timeRemainingMs / 1000;
      console.log(`Resuming track state ${this}: ${timeRemainingSecs.toFixed(1)}s remaining`);

      this.setNextStateTimer(timeRemainingMs);
      return timeRemainingSecs;
    }

    //console.log(`Playing track state ${this}: ${nextStateSecs}s`); 

    const nextStateMs = nextStateSecs * 1000;
    console.info(`\tNext state timer: ${nextStateSecs.toFixed(1)}s`);
    this.setNextStateTimer(nextStateMs);

    return nextStateSecs;
  }

  pause() {
    const { timerId, windowScope, timerApproximateEndingAt } = this;

    if (timerId) {
      windowScope.clearTimeout(timerId);
      this.timeRemainingMs = (new Date) - timerApproximateEndingAt;
      delete this.timerApproximateEndingAt;
    }
  }

  finish() {
    const { timerId, windowScope } = this;
    if (timerId) windowScope.clearTimeout(timerId);

    delete this.timerId;
    delete this.timeRemainingMs;
    delete this.timerApproximateEndingAt;
  }

  setNextStateTimer(timeMs) {
    this.timerId = this.windowScope.setTimeout(() => this.setNextState(),timeMs);
    this.timerApproximateEndingAt = (new Date).getTime() + timeMs;
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
  
  play() {
    super.play(this.deadAirSeconds);
  }

  setNextState() {
    this.setLoadingState();
  }

  toString() {
    return `DeadAir (${this.deadAirSeconds.toFixed(1)}s)`;
  }
}

class AssetEnvelope {
  constructor(trackOptions,asset) {
    this.trackOptions = trackOptions;
    this.asset = asset;
    this.assetId = asset.id;

    this.activeRegionLowerBound = asset.start_time;
    this.activeRegionUpperBound = asset.end_time;
    this.activeRegionLength = this.activeRegionUpperBound - this.activeRegionLowerBound;

    this.minDuration = Math.min(trackOptions.durationLowerBound,this.activeRegionLength);
    this.maxDuration = Math.min(trackOptions.durationUpperBound,this.activeRegionLength);
    this.duration = random(this.minDuration,this.maxDuration);

    this.latestStart = this.activeRegionUpperBound - this.duration;
    this.start = random(this.activeRegionLowerBound,this.latestStart);

    this.fadeInDuration = Math.min(trackOptions.randomFadeInDuration,this.duration / 2);
    this.fadeOutDuration = Math.min(trackOptions.randomFadeOutDuration,this.duration / 2);

    this.startFadingOutSecs = this.duration - this.fadeInDuration - this.fadeOutDuration;
  }

  toString() {
    const { asset: { id: assetId } } = this;

    const data = [
      'activeRegionLowerBound',
      'activeRegionUpperBound',
      'activeRegionLength',
      'minDuration',
      'maxDuration',
      'duration',
      'latestStart',
      'start',
      'fadeInDuration',
      'fadeOutDuration',
      'startFadingOutSecs'
    ].map(key => `${key}: ${this[key].toFixed(1)}`).join('; ');

    return `Asset #${assetId} envelope (${data})`;
  }
}

class FadingInState extends TimedTrackState {
  constructor(track,trackOptions,{ assetEnvelope }) {
    super(track,trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  play() {
    const { track, assetEnvelope: { fadeInDuration } } = this;
    const fadeInSecondsRemaining = super.play(fadeInDuration);

    if (!fadeInSecondsRemaining) return;

    const success = track.fadeIn(fadeInSecondsRemaining);

    if (!success) this.setLoadingState();
  }

  pause() {
    super.pause();
    this.track.holdGain();
  }

  setNextState() {
    const { track, trackOptions, assetEnvelope } = this;
    track.transition(new PlayingState(track,trackOptions,{ assetEnvelope }));
  }

  toString() {
    const { assetEnvelope: { fadeInDuration, fadeOutDuration, assetId, duration } } = this;
    return `FadingIn Asset #${assetId} (fade-in ${fadeInDuration.toFixed(1)}s, fade-out ${fadeOutDuration.toFixed(1)}s, total duration ${duration.toFixed(1)}s)`;
  }
}

class PlayingState extends TimedTrackState {
  constructor(track,trackOptions,{ assetEnvelope }) {
    super(track,trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  play() {
    const { assetEnvelope: { startFadingOutSecs } } = this;
    super.play(startFadingOutSecs);
    //console.log(`Playing asset #${assetId} (start fading out: ${remainingSeconds.toFixed(1)}s)`);
  }

  toString() {
    const { assetEnvelope: { assetId, startFadingOutSecs } } = this;
    return `Playing asset #${assetId} (${startFadingOutSecs.toFixed(1)}s)`;
  }
  
  setNextState() {
    const { track, trackOptions, assetEnvelope } = this;
    track.transition(new FadingOutState(track,trackOptions,{ assetEnvelope }));
  }
}

class FadingOutState extends TimedTrackState {
  constructor(track,trackOptions,{ assetEnvelope }) {
    super(track,trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  play() {
    const { track, assetEnvelope: { fadeOutDuration } } = this;
    const remainingSeconds = super.play(fadeOutDuration);

    if (!remainingSeconds) return;
    if (!track.fadeOut(remainingSeconds)) this.setLoadingState();
  }

  pause() {
    super.pause();
    this.track.holdGain();
  }

  setNextState() {
    this.track.transition(new DeadAirState(this.track,this.trackOptions,{ assetEnvelope: this.assetEnvelope }));
  }

  toString() {
    const { assetEnvelope: { assetId, fadeOutDuration } } = this;
    return `FadingOut asset #${assetId} (${fadeOutDuration.toFixed(1)}s)`;
  }
}

const DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS = 10000;

class WaitingForAssetState extends TimedTrackState {
  constructor(track,trackOptions) {
    super(track,trackOptions);
  }

  play() {
    super.play(DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS);
  }

  //wakeUp() {
    //this.finish();
    //this.setNextState();
  //}

  setNextState() {
    const { track, trackOptions } = this;
    const loadingState = new LoadingState(track,trackOptions);

    track.transition(loadingState);
  }

  toString() {
    const secs = (DEFAULT_WAITING_FOR_ASSET_INTERVAL_MILLISECONDS / 1000).toFixed(1);
    return `WaitingForAsset (${secs}s)`;
  }
}

export const makeInitialTrackState = (track,trackOptions) => {
  const { startWithSilence } = trackOptions;

  const stateClass = startWithSilence ? DeadAirState : LoadingState;
  const newState = new stateClass(track,trackOptions);

  return newState;
};
