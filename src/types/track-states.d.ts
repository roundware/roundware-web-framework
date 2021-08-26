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
  play(nextStateSecs?: number): Promise<number | void>;
  pause(): void;
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
