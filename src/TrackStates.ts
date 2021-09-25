import { ASSET_PRIORITIES, distanceRangesFilter } from "./assetFilters";
import { AssetEnvelope } from "./mixer/AssetEnvelope";
import { TrackOptions } from "./mixer/TrackOptions";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { IMixParams } from "./types";
import { IDecoratedAsset } from "./types/asset";
import { ICommonStateProperties } from "./types/track-states";
import { debugLogger, playlistTrackLog } from "./utils";

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

      this.track.pauseAudio();
      this.track.setZeroGain();
      this.track.audioElement.addEventListener(
        "playing",
        () => this.track.playlist.playing && this.track.transition(newState),
        { once: true }
      );
      this.track.playAudio();

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

    if (timerId) {
      return; // state is already active/playing
    }
    if (timeRemainingMs) {
      // this means state was paused before
      const timeRemainingSecs = timeRemainingMs / 1000;
      playlistTrackLog(
        `Resuming track #${trackId} timer: next state in ${timeRemainingSecs.toFixed(
          1
        )}s`
      );

      this.setNextStateTimer(timeRemainingMs);
      return timeRemainingSecs;
    }

    const nextStateMs = nextStateSecs * 1000;
    this.setNextStateTimer(nextStateMs);

    return nextStateSecs;
  }
  /**
   */
  pause(): void {
    this.timeRemainingMs = this.clearTimer();
    playlistTrackLog(
      `Pausing track #${this.track.trackId} timer: next state in ${(
        this.timeRemainingMs / 1000
      ).toFixed(1)}`
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

  // TODO:
  // 1. Check priority by `distanceRangesFilter` with new location
  // 2. If DISCARD && current asset is not finished then first fade out and pause
  // 3. Add the asset to pausedAsset
  updateParams(params: IMixParams) {
    const { track } = this;
    if (!track.audioData.fadeout_when_filtered) return;
    if (!track.currentAsset) return;
    // already fading out let it finish.
    if (track.state instanceof FadingOutState) return;

    const prioriy = distanceRangesFilter()(track.currentAsset, params);

    if (prioriy === ASSET_PRIORITIES.DISCARD) {
      // fade out and pause only if playing
      if (track.playing) {
        track.transition(
          new FadingOutState(track, this.trackOptions, {
            assetEnvelope: track.assetEnvelope!,
          })
        );
        track.currentAsset.status = "paused";
        track.currentAsset.pausedFromTrackId = track.trackId;
        track.pausedAssetId = track.currentAsset.id;
        console.log(
          `Scheduled to resume when listener comes back: #${track.currentAsset.id}`
        );
      }
    }
  }
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
    } = this;

    const fadeInSecondsRemaining = super.play(fadeInDuration);
    if (!fadeInSecondsRemaining) return;
    const success = track.fadeIn(fadeInSecondsRemaining);
    if (!success) return this.setLoadingState();
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

  updateParams(mixParams: IMixParams) {
    super.updateParams(mixParams);
  }
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

  updateParams(mixParams: IMixParams) {
    super.updateParams(mixParams);
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
      trackOptions: { fadeOutLowerBound },
    } = this;
    let remainingSeconds = super.play(fadeOutDuration);
    track.fadeOut(remainingSeconds || fadeOutLowerBound);
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
    if (this.track.currentAsset?.status === "paused")
      this.track.currentAsset!.resume_time =
        this.track.audioElement.currentTime;
    this.track.listenEvents?.logAssetEnd(this.assetEnvelope.assetId);
  }

  toString() {
    const {
      assetEnvelope: { assetId, fadeOutDuration },
    } = this;
    return `FadingOut asset #${assetId} (${fadeOutDuration.toFixed(1)}s)`;
  }

  updateParams(mixParams: IMixParams) {
    super.updateParams(mixParams);
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
