import { IMixParams } from ".";

interface ICommonStateProperties {
  play: () => void;
  pause(): void;
  finish(): void;
  skip(): void;
  replay(): void;
  updateParams(mixParams: IMixParams): void;
  toString(): string;
}
export interface ILoadingState extends ICommonStateProperties {}

export interface ITimedTrackState extends ICommonStateProperties {
  play(nextStateSecs?: number): number | void;
  pause(): void;
  clearTimer(): any;
  finish(): void;
  setNextStateTimer(timeMs?: number): void;
  setNextState(): void;
  skip(): void;
  replay(): void;
  setLoadingState(): void;
  updateParams(mixParams: IMixParams): void;
}

export interface IDeadAirState extends ICommonStateProperties {
  play(): void;
  setNextState(): void;
  toString(): string;
  updateParams(mixParams: IMixParams): void;
}

export interface IFadingInState extends ICommonStateProperties {
  play(): void;
  pause(): void;
  setNextState(): void;
  toString(): string;
  updateParams(mixParams: IMixParams): void;
}

export interface IPlayingState extends ICommonStateProperties {
  play(): void;
  pause(): void;
  toString(): string;
  setNextState(): void;
  updateParams(mixParams: IMixParams): void;
}

export interface IFadingOutState extends ICommonStateProperties {
  play(): void;
  pause(): void;
  setNextState(): void;
  toString(): string;
  updateParams(mixParams: IMixParams): void;
}

export interface IWaitingForAssetState extends ICommonStateProperties {
  play(): void;
  updateParams(mixParams: IMixParams): void;
  setNextState(): void;
  toString(): string;
}

export type ITrackStates =
  | IPlayingState
  | ILoadingState
  | IWaitingForAssetState
  | IFadingInState
  | IFadingOutState
  | ITimedTrackState
  | IDeadAirState;
