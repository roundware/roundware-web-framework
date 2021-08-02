export interface ITrackOptions {
  readonly randomVolume: number;
  readonly randomDeadAir: number;
  readonly randomFadeInDuration: number;
  readonly randomFadeOutDuration: number;
  readonly volumeRangeLowerBound: number;
  readonly volumeRangeUpperBound: number;
  readonly deadAirLowerBound: number;
  readonly deadAirUpperBound: number;
  readonly durationLowerBound: number;
  readonly durationUpperBound: number;
  readonly durationHalfway: number;
  readonly fadeInLowerBound: number;
  readonly fadeInUpperBound: number;
  readonly fadeOutLowerBound: number;
  readonly fadeOutUpperBound: number;
  readonly fadeOutMultiplier?: number;
  readonly startWithSilence?: boolean;
}
