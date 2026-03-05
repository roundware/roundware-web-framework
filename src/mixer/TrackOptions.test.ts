import { TrackOptions } from './TrackOptions';
import { hasOwnProperty, random } from '../utils';
import { IAudioTrackData } from '../types/audioTrack';

// Mock the utils
jest.mock('../utils', () => ({
  hasOwnProperty: jest.fn(),
  random: jest.fn()
}));

describe('TrackOptions', () => {
  let mockUrlParamLookup: jest.Mock;
  let defaultParams: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    (hasOwnProperty as jest.Mock).mockImplementation(() => true);
    (random as jest.Mock).mockImplementation((min, max) => min);

    // Create mock function for urlParamLookup
    mockUrlParamLookup = jest.fn();

    // Default params for testing
    defaultParams = {
      min_volume: 0,
      max_volume: 1,
      min_duration: 10,
      max_duration: 30,
      min_dead_air: 1,
      max_dead_air: 5,
      min_fade_in_time: 2,
      max_fade_in_time: 4,
      min_fade_out_time: 2,
      max_fade_out_time: 4,
      repeat_recordings: true,
      tag_filters: ['tag1', 'tag2'],
      banned_duration: 300,
      start_with_silence: true,
      fadeout_when_filtered: true,
      min_pan_pos: -1,
      max_pan_pos: 1,
      min_pan_duration: 1,
      max_pan_duration: 5,
      is_active: true,
      project_id: 1,
      timed_asset_priority: "normal"
    };
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const trackOptions = new TrackOptions(mockUrlParamLookup, defaultParams);

      expect(trackOptions.volumeRange).toEqual([0, 1]);
      expect(trackOptions.duration).toEqual([10, 30]);
      expect(trackOptions.deadAir).toEqual([1, 5]);
      expect(trackOptions.fadeInTime).toEqual([2, 4]);
      expect(trackOptions.fadeOutTime).toEqual([2, 4]);
      expect(trackOptions.repeatRecordings).toBe(true);
      expect(trackOptions.tags).toEqual(['tag1', 'tag2']);
      expect(trackOptions.bannedDuration).toBe(300);
      expect(trackOptions.startWithSilence).toBe(true);
      expect(trackOptions.fadeOutWhenFiltered).toBe(true);
      expect(trackOptions.fadeOutMultiplier).toBe(1);
    });

    it('should set default bannedDuration when not provided as number', () => {
      const params = { ...defaultParams, banned_duration: '600' };
      const trackOptions = new TrackOptions(mockUrlParamLookup, params);
      expect(trackOptions.bannedDuration).toBe(600);
    });

    it('should apply fadeOutMultiplier from URL params', () => {
      mockUrlParamLookup.mockReturnValue('2.5');
      const trackOptions = new TrackOptions(mockUrlParamLookup, defaultParams);
      expect(trackOptions.fadeOutMultiplier).toBe(2.5);
    });
  });

  describe('getters', () => {
    let trackOptions: TrackOptions;

    beforeEach(() => {
      trackOptions = new TrackOptions(mockUrlParamLookup, defaultParams);
    });

    it('should return correct random volume', () => {
      expect(trackOptions.randomVolume).toBe(0);
      expect(random).toHaveBeenCalledWith(0, 1);
      // Added expect statement to ensure mock is called with the correct bounds
      expect(random).toHaveBeenCalledWith(defaultParams.min_volume, defaultParams.max_volume);
    });

    it('should return correct random dead air', () => {
      expect(trackOptions.randomDeadAir).toBe(1);
      expect(random).toHaveBeenCalledWith(1, 5);
      // Added expect statement to ensure mock is called with the correct bounds
      expect(random).toHaveBeenCalledWith(defaultParams.min_dead_air, defaultParams.max_dead_air);
    });

    it('should return correct random fade in duration', () => {
      expect(trackOptions.randomFadeInDuration).toBe(2);
      expect(random).toHaveBeenCalledWith(2, 4);
      // Added expect statement to ensure mock is called with the correct bounds
      expect(random).toHaveBeenCalledWith(defaultParams.min_fade_in_time, defaultParams.max_fade_in_time);
    });

    it('should return correct random fade out duration', () => {
      expect(trackOptions.randomFadeOutDuration).toBe(2);
      expect(random).toHaveBeenCalledWith(2, 4);
       // Added expect statement to ensure mock is called with the correct bounds
       expect(random).toHaveBeenCalledWith(defaultParams.min_fade_out_time, defaultParams.max_fade_out_time);
    });

    it('should calculate correct duration halfway', () => {
      expect(trackOptions.durationHalfway).toBe(10); // (30 - 10) / 2
    });

    it('should return correct bounds', () => {
      expect(trackOptions.volumeRangeLowerBound).toBe(0);
      expect(trackOptions.volumeRangeUpperBound).toBe(1);
      expect(trackOptions.deadAirLowerBound).toBe(1);
      expect(trackOptions.deadAirUpperBound).toBe(5);
      expect(trackOptions.durationLowerBound).toBe(10);
      expect(trackOptions.durationUpperBound).toBe(30);
      expect(trackOptions.fadeInLowerBound).toBe(2);
      expect(trackOptions.fadeInUpperBound).toBe(4);
      expect(trackOptions.fadeOutLowerBound).toBe(2);
      expect(trackOptions.fadeOutUpperBound).toBe(4);
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional parameters', () => {
      // Update to make IAudioTrackData properties optional in the audioTrack.ts file
      (hasOwnProperty as jest.Mock).mockImplementation((obj: any, prop: string) => {
        if (prop === "start_with_silence" || prop === "fadeout_when_filtered") {
          return false; // Simulate the properties being missing
        }
        return true;
      });

      const minimalParams: Omit<IAudioTrackData, "min_pan_duration" | "max_pan_duration" | "repeat_recordings" | "is_active" | "start_with_silence" | "banned_duration" | "fadeout_when_filtered"> = {
        min_volume: 0,
        max_volume: 1,
        min_duration: 10,
        max_duration: 30,
        min_dead_air: 1,
        max_dead_air: 5,
        min_fade_in_time: 2,
        max_fade_in_time: 4,
        min_fade_out_time: 2,
        max_fade_out_time: 4,
        tag_filters: [],
        id: 1,
        min_pan_pos: -1,
        max_pan_pos: 1,
        project_id: 1,
        timed_asset_priority: "normal",
      };

      const trackOptions = new TrackOptions(mockUrlParamLookup, minimalParams as IAudioTrackData);
      expect(trackOptions.bannedDuration).toBe(600); // Expect default value
      expect(trackOptions.startWithSilence).toBe(true); // Expect default value
      expect(trackOptions.fadeOutWhenFiltered).toBe(true); // Expect default value
      expect(trackOptions.fadeOutMultiplier).toBe(1);

      // Restore the original mock implementation
      (hasOwnProperty as jest.Mock).mockImplementation(() => true);
    });

    it('should handle invalid fadeOutMultiplier parameter', () => {
      mockUrlParamLookup.mockReturnValue('invalid');
      const trackOptions = new TrackOptions(mockUrlParamLookup, defaultParams);
      expect(trackOptions.fadeOutMultiplier).toBe(NaN);
    });
  });
});