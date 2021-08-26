import { AssetEnvelope } from "./mixer/AssetEnvelope";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { IAssetData } from "./types";
import { IAssetEnvelope } from "./types/mixer/AssetEnvelope";
import { ITrackOptions } from "./types/mixer/TrackOptions";
import { ICommonStateProperties } from "./types/track-states";

/**
 Common sequence of states:
 Silence => FadingIn => PlayingAsset => FadingOut => Silence
 */

export class LoadingState implements ICommonStateProperties {
  track: PlaylistAudiotrack;
  trackOptions: ITrackOptions;
  asset: IAssetData | null;
  constructor(track: PlaylistAudiotrack, trackOptions: ITrackOptions) {
    this.track = track;
    this.trackOptions = trackOptions;
    this.asset = null;
  }

  async play() {
    const { track, trackOptions } = this;
    const asset = track.loadNextAsset();

    let newState;

    if (asset) {
      const assetEnvelope: IAssetEnvelope = new AssetEnvelope(
        trackOptions,
        asset
      );
      newState = new FadingInState(track, trackOptions, { assetEnvelope });
    } else {
      newState = new WaitingForAssetState(track, trackOptions);
    }

    await this.track.transition(newState);
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

export class TimedTrackState implements ICommonStateProperties {
  updateParams(params: {}) {}
  track: PlaylistAudiotrack;
  windowScope: Window;
  trackOptions: ITrackOptions;
  timerId: null | number;
  timeRemainingMs?: number;
  timerApproximateEndingAtMs?: number;
  constructor(track: PlaylistAudiotrack, trackOptions: ITrackOptions) {
    this.track = track;
    this.windowScope = track.windowScope;
    this.trackOptions = trackOptions;
    this.timerId = null;
  }
  /**
   * @param  {number=0} nextStateSecs
   * @returns number
   */
  async play(nextStateSecs: number = 0): Promise<number | void> {
    const {
      timerId,
      timeRemainingMs,
      track: { trackId },
    } = this;

    if (timerId) return; // state is already active/playing

    if (timeRemainingMs) {
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
    const now = new Date();
    const {
      timerId,
      timerApproximateEndingAtMs = now.getTime(),
      windowScope,
    } = this;

    if (timerId) {
      windowScope.clearTimeout(timerId);

      delete this.timerApproximateEndingAtMs;

      // @ts-ignore
      const timeRemainingMs = Math.max(
        timerApproximateEndingAtMs - now.getTime(),
        0
      );
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

  replay() {
    console.log("replay() not implemented yet");
  }

  setLoadingState() {
    const { track, trackOptions } = this;
    const loadingState = new LoadingState(track, trackOptions);
    track.transition(loadingState);
  }
}

export class DeadAirState
  extends TimedTrackState
  implements ICommonStateProperties
{
  deadAirSeconds: number;
  constructor(track: PlaylistAudiotrack, trackOptions: ITrackOptions) {
    super(track, trackOptions);
    this.deadAirSeconds = this.trackOptions.randomDeadAir;
  }

  async play() {
    await super.play(this.deadAirSeconds);
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
  assetEnvelope: IAssetEnvelope;
  constructor(
    track: PlaylistAudiotrack,
    trackOptions: ITrackOptions,
    { assetEnvelope }: { assetEnvelope: IAssetEnvelope }
  ) {
    super(track, trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  async play(): Promise<void> {
    const {
      track,
      assetEnvelope: { fadeInDuration },
    } = this;
    const fadeInSecondsRemaining = await super.play(fadeInDuration);

    if (!fadeInSecondsRemaining) return;

    const success = await track.fadeIn(fadeInSecondsRemaining);

    if (!success) this.setLoadingState();
  }

  pause() {
    super.pause();
    this.track.pauseAudio();
  }

  async setNextState() {
    const { track, trackOptions, assetEnvelope } = this;
    await track.transition(
      new PlayingState(track, trackOptions, { assetEnvelope })
    );
  }

  toString() {
    const {
      assetEnvelope: { fadeInDuration, assetId },
    } = this;
    return `FadingIn Asset #${assetId} (${fadeInDuration.toFixed(1)}s)`;
  }
}

export class PlayingState
  extends TimedTrackState
  implements ICommonStateProperties
{
  assetEnvelope: IAssetEnvelope;
  constructor(
    track: PlaylistAudiotrack,
    trackOptions: ITrackOptions,
    { assetEnvelope }: { assetEnvelope: IAssetEnvelope }
  ) {
    super(track, trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  async play() {
    const {
      track,
      assetEnvelope: { startFadingOutSecs },
    } = this;
    await super.play(startFadingOutSecs);
    await track.playAudio();
    //console.log(`Playing asset #${assetId} (start fading out: ${remainingSeconds.toFixed(1)}s)`);
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
  assetEnvelope: IAssetEnvelope;
  constructor(
    track: PlaylistAudiotrack,
    trackOptions: ITrackOptions,
    { assetEnvelope }: { assetEnvelope: IAssetEnvelope }
  ) {
    super(track, trackOptions);
    this.assetEnvelope = assetEnvelope;
  }

  async play() {
    const {
      track,
      assetEnvelope: { fadeOutDuration },
    } = this;
    const remainingSeconds = await super.play(fadeOutDuration);

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
    this.track.transition(new DeadAirState(this.track, this.trackOptions));
  }

  toString() {
    const {
      assetEnvelope: { assetId, fadeOutDuration },
    } = this;
    return `FadingOut asset #${assetId} (${fadeOutDuration.toFixed(1)}s)`;
  }
}

const DEFAULT_WAITING_FOR_ASSET_INTERVAL_SECONDS = 10;

export class WaitingForAssetState
  extends TimedTrackState
  implements ICommonStateProperties
{
  constructor(track: PlaylistAudiotrack, trackOptions: ITrackOptions) {
    super(track, trackOptions);
  }

  async play() {
    await super.play(DEFAULT_WAITING_FOR_ASSET_INTERVAL_SECONDS);
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
  trackOptions: ITrackOptions
) => {
  const { startWithSilence } = trackOptions;

  const stateClass = startWithSilence ? DeadAirState : LoadingState;
  const newState = new stateClass(track, trackOptions);

  return newState;
};
