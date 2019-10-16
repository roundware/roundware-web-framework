import { AssetEnvelope } from './mixer/AssetEnvelope';

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
  updateParams() {}

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
    const { timerId, timeRemainingMs, track: { trackId } } = this;

    if (timerId) return; // state is already active/playing

    if (timeRemainingMs) {
      const timeRemainingSecs = timeRemainingMs / 1000;
      console.log(`\t[Resuming track #${trackId} timer: next state in ${timeRemainingSecs.toFixed(1)}s]`);

      this.setNextStateTimer(timeRemainingMs);
      return timeRemainingSecs;
    }

    //console.log(`Playing track state ${this}: ${nextStateSecs}s`); 

    const nextStateMs = nextStateSecs * 1000;
    this.setNextStateTimer(nextStateMs);

    return nextStateSecs;
  }

  pause() {
    this.timeRemainingMs = this.clearTimer();
    console.log(`\t[Pausing track #${this.track.trackId} timer: next state in ${(this.timeRemainingMs / 1000).toFixed(1)}s`);
  }

  clearTimer() {
    const now = new Date;
    const { timerId, timerApproximateEndingAtMs = now, windowScope } = this;

    if (timerId) {
      windowScope.clearTimeout(timerId);

      delete this.timerId;
      delete this.timerApproximateEndingAtMs;

      const timeRemainingMs = Math.max(timerApproximateEndingAtMs - now.getTime(),0);
      return timeRemainingMs;
    }

    return 0;
  }

  finish() {
    this.clearTimer();
    delete this.timeRemainingMs;
  }

  setNextStateTimer(timeMs) {
    this.timerId = this.windowScope.setTimeout(() => this.setNextState(),timeMs);
    this.timerApproximateEndingAtMs = (new Date).getTime() + timeMs;
  }

  setNextState() {
    console.warn(`Track state '${this}' does not implement a next state`);
  }

  setLoadingState() {
    const { track, trackOptions } = this;
    const loadingState = new LoadingState(track,trackOptions);
    track.transition(loadingState);
  }

  updateParams() {}
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

  updateParams() {}
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
    this.track.pauseAudio();
  }

  setNextState() {
    const { track, trackOptions, assetEnvelope } = this;
    track.transition(new PlayingState(track,trackOptions,{ assetEnvelope }));
  }

  toString() {
    const { assetEnvelope: { fadeInDuration, assetId } } = this;
    return `FadingIn Asset #${assetId} (${fadeInDuration.toFixed(1)}s)`;
  }
}

class PlayingState extends TimedTrackState {
  constructor(track,trackOptions,{ assetEnvelope }) {
    super(track,trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  play() {
    const { track, assetEnvelope: { startFadingOutSecs } } = this;
    super.play(startFadingOutSecs);
    track.playAudio();
    //console.log(`Playing asset #${assetId} (start fading out: ${remainingSeconds.toFixed(1)}s)`);
  }

  pause() {
    super.pause();
    this.track.pauseAudio();
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

    if (track.fadeOut(remainingSeconds)) {
      track.playAudio();
    } else {
      this.setLoadingState();
    }
  }

  pause() {
    super.pause();
    this.track.pauseAudio();
  }

  setNextState() {
    this.track.transition(new DeadAirState(this.track,this.trackOptions,{ assetEnvelope: this.assetEnvelope }));
  }

  toString() {
    const { assetEnvelope: { assetId, fadeOutDuration } } = this;
    return `FadingOut asset #${assetId} (${fadeOutDuration.toFixed(1)}s)`;
  }
}

const DEFAULT_WAITING_FOR_ASSET_INTERVAL_SECONDS = 10;

class WaitingForAssetState extends TimedTrackState {
  constructor(track,trackOptions) {
    super(track,trackOptions);
  }

  play() {
    super.play(DEFAULT_WAITING_FOR_ASSET_INTERVAL_SECONDS);
  }

  updateParams(params = {}) {
    super.updateParams(params);
    this.finish(); // move to LoadingState in case new assets are available
    this.setLoadingState();
  }

  setNextState() {
    this.setLoadingState();
  }

  toString() {
    return `WaitingForAsset (${DEFAULT_WAITING_FOR_ASSET_INTERVAL_SECONDS}s)`;
  }
}

export const makeInitialTrackState = (track,trackOptions) => {
  const { startWithSilence } = trackOptions;

  const stateClass = startWithSilence ? DeadAirState : LoadingState;
  const newState = new stateClass(track,trackOptions);

  return newState;
};
