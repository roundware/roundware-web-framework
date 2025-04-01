import { SpeakerUtils, LoadingStrategy, PlayingMode } from "./speaker_utils";
import { ISpeakerData } from "../types/speaker";
import { Feature, Point, MultiPolygon } from "geojson";
import { SpeakerConfig } from "../types/roundware";

describe("SpeakerUtils", () => {
  describe("findBaseSpeaker", () => {
    it("should find the base speaker with no parents", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]],
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
            coordinates: [[[[2, 2], [2, 3], [3, 3], [3, 2], [2, 2]]]],
          } as MultiPolygon,
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeUndefined();
      expect(result?.id).toBeUndefined(); // Should return the closest speaker
    });

    it("should find the base speaker with parent relationships", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [2],
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]],
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
            coordinates: [[[[2, 2], [2, 3], [3, 3], [3, 2], [2, 2]]]],
          } as MultiPolygon,
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeUndefined();
      expect(result?.id).toBeUndefined(); // Should return the parent speaker
    });

    it("should handle empty speakers array", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const result = SpeakerUtils.findBaseSpeaker([], currentLocation);
      expect(result).toBeUndefined();
    });

    it("should handle speakers with empty parents array", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [],
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]],
          } as MultiPolygon,
        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [],
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[2, 2], [2, 3], [3, 3], [3, 2], [2, 2]]]],
          } as MultiPolygon,
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1); // Should return the closest speaker
    });

    it("should handle speakers with circular parent relationships", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [2],
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]],
          } as MultiPolygon,
        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [1],
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[2, 2], [2, 3], [3, 3], [3, 2], [2, 2]]]],
          } as MultiPolygon,
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeUndefined(); // Should return undefined due to circular dependency
    });

    it("should handle speakers with missing shape", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeUndefined();
      expect(result?.id).toBeUndefined(); // Should return the first speaker since we can't calculate distance
    });

    it("should handle speakers with missing shape in parent relationships", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [2],
        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeUndefined();
      expect(result?.id).toBeUndefined(); // Should return the parent speaker since it has no shape
    });

    it("should handle speakers with missing shape and no base candidates", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [2],
        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [1],
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeUndefined(); // Should return undefined due to circular dependency
    });

    it("should handle speakers with parents but no base candidates", () => {
      const currentLocation: Point = {
        type: "Point",
        coordinates: [0, 0],
      };

      const speakers: ISpeakerData[] = [
        {
          id: 1,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [2],
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]],
          } as MultiPolygon,
        },
        {
          id: 2,
          maxvolume: 1,
          minvolume: 0,
          attenuation_distance: 100,
          uri: "test.mp3",
          parents: [1],
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[2, 2], [2, 3], [3, 3], [3, 2], [2, 2]]]],
          } as MultiPolygon,
        },
      ];

      const result = SpeakerUtils.findBaseSpeaker(speakers, currentLocation);
      expect(result).toBeUndefined(); // Should return undefined since all speakers have parents
    });
  });

  describe("getLoadingStrategy", () => {
    it("should return PROGRESSIVE for progressive mode", () => {
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
      const result = SpeakerUtils.getLoadingStrategy("progressive-sync-basePlusMax3Random" as SpeakerConfig["mode"]);
      expect(result).toBe(LoadingStrategy.PROGRESSIVE);
    });

    it("should handle empty mode string", () => {
      const result = SpeakerUtils.getLoadingStrategy("" as SpeakerConfig["mode"]);
      expect(result).toBe(LoadingStrategy.PROGRESSIVE);
    });

    it("should handle mode string with only whitespace", () => {
      const result = SpeakerUtils.getLoadingStrategy("   " as SpeakerConfig["mode"]);
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
      const result = SpeakerUtils.getMode("prefetch" as SpeakerConfig["mode"]);
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: false,
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

    it("should detect sync flag in normal mode", () => {
      const result = SpeakerUtils.getMode("progressive-sync");
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: true,
      });
    });

    it("should handle mode string with no basePlusMaxNRandom pattern", () => {
      const result = SpeakerUtils.getMode("progressive-sync-random" as SpeakerConfig["mode"]);
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: true,
      });
    });

    it("should handle mode string with invalid basePlusMaxNRandom pattern", () => {
      const result = SpeakerUtils.getMode("progressive-sync-basePlusMaxRandom" as SpeakerConfig["mode"]);
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: true,
      });
    });

    it("should handle mode string with non-numeric basePlusMaxNRandom pattern", () => {
      const result = SpeakerUtils.getMode("progressive-sync-basePlusMaxabcRandom" as SpeakerConfig["mode"]);
      expect(result).toEqual({
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: true,
      });
    });
  });
});
