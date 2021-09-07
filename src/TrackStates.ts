import { AssetEnvelope } from "./mixer/AssetEnvelope";
import { TrackOptions } from "./mixer/TrackOptions";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { IMixParams } from "./types";
import { IDecoratedAsset } from "./types/asset";
import { ICommonStateProperties } from "./types/track-states";
import { debugLogger } from "./utils";

/**
 Common sequence of states:
                          (if asset not available)
              =>   =>   Loading     =>  WaitingForAsset (returns to Loading after 10s)
              ↑             ↓ (asset found)            
              ↑         FadingIn 
              ↑             ↓
              ↑         PlayingState
              ↑             ↓
              ↑         FadingOutState 
              ↑             ↓
              <=   <=   DeadAirState    
                        
                        
         => WaitingForAssetState 
 */

/**
 * When Asset not loaded
 * @implements {ICommonStateProperties}
 */
export class LoadingState implements ICommonStateProperties {
  track: PlaylistAudiotrack;
  trackOptions: TrackOptions;
  asset: IDecoratedAsset | null;
  constructor(track: PlaylistAudiotrack, trackOptions: TrackOptions) {
    track.clearEvents(); // clean any scheduled tasks
    this.track = track;
    this.trackOptions = trackOptions;
    this.asset = null;
  }

  /**
   * This will load next assets to play, and transiton to FadingInState or WaitingForAssetState if not asset if loaded
   */
  play() {
    const { track, trackOptions } = this;
    const asset = track.loadNextAsset();

    let newState: FadingInState | WaitingForAssetState;

    if (asset) {
      debugLogger("Asset Length: " + asset?.audio_length_in_seconds);
      const assetEnvelope = new AssetEnvelope(trackOptions, asset);
      newState = new FadingInState(track, trackOptions, { assetEnvelope });

      // wait for audio to load and seek to start time before playing

      this.track.audio?.once("seek", () => {
        this.track.transition(newState);
      });

      return;
    } else {
      newState = new WaitingForAssetState(track, trackOptions);
    }

    this.track.transition(newState);
  }

  pause() {}
  finish() {}
  skip() {}
  replay() {}
  updateParams() {}
  toString() {
    return "Loading";
  }
}

/**
 *
 *When asset is available
 */
export class TimedTrackState implements ICommonStateProperties {
  track: PlaylistAudiotrack;
  windowScope: Window;
  trackOptions: TrackOptions;
  timerId: null | number;
  timeRemainingMs?: number;
  timerApproximateEndingAtMs?: number;
  constructor(track: PlaylistAudiotrack, trackOptions: TrackOptions) {
    this.track = track;
    this.windowScope = track.windowScope;
    this.trackOptions = trackOptions;
    this.timerId = null;
  }
  /**
   * This will set a timer for next state
   * @param  {number=0} nextStateSecs
   * @returns number - seconds for nextState can be approximately called
   */
  play(nextStateSecs: number = 0): number | void {
    const {
      timerId,
      timeRemainingMs,
      track: { trackId },
    } = this;

    if (timerId || timeRemainingMs! > 1) {
      debugLogger("State already active, next state in " + timeRemainingMs);
      return; // state is already active/playing
    }
    if (timeRemainingMs) {
      // this means state was paused before
      const timeRemainingSecs = timeRemainingMs / 1000;
      console.log(
        `\t[Resuming track #${trackId} timer: next state in ${timeRemainingSecs.toFixed(
          1
        )}s]`
      );

      this.setNextStateTimer(timeRemainingMs);
      return timeRemainingSecs;
    }

    //console.log(`Playing track state ${this}: ${nextStateSecs}s`);

    const nextStateMs = nextStateSecs * 1000;
    this.setNextStateTimer(nextStateMs);

    return nextStateSecs;
  }
  /**
   */
  pause(): void {
    this.timeRemainingMs = this.clearTimer();
    console.log(
      `\t[Pausing track #${this.track.trackId} timer: next state in ${(
        this.timeRemainingMs / 1000
      ).toFixed(1)}s`
    );
  }

  clearTimer() {
    const now = new Date().getTime();
    const { timerId, timerApproximateEndingAtMs = now, windowScope } = this;

    if (timerId) {
      windowScope.clearTimeout(timerId);
      this.timerId = null;
      delete this.timerApproximateEndingAtMs;
      const timeRemainingMs = Math.max(timerApproximateEndingAtMs - now, 0);
      return timeRemainingMs;
    }

    return 0;
  }

  finish() {
    this.clearTimer();
    delete this.timeRemainingMs;
    this.track.clearEvents();
  }

  setNextStateTimer(timeMs: number) {
    this.timerId = this.windowScope.setTimeout(
      () => this.setNextState(),
      timeMs
    );
    this.timerApproximateEndingAtMs = new Date().getTime() + timeMs;
  }

  setNextState() {
    console.warn(`Track state '${this}' does not implement a next state`);
  }

  skip() {
    this.finish();
    this.setNextState();
  }

  replay() {}

  setLoadingState() {
    const { track, trackOptions } = this;
    const loadingState = new LoadingState(track, trackOptions);
    track.transition(loadingState);
  }

  updateParams(params: IMixParams) {}
}

/**
 *Plays silence and jumps to LoadingState
 */
export class DeadAirState
  extends TimedTrackState
  implements ICommonStateProperties
{
  deadAirSeconds: number;
  constructor(track: PlaylistAudiotrack, trackOptions: TrackOptions) {
    super(track, trackOptions);
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

export class FadingInState
  extends TimedTrackState
  implements ICommonStateProperties
{
  assetEnvelope: AssetEnvelope;
  constructor(
    track: PlaylistAudiotrack,
    trackOptions: TrackOptions,
    { assetEnvelope }: { assetEnvelope: AssetEnvelope }
  ) {
    super(track, trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  /**
   * Will fadeIn
   * @memberof FadingInState
   */
  play(): void {
    let {
      track,
      assetEnvelope: { fadeInDuration },
      trackOptions: { fadeInLowerBound, fadeInUpperBound },
    } = this;

    //if (!fadeInSecondsRemaining) return;

    const success = track.fadeIn(fadeInDuration);
    if (!success) return this.setLoadingState();
    this.track.audio?.once("play", () => {
      this.track.listenEvents?.logAssetStart(this.assetEnvelope.assetId);
      super.play(fadeInDuration);
    });
    // player failed to play audio
  }

  pause() {
    super.pause();
    this.track.pauseAudio();
  }

  setNextState() {
    const { track, trackOptions, assetEnvelope } = this;
    track.transition(new PlayingState(track, trackOptions, { assetEnvelope }));
  }

  toString() {
    const {
      assetEnvelope: { fadeInDuration, assetId },
    } = this;
    return `FadingIn Asset #${assetId} (${fadeInDuration.toFixed(1)}s)`;
  }

  replay() {}

  updateParams() {}
}

export class PlayingState
  extends TimedTrackState
  implements ICommonStateProperties
{
  assetEnvelope: AssetEnvelope;
  constructor(
    track: PlaylistAudiotrack,
    trackOptions: TrackOptions,
    { assetEnvelope }: { assetEnvelope: AssetEnvelope }
  ) {
    super(track, trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  play() {
    const {
      track,
      assetEnvelope: { startFadingOutSecs },
    } = this;
    super.play(startFadingOutSecs);
    track.playAudio();
  }

  pause() {
    super.pause();
    this.track.pauseAudio();
  }

  toString() {
    const {
      assetEnvelope: { assetId, startFadingOutSecs },
    } = this;
    return `Playing asset #${assetId} (${startFadingOutSecs.toFixed(1)}s)`;
  }

  setNextState() {
    const { track, trackOptions, assetEnvelope } = this;
    track.transition(
      new FadingOutState(track, trackOptions, { assetEnvelope })
    );
  }
}

export class FadingOutState
  extends TimedTrackState
  implements ICommonStateProperties
{
  assetEnvelope: AssetEnvelope;
  constructor(
    track: PlaylistAudiotrack,
    trackOptions: TrackOptions,
    { assetEnvelope }: { assetEnvelope: AssetEnvelope }
  ) {
    super(track, trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  play() {
    const {
      track,
      assetEnvelope: { fadeOutDuration },
    } = this;
    let remainingSeconds = super.play(fadeOutDuration);
    if (remainingSeconds < this.trackOptions.fadeOutLowerBound)
      remainingSeconds = this.trackOptions.fadeOutLowerBound;
    if (remainingSeconds > this.trackOptions.fadeOutUpperBound)
      remainingSeconds = this.trackOptions.fadeOutUpperBound;
    track.fadeOut(remainingSeconds || this.trackOptions.fadeInLowerBound);
  }
  pause() {
    super.pause();
    this.track.pauseAudio();
  }

  setNextState() {
    this.track.transition(new DeadAirState(this.track, this.trackOptions));
  }

  finish() {
    super.finish();
    this.track.listenEvents?.logAssetEnd(this.assetEnvelope.assetId);
  }

  toString() {
    const {
      assetEnvelope: { assetId, fadeOutDuration },
    } = this;
    return `FadingOut asset #${assetId} (${fadeOutDuration.toFixed(1)}s)`;
  }
}

const DEFAULT_WAITING_FOR_ASSET_INTERVAL_SECONDS = 10;

/**
 *
 * State when nextAsset is becoming `null`
 * Will wait for 10 seconds and move to LoadingState to check new assets can be loaded
 * Also if location is updated will automatically move to LoadingState
 * @implements {ICommonStateProperties}
 */
export class WaitingForAssetState
  extends TimedTrackState
  implements ICommonStateProperties
{
  constructor(track: PlaylistAudiotrack, trackOptions: TrackOptions) {
    super(track, trackOptions);
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

export const makeInitialTrackState = (
  track: PlaylistAudiotrack,
  trackOptions: TrackOptions
) => {
  const { startWithSilence } = trackOptions;

  const stateClass = startWithSilence ? DeadAirState : LoadingState;
  const newState = new stateClass(track, trackOptions);
  return newState;
};
