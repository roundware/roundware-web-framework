import { MultiPolygon, Point } from "geojson";
import { ISpeakerData } from "../types/speaker";
import { LoadingStrategy, PlayingMode, SpeakerUtils } from "./speaker_utils";

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

  describe("getRootForSpeaker", () => {
    // Mock speaker data
    const mockSpeakers: Pick<ISpeakerData, 'id' | 'parents'>[] = [
      { id: 1, parents: [],  },
      { id: 2, parents: [1],  },
      { id: 3, parents: [2],  },
      { id: 4, parents: [1],  },
      { id: 5, parents: [],  },
      { id: 6, parents: [999],  }, // Parent doesn't exist
    ];

    it("should return speaker id when speaker has no parents", () => {
      const result = SpeakerUtils.getRootForSpeaker(mockSpeakers[0], mockSpeakers);
      expect(result).toBe(1);
    });

    it("should return root speaker id for speaker with one parent", () => {
      const result = SpeakerUtils.getRootForSpeaker(mockSpeakers[1], mockSpeakers);
      expect(result).toBe(1);
    });

    it("should return root speaker id for speaker with multiple levels of parents", () => {
      const result = SpeakerUtils.getRootForSpeaker(mockSpeakers[2], mockSpeakers);
      expect(result).toBe(1);
    });

    it("should return speaker id when parent is not found in speakers array", () => {
      const result = SpeakerUtils.getRootForSpeaker(mockSpeakers[5], mockSpeakers);
      expect(result).toBe(6);
    });

    it("should handle multiple speakers with same root correctly", () => {
      const result1 = SpeakerUtils.getRootForSpeaker(mockSpeakers[1], mockSpeakers);
      const result2 = SpeakerUtils.getRootForSpeaker(mockSpeakers[3], mockSpeakers);
      expect(result1).toBe(1);
      expect(result2).toBe(1);
    });
  });

  describe("timeUntilClosestLoopPoint", () => {
    let consoleLogSpy: jest.SpyInstance;
    let originalWindow: typeof window | undefined;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      originalWindow = (global as any).window;
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      // Restore original window
      if (originalWindow !== undefined) {
        Object.defineProperty(global, "window", {
          value: originalWindow,
          writable: true,
          configurable: true,
        });
      } else {
        delete (global as any).window;
      }
    });

    it("should calculate correct time until next loop point - example 1", () => {
      const result = SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 8,
        startTime: 0,
        duration: 3
      });
      expect(result).toBe(1);
    });

    it("should calculate correct time until next loop point - example 2", () => {
      const result = SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 9,
        startTime: 6,
        duration: 3
      });
      expect(result).toBe(3);
    });

    it("should calculate correct time until next loop point - example 3", () => {
      const result = SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 13,
        startTime: 9,
        duration: 3
      });
      expect(result).toBe(2);
    });

    it("should handle exact loop points", () => {
      const result = SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 12,
        startTime: 6,
        duration: 3
      });
      expect(result).toBe(3); // At exact loop point, should return full duration
    });

    it("should handle very small remaining times", () => {
      const result = SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 10.99,
        startTime: 8,
        duration: 3
      });
      expect(result).toBeCloseTo(0.01, 2);
    });

    it("should log debug info when DEBUG_LOOP_SYNC is enabled", () => {
      // Mock window object with DEBUG_LOOP_SYNC flag
      Object.defineProperty(global, "window", {
        value: {
          DEBUG_LOOP_SYNC: true,
        },
        writable: true,
        configurable: true,
      });

      const currentTime = 8.5;
      const startTime = 0;
      const duration = 3;

      const result = SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime,
        startTime,
        duration,
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[SYNC_DEBUG] LOOP_CALC:")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`currentTime=${currentTime.toFixed(6)}s`)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`startTime=${startTime.toFixed(6)}s`)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`duration=${duration.toFixed(6)}s`)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/timeSinceStart=\d+\.\d+s/)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/positionInLoop=\d+\.\d+s/)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/timeUntilNext=\d+\.\d+s/)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/expectedLoop=\d+\.\d+s/)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/actualOffset=-?\d+\.\d+ms/)
      );
      expect(result).toBe(0.5);
    });

    it("should not log when DEBUG_LOOP_SYNC is not set", () => {
      // Mock window object without DEBUG_LOOP_SYNC flag
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 8,
        startTime: 0,
        duration: 3,
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("should not log when DEBUG_LOOP_SYNC is false", () => {
      // Mock window object with DEBUG_LOOP_SYNC set to false
      Object.defineProperty(global, "window", {
        value: {
          DEBUG_LOOP_SYNC: false,
        },
        writable: true,
        configurable: true,
      });

      SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 8,
        startTime: 0,
        duration: 3,
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("should not log when window is undefined (Node.js environment)", () => {
      // Remove window object to simulate Node.js environment
      delete (global as any).window;

      SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime: 8,
        startTime: 0,
        duration: 3,
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("should log correct debug values with specific inputs", () => {
      Object.defineProperty(global, "window", {
        value: {
          DEBUG_LOOP_SYNC: true,
        },
        writable: true,
        configurable: true,
      });

      const currentTime = 10.5;
      const startTime = 6;
      const duration = 3;

      SpeakerUtils.timeUntilClosestLoopPoint({
        currentTime,
        startTime,
        duration,
      });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const logMessage = consoleLogSpy.mock.calls[0][0];
      
      // Verify all expected values are present in the log message
      expect(logMessage).toContain(`currentTime=${currentTime.toFixed(6)}s`);
      expect(logMessage).toContain(`startTime=${startTime.toFixed(6)}s`);
      expect(logMessage).toContain(`duration=${duration.toFixed(6)}s`);
      
      // Verify calculated values
      const timeSinceStart = currentTime - startTime; // 4.5
      const positionInLoop = timeSinceStart % duration; // 1.5
      const timeUntilNext = duration - positionInLoop; // 1.5
      const expectedLoopPoint = Math.floor(timeSinceStart / duration) * duration; // 3
      const actualOffset = timeSinceStart - expectedLoopPoint; // 1.5
      
      expect(logMessage).toContain(`timeSinceStart=${timeSinceStart.toFixed(6)}s`);
      expect(logMessage).toContain(`positionInLoop=${positionInLoop.toFixed(6)}s`);
      expect(logMessage).toContain(`timeUntilNext=${timeUntilNext.toFixed(6)}s`);
      expect(logMessage).toContain(`expectedLoop=${expectedLoopPoint.toFixed(6)}s`);
      expect(logMessage).toContain(`actualOffset=${(actualOffset * 1000).toFixed(2)}ms`);
    });
  });

  describe("shouldDoSomethingWithProbability", () => {
    let consoleDebugSpy: jest.SpyInstance;
    let mathRandomSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
    });

    afterEach(() => {
      consoleDebugSpy.mockRestore();
      if (mathRandomSpy) {
        mathRandomSpy.mockRestore();
      }
    });

    it("should log with ✅ when random < probability and taskName is provided", () => {
      const randomValue = 0.3;
      const probability = 0.5;
      mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(randomValue);

      const result = SpeakerUtils.shouldDoSomethingWithProbability(
        probability,
        "testTask"
      );

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("✅")
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("testTask")
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringMatching(/testTask probability: 0\.3 < 0\.5/)
      );
      expect(result).toBe(true);
    });

    it("should log with ❌ when random >= probability and taskName is provided", () => {
      const randomValue = 0.7;
      const probability = 0.5;
      mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(randomValue);

      const result = SpeakerUtils.shouldDoSomethingWithProbability(
        probability,
        "testTask"
      );

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("❌")
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining("testTask")
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringMatching(/testTask probability: 0\.7 < 0\.5/)
      );
      expect(result).toBe(false);
    });

    it("should not log when taskName is not provided", () => {
      const randomValue = 0.3;
      const probability = 0.5;
      mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(randomValue);

      const result = SpeakerUtils.shouldDoSomethingWithProbability(probability);

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should not log when taskName is empty string", () => {
      const randomValue = 0.3;
      const probability = 0.5;
      mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(randomValue);

      const result = SpeakerUtils.shouldDoSomethingWithProbability(
        probability,
        ""
      );

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return correct boolean value based on probability comparison", () => {
      mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.4);

      const result1 = SpeakerUtils.shouldDoSomethingWithProbability(0.5);
      expect(result1).toBe(true);

      mathRandomSpy.mockReturnValue(0.6);
      const result2 = SpeakerUtils.shouldDoSomethingWithProbability(0.5);
      expect(result2).toBe(false);
    });
  });
});
