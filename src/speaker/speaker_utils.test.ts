import { SpeakerUtils, LoadingStrategy, PlayingMode } from "./speaker_utils";
import { ISpeakerData } from "../types/speaker";
import { Point, MultiPolygon } from "geojson";

describe("SpeakerUtils", () => {
  describe("findBaseSpeaker", () => {
    const mockCurrentLocation: Point = {
      type: "Point",
      coordinates: [0, 0],
    };

    it("should find the base speaker with no parents", () => {
      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]],
          } as MultiPolygon,

        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]],
          } as MultiPolygon,

        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, mockCurrentLocation);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1); // Should return the speaker closest to current location
    });

    it("should find the base speaker with parent relationships", () => {
      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]],
          } as MultiPolygon,
          parents: [3],
        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]],
          } as MultiPolygon,
          parents: [1],
        },
        {
          id: 3,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]]],
          } as MultiPolygon,

        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, mockCurrentLocation);
      expect(result).toBeDefined();
      expect(result?.id).toBe(3); // Should return the speaker with no parents in the set
    });
  });

  describe("getLoadingStrategy", () => {
    it("should return PROGRESSIVE for progressive-sync mode", () => {
      const result = SpeakerUtils.getLoadingStrategy("progressive-sync");
      expect(result).toBe(LoadingStrategy.PROGRESSIVE);
    });

    it("should return PREFETCH for prefetch mode", () => {
      const result = SpeakerUtils.getLoadingStrategy("prefetch");
      expect(result).toBe(LoadingStrategy.PREFETCH);
    });

    it("should return STREAM for stream mode", () => {
      const result = SpeakerUtils.getLoadingStrategy("stream");
      expect(result).toBe(LoadingStrategy.STREAM);
    });

    it("should return PROGRESSIVE for unknown mode", () => {
      const result = SpeakerUtils.getLoadingStrategy("unknown" as any);
      expect(result).toBe(LoadingStrategy.PROGRESSIVE);
    });
  });

  describe("getMode", () => {
    it("should parse basePlusMaxNRandom mode correctly", () => {
      const result = SpeakerUtils.getMode("progressive-sync-basePlusMax3Random");
      expect(result).toEqual({
        mode: PlayingMode.BASEPLUSMAXNRANDOM,
        maxRandom: 3,
        sync: true,
      });
    });

    it("should parse basePlusMaxNRandom mode with sync", () => {
      const result = SpeakerUtils.getMode("progressive-sync-basePlusMax5Random");
      expect(result).toEqual({
        mode: PlayingMode.BASEPLUSMAXNRANDOM,
        maxRandom: 5,
        sync: true,
      });
    });

    it("should return NORMAL mode for unknown mode", () => {
      const result = SpeakerUtils.getMode("unknown" as any);
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: false,
      });
    });

    it("should handle sync flag in normal mode", () => {
      const result = SpeakerUtils.getMode("progressive-sync");
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: true,
      });
    });

    it("should handle non-string mode input", () => {
      const result = SpeakerUtils.getMode(123 as any);
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: false,
      });
    });
  });

  describe("findRemainingTime", () => {
    it("should return the remaining time", () => {
      const result = SpeakerUtils.findRemainingTime(12, 10, 6);
      expect(result).toBe(4);

      const result2 = SpeakerUtils.findRemainingTime(15, 10, 6);
      expect(result2).toBe(1);
    });

    it("should return '0' if remaining time is zero", () => {
      const result = SpeakerUtils.findRemainingTime(16, 10, 6);
      expect(result).toBe(0);
    });

  });
});
