import { AssetEnvelope } from './AssetEnvelope';
import { TrackOptions } from './TrackOptions';
import { IDecoratedAsset } from '../types/asset';
import { IAudioTrackData } from '../types/audioTrack';

describe('AssetEnvelope', () => {
  let mockTrackOptions: TrackOptions;
  let mockAsset: IDecoratedAsset;

  beforeEach(() => {
    const mockAudioTrackData: IAudioTrackData = {
      fadeout_when_filtered: true,
      id: 1,
      min_volume: 0,
      max_volume: 1,
      min_duration: 5,
      max_duration: 10,
      min_dead_air: 0,
      max_dead_air: 2,
      min_fade_in_time: 0,
      max_fade_in_time: 2,
      min_fade_out_time: 0,
      max_fade_out_time: 2,
      min_pan_pos: -1,
      max_pan_pos: 1,
      min_pan_duration: 1,
      max_pan_duration: 5,
      repeat_recordings: false,
      is_active: true,
      start_with_silence: true,
      banned_duration: 600,
      tag_filters: [],
      project_id: 1,
      timed_asset_priority: 'normal'
    };

    const mockUrlParamLookup = (param: string): string | number => {
      if (param === 'rwfFadeOutMultiplier') {
        return '1';
      }
      return '';
    };

    mockTrackOptions = new TrackOptions(mockUrlParamLookup, mockAudioTrackData);

    mockAsset = {
      id: 1,
      activeRegionLowerBound: 0,
      activeRegionUpperBound: 15,
      activeRegionLength: 15
    } as IDecoratedAsset;
  });

  test('should create AssetEnvelope with valid properties', () => {
    const envelope = new AssetEnvelope(mockTrackOptions, mockAsset);

    expect(envelope.assetId).toBe(1);
    expect(envelope.asset).toBe(mockAsset);
    expect(envelope.minDuration).toBe(mockTrackOptions.durationLowerBound);
    expect(envelope.maxDuration).toBe(mockTrackOptions.durationUpperBound);
    expect(envelope.duration).toBeGreaterThanOrEqual(mockTrackOptions.durationLowerBound);
    expect(envelope.duration).toBeLessThanOrEqual(mockTrackOptions.durationUpperBound);
    expect(envelope.fadeInDuration).toBeLessThanOrEqual(envelope.duration / 2);
    expect(envelope.fadeOutDuration).toBeLessThanOrEqual(envelope.duration / 2);
  });

  test('TrackOptions should initialize with correct values', () => {
    expect(mockTrackOptions.volumeRange).toEqual([0, 1]);
    expect(mockTrackOptions.duration).toEqual([5, 10]);
    expect(mockTrackOptions.deadAir).toEqual([0, 2]);
    expect(mockTrackOptions.fadeInTime).toEqual([0, 2]);
    expect(mockTrackOptions.fadeOutTime).toEqual([0, 2]);
    expect(mockTrackOptions.repeatRecordings).toBe(false);
    expect(mockTrackOptions.fadeOutWhenFiltered).toBe(true);
    expect(mockTrackOptions.startWithSilence).toBe(true);
    expect(mockTrackOptions.bannedDuration).toBe(600);
    expect(mockTrackOptions.fadeOutMultiplier).toBe(1);
  });

  test('TrackOptions should calculate random values within bounds', () => {
    const randomVolume = mockTrackOptions.randomVolume;
    expect(randomVolume).toBeGreaterThanOrEqual(mockTrackOptions.volumeRangeLowerBound);
    expect(randomVolume).toBeLessThanOrEqual(mockTrackOptions.volumeRangeUpperBound);

    const randomDeadAir = mockTrackOptions.randomDeadAir;
    expect(randomDeadAir).toBeGreaterThanOrEqual(mockTrackOptions.deadAirLowerBound);
    expect(randomDeadAir).toBeLessThanOrEqual(mockTrackOptions.deadAirUpperBound);

    const randomFadeIn = mockTrackOptions.randomFadeInDuration;
    expect(randomFadeIn).toBeGreaterThanOrEqual(mockTrackOptions.fadeInLowerBound);
    expect(randomFadeIn).toBeLessThanOrEqual(Math.min(mockTrackOptions.fadeInUpperBound, mockTrackOptions.durationHalfway));

    const randomFadeOut = mockTrackOptions.randomFadeOutDuration;
    expect(randomFadeOut).toBeGreaterThanOrEqual(mockTrackOptions.fadeOutLowerBound);
    expect(randomFadeOut).toBeLessThanOrEqual(Math.min(mockTrackOptions.fadeOutUpperBound, mockTrackOptions.durationHalfway));
  });

  test('toString should return correct format', () => {
    const envelope = new AssetEnvelope(mockTrackOptions, mockAsset);
    expect(envelope.toString()).toBe('AssetEnvelope #1');
  });

  test('start should be within valid range', () => {
    const envelope = new AssetEnvelope(mockTrackOptions, mockAsset);
    expect(envelope.start).toBeGreaterThanOrEqual(0);
    expect(envelope.start).toBeLessThanOrEqual(15 - envelope.duration);
  });

  test('startFadingOutSecs should be correctly calculated', () => {
    const envelope = new AssetEnvelope(mockTrackOptions, mockAsset);
    const expected = envelope.duration - envelope.fadeInDuration - envelope.fadeOutDuration;
    expect(envelope.startFadingOutSecs).toBe(expected);
  });
});
