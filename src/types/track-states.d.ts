import { IMixParams } from ".";
import { PlaylistAudiotrack } from "../playlistAudioTrack";
import {
  DeadAirState,
  FadingInState,
  FadingOutState,
  LoadingState,
  PlayingState,
  TimedTrackState,
  WaitingForAssetState,
} from "../TrackStates";

interface ICommonStateProperties {
  track: PlaylistAudiotrack;
  timerApproximateEndingAtMs?: number;

  /**
   *Performs specific actions based on state, for example fading in, fading out, dead air
   *
   * @param {number} [nextStateSecs]
   * @return {*}  {(number | void)}
   * @memberof ICommonStateProperties
   */
  play(nextStateSecs?: number): number | void;

  pause(): void;
  /**
   *Performs cleanup before transitioning to new state
   *
   * @memberof ICommonStateProperties
   */
  finish(): void;
  skip(): void;
  replay(): void;
  updateParams(mixParams: IMixParams): void;
  toString(): string;
  clearTimer?(): any;
  setNextStateTimer?(timeMs?: number): void;
  setNextState?(): void;
  setLoadingState?(): void;
}

export type ITrackStates =
  | PlayingState
  | LoadingState
  | WaitingForAssetState
  | FadingInState
  | FadingOutState
  | TimedTrackState
  | DeadAirState;
