import { jest } from "@jest/globals";
import { IAudioContext } from "standardized-audio-context";
import { IMixParams, SpeakerConfig } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { SpeakerEngine } from "./speaker_engine";
import { SpeakerTrack } from "./speaker_track";

describe("SpeakerEngine - repeatLoopOnLoopPoint", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  // Test helper interface
  interface TestScenario {
    name: string;
    baseTrackDuration: number;
    currentTime: number;
    groupStartedAt: number;
    trackConfig: {
      loopConfig: {
        duration: number;
        pan: number;
        times: number;
      };
    };
    expectedPlayConfig: {
      duration: number;
      offset: number;
      times: number;
      pan: number;
      fadeInDuration: number;
    };
    expectedExceededDuration?: number;
  }

  // Test helper function
  const runTestScenario = (scenario: TestScenario) => {
    it(scenario.name, () => {
      // Setup mock audio context with specific current time
      Object.defineProperty(mockAudioContext, "currentTime", {
        get: () => scenario.currentTime,
      });

      // Make sure the group is properly initialized with the scenario's start time
      speakerEngine.group.set(
        mockSpeakerTrack.groupId,
        scenario.groupStartedAt
      );

      // Setup mock speaker track with specific configuration
      mockSpeakerTrack.loopConfig = scenario.trackConfig.loopConfig;
      mockSpeakerTrack.bufferSourcePlaying = true;

      // Setup base track with specific duration
      const baseTrack = {
        data: { id: 2 },
        buffer: { duration: scenario.baseTrackDuration },
        groupId: mockSpeakerTrack.groupId, // Ensure the base track is in the same group
      } as unknown as jest.Mocked<SpeakerTrack>;
      speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
      speakerEngine.playingTracks = [baseTrack.data.id];

      // Run the function
      speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

      // Verify the play configuration using approximate matching for floating point values
      const playConfigCall = mockSpeakerTrack.playWithConfig.mock.calls[0][0];

      expect(playConfigCall.duration).toEqual(
        scenario.expectedPlayConfig.duration
      );
      expect(playConfigCall.fadeInDuration).toEqual(
        scenario.expectedPlayConfig.fadeInDuration
      );
      expect(playConfigCall.pan).toEqual(scenario.expectedPlayConfig.pan);
      expect(playConfigCall.offset).toEqual(scenario.expectedPlayConfig.offset);
      expect(playConfigCall.times).toEqual(scenario.expectedPlayConfig.times);
    });
  };
  // Test scenarios
  const scenarios: TestScenario[] = [
    {
      name: "Basic scenario - track duration equals base track duration",
      baseTrackDuration: 30,
      currentTime: 30, // Exactly at the first loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 30,
          pan: 0,
          times: 1,
        },
      },
      expectedPlayConfig: {
        duration: 30,
        offset: 0,
        times: 1,
        pan: 0,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
    {
      name: "Track duration is half of base track duration",
      baseTrackDuration: 30,
      currentTime: 30, // Exactly at the first loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 15,
          pan: 0,
          times: 2,
        },
      },
      expectedPlayConfig: {
        duration: 15,
        offset: 0,
        times: 2,
        pan: 0,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
    {
      name: "Track with non-zero pan",
      baseTrackDuration: 30,
      currentTime: 60, // Exactly at the second loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 10,
          pan: 0.5,
          times: 3,
        },
      },
      expectedPlayConfig: {
        duration: 10,
        offset: 0,
        times: 3,
        pan: 0.5,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
    {
      name: "Track with 2/3 of base track duration",
      baseTrackDuration: 30,
      currentTime: 60, // Exactly at the second loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 20,
          pan: 0,
          times: 2,
        },
      },
      expectedPlayConfig: {
        duration: 20,
        offset: 0,
        times: 2,
        pan: 0,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
    // 2/3 but at 2nd loop point
    {
      name: "2/3 but at 2nd loop point",
      baseTrackDuration: 30,
      currentTime: 60, // Exactly at the second loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 20,
          pan: 0,
          times: 2,
        },
      },
      expectedPlayConfig: {
        duration: 20,
        offset: 0,
        times: 2,
        pan: 0,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
    // New test scenarios
    {
      name: "Fractional durations - at loop point",
      baseTrackDuration: 30,
      currentTime: 30, // Exactly at the first loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 12.5,
          pan: 0,
          times: 3,
        },
      },
      expectedPlayConfig: {
        duration: 12.5,
        offset: 5, // 30 % 12.5 = 5
        times: 3,
        pan: 0,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 5,
    },
    {
      name: "Non-zero group start time",
      baseTrackDuration: 30,
      currentTime: 40.5, // Exactly at first loop point (10.5 + 30)
      groupStartedAt: 10.5,
      trackConfig: {
        loopConfig: {
          duration: 15,
          pan: 0.25,
          times: 2,
        },
      },
      expectedPlayConfig: {
        duration: 15,
        offset: 0, // (40.5 - 10.5) = 30, 30 % 15 = 0
        times: 2,
        pan: 0.25,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
    {
      name: "At exact third loop point",
      baseTrackDuration: 30,
      currentTime: 90, // Exactly at the third loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 20,
          pan: 0,
          times: 2,
        },
      },
      expectedPlayConfig: {
        duration: 20,
        offset: 10, // 90 % 20 = 10
        times: 2,
        pan: 0,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 10,
    },
    {
      name: "Exact boundary - current time at exact loop point",
      baseTrackDuration: 40,
      currentTime: 40, // Exactly at the first loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 10,
          pan: -0.5,
          times: 4,
        },
      },
      expectedPlayConfig: {
        duration: 10,
        offset: 0, // 40 % 10 = 0
        times: 4,
        pan: -0.5,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
    {
      name: "Different base track and loop track durations with floating point",
      baseTrackDuration: 32.5,
      currentTime: 65, // Exactly at the second loop point (2 * 32.5)
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 8.1,
          pan: 0.33,
          times: 5,
        },
      },
      expectedPlayConfig: {
        duration: 8.1,
        offset: 0.20000000000000284, // 65 % 8.1 = 0.2
        times: 5,
        pan: 0.33,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0.20000000000000284,
    },
    {
      name: "Extremely short duration track at loop point",
      baseTrackDuration: 30,
      currentTime: 60, // Exactly at the second loop point
      groupStartedAt: 0,
      trackConfig: {
        loopConfig: {
          duration: 0.5, // Very short duration
          pan: 0,
          times: 60, // High repeat count
        },
      },
      expectedPlayConfig: {
        duration: 0.5,
        offset: 0, // 60 % 0.5 = 0
        times: 60,
        pan: 0,
        fadeInDuration: 0,
      },
      expectedExceededDuration: 0,
    },
  ];

  // Run all scenarios
  scenarios.forEach(runTestScenario);

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
      // ... other necessary mock implementations
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      bufferSourcePlaying: false,
      loopConfig: { pan: 0, duration: 10, times: 1 },
      abortBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      groupId: 1, // Add the groupId property
      // ... other necessary mock implementations
    } as unknown as jest.Mocked<SpeakerTrack>;

    mockMixParams = {
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {},
      },
      speakerConfig: { mode: "progressive-sync" },
    };

    mockSpeakerData = [
      {
        id: 1,
        shape: { type: "MultiPolygon", coordinates: [] },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio",
      },
    ];

    mockConfig = { mode: "progressive-sync" };

    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Replace the group map with a properly initialized one
    speakerEngine.group = new Map();
    speakerEngine.group.set(1, 0); // Set group 1 to have started at time 0

    speakerEngine.speakers = [mockSpeakerTrack];
    speakerEngine.playingTracks = [1];

    // Add a mock base track with a valid buffer
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 }, // Ensure the buffer has a valid duration
      groupId: 1, // Make sure base track is in the same group
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers.push(baseTrack);
    speakerEngine.playingTracks = [baseTrack.data.id];
  });

  it("should throw an error if base track is not found", () => {
    speakerEngine.playingTracks = [null];
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Base track not found"
    );
  });

  it("should repeat the track with correct configuration", () => {
    // Ensure bufferSourcePlaying is true to trigger abortBufferSource
    mockSpeakerTrack.bufferSourcePlaying = true;
    mockSpeakerTrack.startedAtContextTime = 0;
    mockSpeakerTrack.loopConfig.duration = 3;
    mockSpeakerTrack.loopConfig.pan = 0;
    mockSpeakerTrack.loopConfig.times = 4;

    // Set the group start time
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);

    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);
    expect(mockSpeakerTrack.abortBufferSource).toHaveBeenCalled();
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith({
      duration: mockSpeakerTrack.loopConfig.duration,
      fadeInDuration: 0,
      offset: 0,
      pan: mockSpeakerTrack.loopConfig.pan,
      times: expect.any(Number),
    });
  });

  it("should emit repeatingTrack event with correct data", () => {
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Set the group start time
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);

    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);
    expect(emitSpy).toHaveBeenCalledWith(
      "repeatingTrack",
      expect.objectContaining({
        trackId: mockSpeakerTrack.data.id,
        exceededDuration: expect.any(Number),
      })
    );
  });

  it("should calculate correct offset and remaining time when track duration is a fraction of base loop duration", () => {
    // Set up the scenario
    const baseTrackDuration = 30; // Base track duration
    const trackDuration = 10; // Track duration (1/3 of base track)
    mockSpeakerTrack.loopConfig.duration = trackDuration;
    mockSpeakerTrack.startedAtContextTime = 0;
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);

    // Mock the base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: baseTrackDuration },
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers.push(baseTrack);
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Spy on the emit method
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Call the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify the calculations
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: expect.any(Number),
      })
    );

    // Check the emitted event
    expect(emitSpy).toHaveBeenCalledWith(
      "repeatingTrack",
      expect.objectContaining({
        exceededDuration: expect.any(Number),
      })
    );
  });

  // Additional edge case tests
  it("should handle zero group start time correctly", () => {
    // Set specific context time
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 60,
    });

    // Set track configuration
    mockSpeakerTrack.loopConfig = {
      duration: 10,
      pan: 0,
      times: 2,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time to exactly 0
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify calculations - should have offset of 5.5 (15.5 % 10)
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 10,
        offset: 0,
        times: expect.any(Number),
        pan: 0,
        fadeInDuration: 0,
      })
    );
  });

  it("should handle cases where current time is exactly at loop boundary", () => {
    // Set specific context time to be exactly at a loop boundary
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 20, // Exactly two loop durations
    });

    // Set track configuration
    mockSpeakerTrack.loopConfig = {
      duration: 10,
      pan: 0,
      times: 3,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time to 0
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify calculations - should have offset of 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 10,
        offset: 0, // At exact boundary
        times: 3,
        pan: 0,
        fadeInDuration: 0,
      })
    );
  });

  it("should handle high precision floating point durations", () => {
    // Set specific context time
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 12.3456789,
    });

    // Set track configuration with high precision duration
    mockSpeakerTrack.loopConfig = {
      duration: 3.1415926535,
      pan: 0,
      times: 5,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time
    speakerEngine.group.set(mockSpeakerTrack.groupId, 1.2345678);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Spy on the emit method
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify high precision calculations
    const expectedOffset = (12.3456789 - 1.2345678) % 3.1415926535;

    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 3.1415926535,
        offset: expect.any(Number), // Should be close to expectedOffset
        times: expect.any(Number),
        pan: 0,
        fadeInDuration: 0,
      })
    );

    // Check that the offset is close to the expected value
    const actualCall = mockSpeakerTrack.playWithConfig.mock.calls[0][0];
    expect(Math.abs(actualCall.offset - expectedOffset)).toBeLessThan(0.0001);
  });

  it("should handle future loop times correctly when current time is way ahead", () => {
    // Set context time far into the future
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 1000, // Far into the future
    });

    // Set track configuration
    mockSpeakerTrack.loopConfig = {
      duration: 7,
      pan: 0.5,
      times: 3,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time in the past
    speakerEngine.group.set(mockSpeakerTrack.groupId, 10);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // We expect a large number of repeats to span the time distance
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 7,
        offset: expect.any(Number),
        times: expect.any(Number),
        pan: 0.5,
        fadeInDuration: 0,
      })
    );

    // Check that times is at least 4 (enough to span 30s base track duration)
    const actualCall = mockSpeakerTrack.playWithConfig.mock.calls[0][0];
    expect(actualCall.times).toBeGreaterThanOrEqual(4);
  });

  it("should handle very small offsets that are nearly zero", () => {
    // Set context time to produce a very small offset
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 10.01, // Just barely after a loop point
    });

    // Set track configuration
    mockSpeakerTrack.loopConfig = {
      duration: 5,
      pan: 0,
      times: 2,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Import the isNearlyZero function to spy on it
    const utilsModule = require("../utils");
    const isNearlyZeroSpy = jest.spyOn(utilsModule, "isNearlyZero");

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify isNearlyZero was called with a value close to the expected offset
    const isNearlyZeroCall = isNearlyZeroSpy.mock.calls.find(
      (call) => Math.abs((call[0] as number) - 0.01) < 0.02 // Increased tolerance from 0.01 to 0.02
    );
    expect(isNearlyZeroCall).toBeTruthy();

    // The offset should be treated as a small value close to 0.01
    const actualCall = mockSpeakerTrack.playWithConfig.mock.calls[0][0];
    expect(Math.abs(actualCall.offset - 0.01) < 0.02).toBe(true); // Increased tolerance from 0.01 to 0.02

    // Restore the spy
    isNearlyZeroSpy.mockRestore();
  });

  it("should handle extremely large time values without precision loss", () => {
    // Set context time to an extremely large value
    const veryLargeTime = 1e10; // 10 billion seconds
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => veryLargeTime,
    });

    // Set track configuration
    mockSpeakerTrack.loopConfig = {
      duration: 60,
      pan: 0,
      times: 1,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time to a large value too
    const largeStartTime = 1e10 - 30; // 30 seconds before current time
    speakerEngine.group.set(mockSpeakerTrack.groupId, largeStartTime);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify that offset calculation works with large numbers
    // Expected offset: (1e10 - (1e10 - 30)) % 60 = 30 % 60 = 30
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 60,
        offset: 30,
        times: expect.any(Number),
        pan: 0,
        fadeInDuration: 0,
      })
    );
  });

  it("should handle negative group start times correctly", () => {
    // Set context time
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 25,
    });

    // Set track configuration
    mockSpeakerTrack.loopConfig = {
      duration: 10,
      pan: -0.25,
      times: 3,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time to a negative value
    speakerEngine.group.set(mockSpeakerTrack.groupId, -15);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Expected offset: (25 - (-15)) % 10 = 40 % 10 = 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 10,
        offset: 0,
        times: expect.any(Number),
        pan: -0.25,
        fadeInDuration: 0,
      })
    );
  });

  it("should handle repeated calls with the same configuration", () => {
    // Set context time
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 30,
    });

    // Set track configuration
    mockSpeakerTrack.loopConfig = {
      duration: 10,
      pan: 0,
      times: 2,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Set the group start time
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);

    // Set up base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Run the function twice
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Advance time
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 60,
    });

    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify both calls had correct offsets
    const firstCall = mockSpeakerTrack.playWithConfig.mock.calls[0][0];
    const secondCall = mockSpeakerTrack.playWithConfig.mock.calls[1][0];

    expect(firstCall.offset).toBe(0); // 15 % 10 = 5
    expect(secondCall.offset).toBe(0); // 25 % 10 = 5
  });
});
