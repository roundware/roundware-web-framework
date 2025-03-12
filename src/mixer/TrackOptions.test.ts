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
      minvolume: 0,
      maxvolume: 1,
      minduration: 10,
      maxduration: 30,
      mindeadair: 1,
      maxdeadair: 5,
      minfadeintime: 2,
      maxfadeintime: 4,
      minfadeouttime: 2,
      maxfadeouttime: 4,
      repeatrecordings: true,
      tag_filters: ['tag1', 'tag2'],
      banned_duration: 300,
      start_with_silence: true,
      fadeout_when_filtered: true,
      minpanpos: -1,
      maxpanpos: 1,
      minpanduration: 1,
      maxpanduration: 5,
      active: true,
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
      expect(random).toHaveBeenCalledWith(defaultParams.minvolume, defaultParams.maxvolume);
    });

    it('should return correct random dead air', () => {
      expect(trackOptions.randomDeadAir).toBe(1);
      expect(random).toHaveBeenCalledWith(1, 5);
      // Added expect statement to ensure mock is called with the correct bounds
      expect(random).toHaveBeenCalledWith(defaultParams.mindeadair, defaultParams.maxdeadair);
    });

    it('should return correct random fade in duration', () => {
      expect(trackOptions.randomFadeInDuration).toBe(2);
      expect(random).toHaveBeenCalledWith(2, 4);
      // Added expect statement to ensure mock is called with the correct bounds
      expect(random).toHaveBeenCalledWith(defaultParams.minfadeintime, defaultParams.maxfadeintime);
    });

    it('should return correct random fade out duration', () => {
      expect(trackOptions.randomFadeOutDuration).toBe(2);
      expect(random).toHaveBeenCalledWith(2, 4);
       // Added expect statement to ensure mock is called with the correct bounds
       expect(random).toHaveBeenCalledWith(defaultParams.minfadeouttime, defaultParams.maxfadeouttime);
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

      const minimalParams: Omit<IAudioTrackData, "minpanduration" | "maxpanduration" | "repeatrecordings" | "active" | "start_with_silence" | "banned_duration" | "fadeout_when_filtered"> = {
        minvolume: 0,
        maxvolume: 1,
        minduration: 10,
        maxduration: 30,
        mindeadair: 1,
        maxdeadair: 5,
        minfadeintime: 2,
        maxfadeintime: 4,
        minfadeouttime: 2,
        maxfadeouttime: 4,
        tag_filters: [],
        id: 1,
        minpanpos: -1,
        maxpanpos: 1,
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