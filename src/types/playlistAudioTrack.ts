export interface IPlaylistAudiotrack {
  trackId: any;
  setInitialTrackState(): void;
  onAudioError(evt): void;
  onAudioEnded(): void;
  play(): void;
  updateParams(params: object): void;
  holdGain(): void;
  setZeroGain(): void;
  fadeIn(fadeInDurationSeconds: number): boolean;
  rampGain(finalVolume, durationSeconds, rampMethod): boolean;
  fadeOut(fadeOutDurationSeconds): boolean;
  loadNextAsset(): any;
  pause(): void;
  playAudio(): void;
  pauseAudio(): void;
  skip(): void;
  replay(): void;
  transition(newState): void;
  toString(): string;
}
