import { IAssetData } from ".";
import { ITrackStates } from "./track-states";

export interface IPlaylistAudiotrack {
  trackId: any;
  currentAsset: IAssetData | undefined;
  setInitialTrackState(): void;
  onAudioError(evt: any): void;
  onAudioEnded(): void;
  play(): void;
  updateParams(params: object): void;
  holdGain(): void;
  setZeroGain(): void;
  fadeIn(fadeInDurationSeconds: number): boolean;
  rampGain(
    finalVolume: number,
    durationSeconds: number,
    rampMethod: string
  ): boolean;
  fadeOut(fadeOutDurationSeconds: number): boolean;
  loadNextAsset(): any;
  pause(): void;
  playAudio(): void;
  pauseAudio(): void;
  skip(): void;
  replay(): void;
  transition(newState: ITrackStates): void;
  toString(): string;
}
