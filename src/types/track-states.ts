export interface ILoadingState {
  play(): void;
  pause(): void;
  finish(): void;
  skip(): void;
  replay(): void;
  updateParams(): void;
  toString(): string;
}

export interface ITimedTrackState {
  play(nextStateSecs: number): number | undefined;
  pause(): void;
  clearTimer(): any;
  finish(): void;
  setNextStateTimer(timeMs: number): void;
  setNextState(): void;
  skip(): void;
  replay(): void;
  setLoadingState(): void;
  updateParams(): void;
}

export interface IDeadAirState {
  play(): void;
  setNextState(): void;
  toString(): string;
  updateParams(): void;
}

export interface IFadingInState {
  play(): void;
  pause(): void;
  setNextState(): void;
  toString(): string;
}

export interface IPlayingState {
  play(): void;
  pause(): void;
  toString(): string;
  setNextState(): void;
}

export interface IFadingOutState {
  play(): void;
  pause(): void;
  setNextState(): void;
  toString(): string;
}

export interface IWaitingForAssetState {
  play(): void;
  updateParams(params: object): void;
  setNextState(): void;
  toString(): string;
}
