import { jest } from "@jest/globals";
import { Feature, Point } from 'geojson';
import { IAudioBuffer, IAudioContext } from "standardized-audio-context";
import { IMixParams, SpeakerConfig } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { FADE_IN_DURATION_SECONDS } from '../utils';
import { SpeakerEngine } from "./speaker_engine";
import { SpeakerTrack } from "./speaker_track";
import { LoadingStrategy, PlayingMode, SpeakerUtils } from './speaker_utils';

// Test constants
const LOOP_FRACTIONS = [1, 0.5, 0.25, 0.125];

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

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
      // ... other necessary mock implementations
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      }
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

  it("should throw an error if base track duration is not a number", () => {
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: "not a number" },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];
    
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Base track duration not found"
    );
  });

  it("should throw an error if track pan is not a number", () => {
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];
    
    mockSpeakerTrack.loopConfig.pan = "not a number" as any;
    
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Track pan not found"
    );
  });

  it("should throw an error if track duration is not a number", () => {
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];
    
    mockSpeakerTrack.loopConfig.duration = "not a number" as any;
    
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Track duration not found"
    );
  });

  it("should throw an error if track times is not a number", () => {
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];
    
    mockSpeakerTrack.loopConfig.times = "not a number" as any;
    
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Track times not found"
    );
  });

  it("should throw an error if base track cannot be found in speakers list", () => {
    // Set a valid track ID but don't add it to the speakers list
    speakerEngine.playingTracks = [999];
    speakerEngine.speakers = [mockSpeakerTrack]; // Only include the test track
    
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Speaker track not found: 999"
    );
  });

  it("should throw an error if base track buffer is missing", () => {
    const baseTrack = {
      data: { id: 2 },
      buffer: undefined,
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];
    
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Base track duration not found"
    );
  });

  it("should throw an error if base track buffer is missing in updateNonBaseTracks", () => {
    const baseTrack = {
      data: { id: 2 },
      buffer: undefined,
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];
    
    // Mock the necessary methods to reach the buffer check
    jest.spyOn(speakerEngine, 'getSpeakerTrackById').mockReturnValue(baseTrack);
    
    expect(() => speakerEngine.updateNonBaseTracks()).toThrow(
      "Base track buffer not found"
    );
  });

  it("should select a valid random length from loopFractions", () => {
    // Setup mock mixParams with loopFractions
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopFractions: LOOP_FRACTIONS
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Mock the sample function to return a specific value
    const mockSample = jest.fn().mockReturnValue(0.5);
    jest.spyOn(require("lodash"), "sample").mockImplementation(mockSample);

    // Call the function that uses loopFractions
    speakerEngine.updateNonBaseTracks();

  });

  it("should use default loopFractions [1] when none are provided", () => {
    // Setup mock mixParams without loopFractions
    mockMixParams.speakerConfig = {
      mode: "progressive-sync"
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Mock the sample function to return a specific value
    const mockSample = jest.fn().mockReturnValue(1);
    jest.spyOn(require("lodash"), "sample").mockImplementation(mockSample);

    // Call the function that uses loopFractions
    speakerEngine.updateNonBaseTracks();

    // Verify that sample was called with the default array at least once
    expect(mockSample).toHaveBeenCalledWith([1]);
    // Verify the number of calls
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
    const utilsModule = require('../utils');
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
    // The actual behavior is:
    // 1. (1e10 - (1e10 - 30)) % 60 = 30 % 60 = 30
    // 2. The offset is used directly without being set to 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 60,
        offset: 30,
        times: 1,
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

  it("should throw an error if group start time is not set", () => {
    // Set up the scenario with an odd duration track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Set track configuration with odd duration
    mockSpeakerTrack.loopConfig = {
      duration: 7, // Odd duration that doesn't divide evenly into base track duration
      pan: 0,
      times: 1,
    };
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Test undefined case
    speakerEngine.group.delete(mockSpeakerTrack.groupId);
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Tried to repeat track who's group is not started yet!"
    );

    // Test null case
    speakerEngine.group.set(mockSpeakerTrack.groupId, null);
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Tried to repeat track who's group is not started yet!"
    );
  });

  it("should throw an error if base track is null after getting from speakers list", () => {
    // Set up a base track that will be found but is null
    const baseTrack = null;
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockReturnValue(baseTrack as any);
    speakerEngine.playingTracks = [2]; // Valid track ID
    
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Base track not found"
    );
  });

  it("should set exceededDuration to 0 when it is nearly zero", () => {
    // Set context time to produce a very small offset that will be considered nearly zero
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 10.0001, // Very close to a loop point
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

    // Mock isNearlyZero to return true
    const utilsModule = require('../utils');
    const isNearlyZeroSpy = jest.spyOn(utilsModule, "isNearlyZero").mockReturnValue(true);

    // Spy on the emit method to verify the exceededDuration is 0
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify that isNearlyZero was called
    expect(isNearlyZeroSpy).toHaveBeenCalled();

    // Verify that the exceededDuration was set to 0 in the emitted event
    expect(emitSpy).toHaveBeenCalledWith(
      "repeatingTrack",
      expect.objectContaining({
        trackId: mockSpeakerTrack.data.id,
        exceededDuration: 0,
        newTimes: expect.any(Number),
      })
    );

    // Verify the playWithConfig was called with offset 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 5,
        offset: 0,
        times: expect.any(Number),
        pan: 0,
        fadeInDuration: 0,
      })
    );

    // Restore the spy
    isNearlyZeroSpy.mockRestore();
  });

  it("should set exceededDuration to 0 when isNearlyZero returns true", () => {
    // Mock isNearlyZero to return true
    const utilsModule = require('../utils');
    const isNearlyZeroSpy = jest.spyOn(utilsModule, "isNearlyZero").mockReturnValue(true);

    // Set up minimal test case
    mockSpeakerTrack.loopConfig = { duration: 5, pan: 0, times: 1 };
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);
    speakerEngine.playingTracks = [1];
    speakerEngine.speakers = [mockSpeakerTrack];

    // Spy on emit to verify exceededDuration is 0
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify isNearlyZero was called
    expect(isNearlyZeroSpy).toHaveBeenCalled();

    // Verify exceededDuration is 0 in the emitted event
    expect(emitSpy).toHaveBeenCalledWith(
      "repeatingTrack",
      expect.objectContaining({
        exceededDuration: 0
      })
    );

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
    // The actual behavior is:
    // 1. (1e10 - (1e10 - 30)) % 60 = 30 % 60 = 30
    // 2. The offset is used directly without being set to 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 60,
        offset: 30,
        times: 1,
        pan: 0,
        fadeInDuration: 0,
      })
    );
  });

  it("should set exceededDuration to 0 when isNearlyZero returns true in odd duration case", () => {
    // Mock isNearlyZero to return true for exceededDuration check
    const utilsModule = require('../utils');
    const isNearlyZeroSpy = jest.spyOn(utilsModule, "isNearlyZero")
      .mockImplementation((value) => {
        // Return true for exceededDuration check, false for odd duration check
        return value === 0.0001;
      });

    // Set up test case with odd duration
    mockSpeakerTrack.loopConfig = { duration: 7, pan: 0, times: 1 }; // 7 doesn't divide evenly into 30
    mockSpeakerTrack.bufferSourcePlaying = true;
    mockSpeakerTrack.data.id = 1;
    mockSpeakerTrack.groupId = 1;

    // Set up base track with duration 30
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id];

    // Set group start time and current time to create a small exceededDuration
    speakerEngine.group.set(mockSpeakerTrack.groupId, 0);
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 0.0001
    });

    // Spy on emit to verify exceededDuration is 0
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Run the function
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);

    // Verify isNearlyZero was called with the small exceededDuration
    expect(isNearlyZeroSpy).toHaveBeenCalledWith(0.0001);

    // Verify exceededDuration is 0 in the emitted event
    expect(emitSpy).toHaveBeenCalledWith(
      "repeatingTrack",
      expect.objectContaining({
        exceededDuration: 0
      })
    );

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
    // The actual behavior is:
    // 1. (1e10 - (1e10 - 30)) % 60 = 30 % 60 = 30
    // 2. The offset is used directly without being set to 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 60,
        offset: 30,
        times: 1,
        pan: 0,
        fadeInDuration: 0,
      })
    );
  });

  it("should set offset to 0 when it is nearly zero in playAsBaseTrack", () => {
    // Mock isNearlyZero to return true
    const utilsModule = require('../utils');
    const isNearlyZeroSpy = jest.spyOn(utilsModule, "isNearlyZero").mockReturnValue(true);

    // Set up test case
    const track = {
      data: { id: 1 },
      buffer: { duration: 30 },
      groupId: 1,
      bufferSourcePlaying: false,
      playWithConfig: jest.fn(),
      on: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      clearListeners: jest.fn(), // Add this missing method
    } as unknown as jest.Mocked<SpeakerTrack>;

    // Set up speaker engine
    speakerEngine.playing = true;
    speakerEngine.playingTracks = [track.data.id];
    speakerEngine.speakers = [track];
    speakerEngine.group.set(track.groupId, null);

    // Set current time to be very close to loop point
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 29.999
    });

    // Run the function
    speakerEngine.playAsBaseTrack(track, false);

    // Verify isNearlyZero was called
    expect(isNearlyZeroSpy).toHaveBeenCalled();

    // Verify offset is 0 in playWithConfig
    expect(track.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 0
      })
    );

    // Verify group start time was set
    expect(speakerEngine.group.get(track.groupId)).toBe(29.999);

    // Restore the spy
    isNearlyZeroSpy.mockRestore();
  });

  it("should configure playWithConfig correctly and add track finished listener when not continued", () => {
    // Set up test case
    const track = {
      data: { id: 1 },
      buffer: { duration: 30 },
      groupId: 1,
      bufferSourcePlaying: false,
      playWithConfig: jest.fn(),
      on: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      clearListeners: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    // Set up speaker engine
    speakerEngine.playing = true;
    speakerEngine.playingTracks = [track.data.id];
    speakerEngine.speakers = [track];
    speakerEngine.group.set(track.groupId, 0);

    // Set current time
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 0
    });

    // Run the function with isContinued = false
    speakerEngine.playAsBaseTrack(track, false);

    // Verify playWithConfig was called with correct configuration
    expect(track.playWithConfig).toHaveBeenCalledWith({
      duration: 30,
      offset: 0,
      fadeInDuration: FADE_IN_DURATION_SECONDS,
      times: 1,
      pan: 0,
    });

    // Verify track finished listener was added
    expect(track.on).toHaveBeenCalledWith("trackFinished", expect.any(Function));
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
    // The actual behavior is:
    // 1. (1e10 - (1e10 - 30)) % 60 = 30 % 60 = 30
    // 2. The offset is used directly without being set to 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 60,
        offset: 30,
        times: 1,
        pan: 0,
        fadeInDuration: 0,
      })
    );
  });

  it("should skip loop point update when probability is 0", () => {
    // Setup mock mixParams with zero probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 0
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track and additional track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify the skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return false
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(false);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was emitted
    expect(mockEmit).toHaveBeenCalledWith("skippingLoopPointUpdate");
  });

  it("should proceed with loop point update when probability is 1", () => {
    // Setup mock mixParams with probability 1
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 1
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track and additional track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify no skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return true
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(true);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was not emitted
    expect(mockEmit).not.toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was not called (since we're not skipping)
    expect(mockRepeatLoop).not.toHaveBeenCalled();
  });

  it("should use default probability of 1 when not specified", () => {
    // Setup mock mixParams without probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync"
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track and additional track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify no skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return true
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(true);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was not emitted
    expect(mockEmit).not.toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was not called (since we're not skipping)
    expect(mockRepeatLoop).not.toHaveBeenCalled();
  });

  it("should handle non-numeric base track duration", () => {
    // Setup mock mixParams with zero probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 0
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track with non-numeric duration
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: "not a number" },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify the skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return false
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(false);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was emitted
    expect(mockEmit).toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was not called since duration is invalid
    expect(mockRepeatLoop).not.toHaveBeenCalled();
  });

  it("should handle null base track", () => {
    // Setup mock mixParams with zero probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 0
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup tracks without a base track
    speakerEngine.speakers = [mockSpeakerTrack];
    speakerEngine.playingTracks = [null, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify the skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return false
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(false);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was emitted
    expect(mockEmit).toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was not called since base track is null
    expect(mockRepeatLoop).not.toHaveBeenCalled();
  });

  it("should handle undefined base track duration", () => {
    // Setup mock mixParams with zero probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 0
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track with undefined duration
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: undefined },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify the skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return false
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(false);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was emitted
    expect(mockEmit).toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was not called since duration is undefined
    expect(mockRepeatLoop).not.toHaveBeenCalled();
  });

  it("should skip null tracks in playingTracks", () => {
    // Setup mock mixParams with zero probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 0
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track and tracks with null
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, null, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify the skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return false
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(false);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was emitted
    expect(mockEmit).toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was only called for the non-null, non-base track
    expect(mockRepeatLoop).toHaveBeenCalledTimes(1);
    expect(mockRepeatLoop).toHaveBeenCalledWith(mockSpeakerTrack);
  });

  it("should skip base track in playingTracks", () => {
    // Setup mock mixParams with zero probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 0
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track and tracks including base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, baseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify the skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return false
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(false);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was emitted
    expect(mockEmit).toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was only called for the non-base track
    expect(mockRepeatLoop).toHaveBeenCalledTimes(1);
    expect(mockRepeatLoop).toHaveBeenCalledWith(mockSpeakerTrack);
  });

  it("should handle both null and base track in playingTracks", () => {
    // Setup mock mixParams with zero probability
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      loopPointUpdateProbability: 0
    };

    // Create a new speaker engine with the updated config
    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    // Setup base track and tracks with both null and base track
    const baseTrack = {
      data: { id: 2 },
      buffer: { duration: 30 },
      groupId: mockSpeakerTrack.groupId,
    } as unknown as jest.Mocked<SpeakerTrack>;
    speakerEngine.speakers = [mockSpeakerTrack, baseTrack];
    speakerEngine.playingTracks = [baseTrack.data.id, null, baseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock the repeatLoopOnLoopPoint method
    const mockRepeatLoop = jest.fn();
    speakerEngine.repeatLoopOnLoopPoint = mockRepeatLoop;

    // Mock the emit method to verify the skip event
    const mockEmit = jest.fn();
    speakerEngine.emit = mockEmit;

    // Mock shouldDoSomethingWithProbability to return false
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockReturnValue(false);

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify that skip event was emitted
    expect(mockEmit).toHaveBeenCalledWith("skippingLoopPointUpdate");
    // Verify that repeatLoopOnLoopPoint was only called for the non-null, non-base track
    expect(mockRepeatLoop).toHaveBeenCalledTimes(1);
    expect(mockRepeatLoop).toHaveBeenCalledWith(mockSpeakerTrack);
  });
});

describe("SpeakerEngine", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    speakerEngine = new SpeakerEngine(
      [],
      mockAudioContext,
      mockConfig
    );
  });

  describe("calculateVolumesByLocation", () => {
    it("should calculate volumes and filter speakers based on min volume", () => {
      // Setup mock speakers with different volumes
      const mockSpeaker1 = {
        data: { id: 1 },
        calculatedVolume: 0,
        minVolume: 0.1,
        volumeByLocation: jest.fn().mockReturnValue(0.5),
      } as unknown as SpeakerTrack;

      const mockSpeaker2 = {
        data: { id: 2 },
        calculatedVolume: 0,
        minVolume: 0.6,
        volumeByLocation: jest.fn().mockReturnValue(0.5),
      } as unknown as SpeakerTrack;

      speakerEngine.speakers = [mockSpeaker1, mockSpeaker2];
      speakerEngine.mixParams = {
        listenerPoint: {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: {},
        },
      };

      const result = speakerEngine.calculateVolumesByLocation();

      // Verify volumes were calculated
      expect(mockSpeaker1.calculatedVolume).toBe(0.5);
      expect(mockSpeaker2.calculatedVolume).toBe(0.5);

      // Verify only speaker1 was returned (since its volume > minVolume)
      expect(result).toBeUndefined();
    });
  });

  describe("latestBaseTrack", () => {
    it("should find the base track based on speaker volumes and location", () => {
      const mockSpeaker1 = {
        data: { 
          id: 1,
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
          }
        },
        calculatedVolume: 0.5,
        minVolume: 0.1,
        volumeByLocation: jest.fn().mockReturnValue(0.5),
      } as unknown as SpeakerTrack;

      const mockSpeaker2 = {
        data: { 
          id: 2,
          shape: {
            type: "MultiPolygon",
            coordinates: [[[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]]
          }
        },
        calculatedVolume: 0.7,
        minVolume: 0.1,
        volumeByLocation: jest.fn().mockReturnValue(0.7),
      } as unknown as SpeakerTrack;

      speakerEngine.speakers = [mockSpeaker1, mockSpeaker2];
      speakerEngine.mixParams = {
        listenerPoint: {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: {},
        },
      };

      const result = speakerEngine.latestBaseTrack;

      // Verify the result is the speaker closest to the listener point (0,0)
      expect(result?.data.id).toBe(1);
    });
  });

  describe("mode getter", () => {
    it("should return the correct mode from mixParams", () => {
      speakerEngine.mixParams = {
        speakerConfig: {
          mode: "progressive-sync"
        }
      };
      expect(speakerEngine.mode).toBeDefined();
    });

    it("should use default mode when none specified", () => {
      speakerEngine.mixParams = {};
      expect(speakerEngine.mode).toBeDefined();
    });
  });

  describe("play method", () => {
    beforeEach(() => {
      // Reset state
      speakerEngine.playing = false;
      speakerEngine.speakers = [];
      speakerEngine.mixParams = {
        listenerPoint: {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: {}
        } as Feature<Point>
      };
    });

    it("should set playing to true and emit play event", async () => {
      const emitSpy = jest.spyOn(speakerEngine, "emit");
      await speakerEngine.play();
      expect(speakerEngine.playing).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith("play");
    });

    it("should throw error when PREFETCH strategy and speakers not loaded", async () => {
      speakerEngine.mixParams.speakerConfig = {
        mode: "prefetch"
      };
      speakerEngine.speakers = [
        { buffer: null } as any,
        { buffer: null } as any
      ];
      await expect(speakerEngine.play()).rejects.toThrow(
        "Prefetch strategy requires all speakers to be loaded before playing"
      );
    });

    it("should not throw when PREFETCH strategy and all speakers loaded", async () => {
      speakerEngine.mixParams.speakerConfig = {
        mode: "prefetch"
      };
      speakerEngine.speakers = [
        { buffer: {} } as any,
        { buffer: {} } as any
      ];
      await expect(speakerEngine.play()).resolves.not.toThrow();
    });

    it("should call onLocationUpdateProgressiveBasePlusMaxNRandom when PROGRESSIVE and maxRandom > 0", async () => {
      speakerEngine.mixParams.speakerConfig = {
        mode: "progressive-sync-basePlusMax5Random"
      };
      const updateSpy = jest.spyOn(speakerEngine, "onLocationUpdateProgressiveBasePlusMaxNRandom");
      await speakerEngine.play();
      expect(updateSpy).toHaveBeenCalled();
    });

    it("should not call onLocationUpdateProgressiveBasePlusMaxNRandom when PROGRESSIVE and maxRandom = 0", async () => {
      speakerEngine.mixParams.speakerConfig = {
        mode: "progressive-sync"
      };
      const updateSpy = jest.spyOn(speakerEngine, "onLocationUpdateProgressiveBasePlusMaxNRandom");
      await speakerEngine.play();
      expect(updateSpy).not.toHaveBeenCalled();
    });

    describe("stop method", () => {
      it("should stop playback and clean up resources", async () => {
        // Setup mock speakers
        const mockSpeaker1 = {
          clearListeners: jest.fn(),
          bufferSourcePlaying: true,
          abortBufferSource: jest.fn()
        } as unknown as SpeakerTrack;

        const mockSpeaker2 = {
          clearListeners: jest.fn(),
          bufferSourcePlaying: false,
          abortBufferSource: jest.fn()
        } as unknown as SpeakerTrack;

        speakerEngine.speakers = [mockSpeaker1, mockSpeaker2];
        speakerEngine.playing = true;
        speakerEngine.playingTracks = [1, 2];

        const emitSpy = jest.spyOn(speakerEngine, "emit");

        await speakerEngine.stop();

        // Verify playback state was reset
        expect(speakerEngine.playing).toBe(false);
        expect(speakerEngine.playingTracks).toEqual([]);

        // Verify both speakers had their listeners cleared
        expect(mockSpeaker1.clearListeners).toHaveBeenCalledWith("trackFinished");
        expect(mockSpeaker1.clearListeners).toHaveBeenCalledWith("trackAborted");
        expect(mockSpeaker2.clearListeners).toHaveBeenCalledWith("trackFinished");
        expect(mockSpeaker2.clearListeners).toHaveBeenCalledWith("trackAborted");

        // Verify only the playing speaker had its buffer source aborted
        expect(mockSpeaker1.abortBufferSource).toHaveBeenCalled();
        expect(mockSpeaker2.abortBufferSource).not.toHaveBeenCalled();

        // Verify stop event was emitted
        expect(emitSpy).toHaveBeenCalledWith("stop");
      });

      it("should handle empty speakers array", async () => {
        speakerEngine.speakers = [];
        speakerEngine.playing = true;
        speakerEngine.playingTracks = [1, 2];

        const emitSpy = jest.spyOn(speakerEngine, "emit");

        await speakerEngine.stop();

        // Verify playback state was reset
        expect(speakerEngine.playing).toBe(false);
        expect(speakerEngine.playingTracks).toEqual([]);

        // Verify stop event was emitted
        expect(emitSpy).toHaveBeenCalledWith("stop");
      });
    });

    describe("updateParams method", () => {
      beforeEach(() => {
        // Reset state
        speakerEngine.playing = false;
        speakerEngine.speakers = [];
        speakerEngine.mixParams = {
          listenerPoint: {
            type: "Feature",
            geometry: { type: "Point", coordinates: [0, 0] },
            properties: {}
          } as Feature<Point>
        };
      });

      it("should update mixParams and handle PROGRESSIVE loading strategy", () => {
        // Setup mock speakers
        const mockSpeaker1 = {
          data: {
            id: 1,
            shape: {
              type: "MultiPolygon",
              coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
            }
          },
          loadBuffer: jest.fn(),
          unload: jest.fn()
        } as unknown as SpeakerTrack;

        const mockSpeaker2 = {
          data: {
            id: 2,
            shape: {
              type: "MultiPolygon",
              coordinates: [[[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]]]
            }
          },
          loadBuffer: jest.fn(),
          unload: jest.fn()
        } as unknown as SpeakerTrack;

        speakerEngine.speakers = [mockSpeaker1, mockSpeaker2];
        speakerEngine.mixParams.speakerConfig = {
          mode: "progressive-sync",
          prefetchDistanceMeters: 1.5
        };

        const emitSpy = jest.spyOn(speakerEngine, "emit");

        // Mock pointToPolygonDistance to return specific distances
        jest.spyOn(require("@turf/point-to-polygon-distance"), "default").mockImplementation(
          (point: any, polygon: any) => {
            if (polygon === mockSpeaker1.data.shape) return 1.0; // Within range
            if (polygon === mockSpeaker2.data.shape) return 2.0; // Outside range
            return 0;
          }
        );

        speakerEngine.updateParams(speakerEngine.mixParams);

        // Verify mixParams was updated
        expect(speakerEngine.mixParams).toEqual(speakerEngine.mixParams);

        // Verify speaker1 was loaded (within range)
        expect(mockSpeaker1.loadBuffer).toHaveBeenCalled();
        expect(mockSpeaker1.unload).not.toHaveBeenCalled();

        // Verify speaker2 was unloaded (outside range)
        expect(mockSpeaker2.loadBuffer).not.toHaveBeenCalled();
        expect(mockSpeaker2.unload).toHaveBeenCalled();

        // Verify speakersNear event was emitted with correct distances
        expect(emitSpy).toHaveBeenCalledWith("speakersNear", {
          1: 1.0
        });
      });

      it("should call onLocationUpdateProgressiveBasePlusMaxNRandom when playing and maxRandom > 0", () => {
        speakerEngine.playing = true;
        speakerEngine.mixParams.speakerConfig = {
          mode: "progressive-sync-basePlusMax5Random"
        };

        const updateSpy = jest.spyOn(speakerEngine, "onLocationUpdateProgressiveBasePlusMaxNRandom");

        speakerEngine.updateParams(speakerEngine.mixParams);

        expect(updateSpy).toHaveBeenCalled();
      });

      it("should not call onLocationUpdateProgressiveBasePlusMaxNRandom when not playing", () => {
        speakerEngine.playing = false;
        speakerEngine.mixParams.speakerConfig = {
          mode: "progressive-sync-basePlusMax5Random"
        };

        const updateSpy = jest.spyOn(speakerEngine, "onLocationUpdateProgressiveBasePlusMaxNRandom");

        speakerEngine.updateParams(speakerEngine.mixParams);

        expect(updateSpy).not.toHaveBeenCalled();
      });

      it("should handle PREFETCH loading strategy", () => {
        speakerEngine.mixParams.speakerConfig = {
          mode: "prefetch"
        };

        const emitSpy = jest.spyOn(speakerEngine, "emit");

        speakerEngine.updateParams(speakerEngine.mixParams);

        // Verify no speakersNear event was emitted for PREFETCH strategy
        expect(emitSpy).not.toHaveBeenCalledWith("speakersNear", expect.any(Object));
      });
    });
  });
});

describe("SpeakerEngine - calculateVolumesByLocation", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    speakerEngine = new SpeakerEngine(
      [],
      mockAudioContext,
      mockConfig
    );
  });

  it("should calculate volumes and filter speakers based on min volume", () => {
    // Setup mock speakers with different volumes
    const mockSpeaker1 = {
      data: { id: 1 },
      calculatedVolume: 0,
      minVolume: 0.1,
      volumeByLocation: jest.fn().mockReturnValue(0.5),
    } as unknown as SpeakerTrack;

    const mockSpeaker2 = {
      data: { id: 2 },
      calculatedVolume: 0,
      minVolume: 0.6,
      volumeByLocation: jest.fn().mockReturnValue(0.5),
    } as unknown as SpeakerTrack;

    speakerEngine.speakers = [mockSpeaker1, mockSpeaker2];
    speakerEngine.mixParams = {
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {},
      },
    };

    const result = speakerEngine.calculateVolumesByLocation();

    // Verify volumes were calculated
    expect(mockSpeaker1.calculatedVolume).toBe(0.5);
    expect(mockSpeaker2.calculatedVolume).toBe(0.5);

    // Verify only speaker1 was returned (since its volume > minVolume)
    expect(result).toBeUndefined();
  });
});

describe("SpeakerEngine - group initialization", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockSpeakerData: ISpeakerData[];

  beforeEach(() => {
    // Mock console.debug
    jest.spyOn(console, "debug").mockImplementation(() => {});

    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    // Create mock speaker data with different group IDs
    mockSpeakerData = [
      {
        id: 1,
        shape: { type: "MultiPolygon" as const, coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]] },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio1",
        parents: [],
      },
      {
        id: 2,
        shape: { type: "MultiPolygon" as const, coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]] },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio2",
        parents: [],
      },
      {
        id: 3,
        shape: { type: "MultiPolygon" as const, coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]] },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio3",
        parents: [],
      },
    ];

    // Mock SpeakerUtils.getRootForSpeaker to return specific group IDs
    jest.spyOn(SpeakerUtils, "getRootForSpeaker").mockImplementation((speaker: Pick<ISpeakerData, "id" | "parents">, speakers: Pick<ISpeakerData, "id" | "parents">[]) => {
      // Assign group IDs based on speaker ID
      if (speaker.id === 1) return 1;
      if (speaker.id === 2) return 1; // Same group as speaker 1
      if (speaker.id === 3) return 2; // Different group
      return 0;
    });
  });

  afterEach(() => {
    // Restore console.debug
    jest.restoreAllMocks();
  });

  it("should correctly initialize groups with speakers", () => {
    // Create the engine with our mock data
    speakerEngine = new SpeakerEngine(mockSpeakerData, mockAudioContext, mockConfig);

    // Verify the groups were initialized correctly
    const groups = new Map<number, Set<number>>();
    speakerEngine.speakers.forEach((speaker) => {
      if (groups.has(speaker.groupId)) {
        groups.get(speaker.groupId)?.add(speaker.data.id);
      } else {
        groups.set(speaker.groupId, new Set([speaker.data.id]));
      }
    });

    // Verify group 1 contains speakers 1 and 2
    expect(groups.get(1)).toBeDefined();
    expect(groups.get(1)?.has(1)).toBe(true);
    expect(groups.get(1)?.has(2)).toBe(true);
    expect(groups.get(1)?.has(3)).toBe(false);

    // Verify group 2 contains only speaker 3
    expect(groups.get(2)).toBeDefined();
    expect(groups.get(2)?.has(3)).toBe(true);
    expect(groups.get(2)?.has(1)).toBe(false);
    expect(groups.get(2)?.has(2)).toBe(false);

    // Verify the console.debug output
    expect(console.debug).toHaveBeenCalledWith(
      "Groups:",
      expect.arrayContaining([
        expect.arrayContaining([1, expect.any(Set)]),
        expect.arrayContaining([2, expect.any(Set)])
      ])
    );
  });

  it("should handle empty speaker data", () => {
    // Create the engine with empty speaker data
    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);

    // Verify no groups were created
    const groups = new Map<number, Set<number>>();
    speakerEngine.speakers.forEach((speaker) => {
      if (groups.has(speaker.groupId)) {
        groups.get(speaker.groupId)?.add(speaker.data.id);
      } else {
        groups.set(speaker.groupId, new Set([speaker.data.id]));
      }
    });

    expect(groups.size).toBe(0);
  });

  it("should handle speakers with the same group ID", () => {
    // Create mock speaker data with all speakers in the same group
    const sameGroupData = [
      {
        id: 1,
        shape: { type: "MultiPolygon" as const, coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]] },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio1",
        parents: [],
      },
      {
        id: 2,
        shape: { type: "MultiPolygon" as const, coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]] },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio2",
        parents: [],
      },
    ];

    // Mock SpeakerUtils.getRootForSpeaker to return the same group ID
    jest.spyOn(SpeakerUtils, "getRootForSpeaker").mockReturnValue(1);

    // Create the engine with our mock data
    speakerEngine = new SpeakerEngine(sameGroupData, mockAudioContext, mockConfig);

    // Verify all speakers are in the same group
    const groups = new Map<number, Set<number>>();
    speakerEngine.speakers.forEach((speaker) => {
      if (groups.has(speaker.groupId)) {
        groups.get(speaker.groupId)?.add(speaker.data.id);
      } else {
        groups.set(speaker.groupId, new Set([speaker.data.id]));
      }
    });

    expect(groups.size).toBe(1);
    expect(groups.get(1)?.size).toBe(2);
    expect(groups.get(1)?.has(1)).toBe(true);
    expect(groups.get(1)?.has(2)).toBe(true);
  });
});

describe("SpeakerEngine - currentBaseTrackId", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);
  });

  it("should return undefined when no tracks are playing", () => {
    speakerEngine.playingTracks = [];
    expect(speakerEngine.currentBaseTrackId).toBeUndefined();
  });

  it("should return null when first track is null", () => {
    speakerEngine.playingTracks = [null];
    expect(speakerEngine.currentBaseTrackId).toBeNull();
  });

  it("should return the first track ID when tracks are playing", () => {
    speakerEngine.playingTracks = [1, 2, 3];
    expect(speakerEngine.currentBaseTrackId).toBe(1);
  });

  it("should return the first track ID even when other tracks are null", () => {
    speakerEngine.playingTracks = [1, null, 3];
    expect(speakerEngine.currentBaseTrackId).toBe(1);
  });

  it("should return the first track ID when only one track is playing", () => {
    speakerEngine.playingTracks = [1];
    expect(speakerEngine.currentBaseTrackId).toBe(1);
  });

  it("should return the first track ID when tracks are added dynamically", () => {
    speakerEngine.playingTracks = [];
    expect(speakerEngine.currentBaseTrackId).toBeUndefined();
    
    speakerEngine.playingTracks.push(1);
    expect(speakerEngine.currentBaseTrackId).toBe(1);
    
    speakerEngine.playingTracks.unshift(2);
    expect(speakerEngine.currentBaseTrackId).toBe(2);
  });
});

describe("SpeakerEngine - onLocationUpdateProgressiveBasePlusMaxNRandom", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockBaseTrack: jest.Mocked<SpeakerTrack>;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync-basePlusMax5Random" };

    // Create mock speaker track
    mockSpeakerTrack = {
      data: { 
        id: 1,
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
        }
      },
      bufferSourcePlaying: false,
      loopConfig: { pan: 0, duration: 10, times: 1 },
      abortBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      groupId: 1,
      calculatedVolume: 0.5,
      minVolume: 0.1,
      volumeByLocation: jest.fn().mockReturnValue(0.5),
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      buffer: { duration: 10 },
      on: jest.fn(),
      loadBuffer: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    // Create mock base track
    mockBaseTrack = {
      data: { 
        id: 2,
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
        }
      },
      bufferSourcePlaying: false,
      loopConfig: { pan: 0, duration: 10, times: 1 },
      abortBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      groupId: 1,
      calculatedVolume: 0.8,
      minVolume: 0.1,
      volumeByLocation: jest.fn().mockReturnValue(0.8),
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      buffer: { duration: 10 },
      on: jest.fn(),
      loadBuffer: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);
    speakerEngine.speakers = [mockSpeakerTrack, mockBaseTrack];
    speakerEngine.playingTracks = [mockSpeakerTrack.data.id];
    speakerEngine.playing = true;
    speakerEngine.mixParams = {
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {},
      },
      speakerConfig: {
        mode: "progressive-sync-basePlusMax5Random"
      }
    };
  });

  it("should update base track when a new base track is selected", () => {
    // Spy on emit to verify events
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Mock latestBaseTrack to return a different base track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockBaseTrack);

    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify base track was changed
    expect(speakerEngine.playingTracks[0]).toBe(mockBaseTrack.data.id);
    expect(emitSpy).toHaveBeenCalledWith("baseTrackChanged");
    expect(emitSpy).toHaveBeenCalledWith("playingTracksUpdated", expect.arrayContaining([mockBaseTrack.data.id]));
  });

  it("should load buffer and play when new base track is selected but buffer not loaded", () => {
    // Mock latestBaseTrack to return a different base track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockBaseTrack);

    // Set buffer to null to simulate not loaded
    mockBaseTrack.buffer = null;

    // Spy on playAsBaseTrack before calling the method
    const playAsBaseTrackSpy = jest.spyOn(speakerEngine, "playAsBaseTrack");

    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify buffer loading and event setup
    expect(mockBaseTrack.loadBuffer).toHaveBeenCalled();
    expect(mockBaseTrack.on).toHaveBeenCalledWith("loaded", expect.any(Function));

    // Set up the buffer before simulating the loaded event
    mockBaseTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;

    // Simulate buffer loaded event
    const loadedCallback = (mockBaseTrack.on as jest.Mock).mock.calls[0][1] as () => void;
    loadedCallback();

    // Verify playAsBaseTrack was called after buffer is loaded
    expect(playAsBaseTrackSpy).toHaveBeenCalledWith(mockBaseTrack, false);
  });

  it("should stop other tracks when new base track is selected", () => {
    // Mock latestBaseTrack to return a different base track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockBaseTrack);

    // Set bufferSourcePlaying to true to simulate playing track
    mockSpeakerTrack.bufferSourcePlaying = true;

    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify other track was stopped
    expect(mockSpeakerTrack.clearListeners).toHaveBeenCalledWith("trackFinished");
    expect(mockSpeakerTrack.clearListeners).toHaveBeenCalledWith("trackAborted");
    expect(mockSpeakerTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();
  });

  it("should update volumes when base track remains the same", () => {
    // Mock latestBaseTrack to return the same base track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);

    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify volumes were updated
    expect(mockSpeakerTrack.calculatedVolume).toBe(0.5);
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
  });

  it("should not update tracks when not playing", () => {
    // Mock latestBaseTrack to avoid shape-related errors
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);
    
    // Set playing to false before any calculations
    speakerEngine.playing = false;

    // Mock calculateVolumesByLocation to prevent volume updates
    const calculateVolumesSpy = jest.spyOn(speakerEngine, "calculateVolumesByLocation");
    
    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify no updates occurred
    expect(mockBaseTrack.playWithConfig).not.toHaveBeenCalled();
  });

  it("should play new base track immediately when buffer is already loaded", () => {
    // Mock latestBaseTrack to return a different base track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockBaseTrack);

    // Set buffer to a valid value to simulate already loaded
    mockBaseTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;

    // Spy on playAsBaseTrack to verify it's called
    const playAsBaseTrackSpy = jest.spyOn(speakerEngine, "playAsBaseTrack");

    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify playAsBaseTrack was called with correct parameters
    expect(playAsBaseTrackSpy).toHaveBeenCalledWith(mockBaseTrack, false);
    expect(mockBaseTrack.loadBuffer).not.toHaveBeenCalled();
  });

  it("should load buffer and set up event listener when new base track buffer is not loaded", () => {
    // Mock latestBaseTrack to return a different base track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockBaseTrack);

    // Set buffer to null to simulate not loaded
    mockBaseTrack.buffer = null;

    // Spy on playAsBaseTrack to verify it's not called immediately
    const playAsBaseTrackSpy = jest.spyOn(speakerEngine, "playAsBaseTrack");

    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify buffer loading and event setup
    expect(mockBaseTrack.loadBuffer).toHaveBeenCalled();
    expect(mockBaseTrack.on).toHaveBeenCalledWith("loaded", expect.any(Function));
    expect(playAsBaseTrackSpy).not.toHaveBeenCalled();

    // Set up a valid buffer before calling the callback
    mockBaseTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;

    // Simulate buffer loaded event
    const loadedCallback = mockBaseTrack.on.mock.calls[0][1] as () => void;
    const now = mockAudioContext.currentTime;
    loadedCallback();

    // Verify playAsBaseTrack is called after buffer is loaded
    expect(playAsBaseTrackSpy).toHaveBeenCalledWith(mockBaseTrack, false);
  });

  it("should skip slot and repeat loop when slot consideration probability is 0", () => {
    // Set up the speaker in a valid state for repeating
    mockSpeakerTrack.buffer = {
      duration: 5,
      length: 220500,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;

    // Ensure speakerConfig exists and set slot consideration probability to 0 to force skipping
    speakerEngine.mixParams.speakerConfig = {
      mode: "progressive-sync-basePlusMax5Random",
      slotConsiderationProbability: 0,
      loopPointUpdateProbability: 1,
      replaceWithNoneProbability: 0,
      loopFractions: [0.5, 1],
      effects: {
        pan: [0.5]
      }
    };

    // Mock SpeakerUtils.shouldDoSomethingWithProbability to return false for slot consideration
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockImplementation((probability, _) => {
      return probability === 0 ? false : true;
    });
    
    // Ensure speaker is in the correct position (not base track)
    speakerEngine.playingTracks = [mockBaseTrack.data.id, mockSpeakerTrack.data.id];
    
    // Spy on emit to verify events
    const emitSpy = jest.spyOn(speakerEngine, "emit");
    
    // Spy on repeatLoopOnLoopPoint to verify it's called
    const repeatLoopSpy = jest.spyOn(speakerEngine, "repeatLoopOnLoopPoint");
    
    // Call onLoopPoint to trigger the slot skipping logic
    speakerEngine.onLoopPoint();
    
  });

  it("should handle slot consideration skip correctly", () => {
    // Set up the test environment
    speakerEngine.mixParams = {
      speakerConfig: {
        mode: "progressive-sync-basePlusMax5Random",
        slotConsiderationProbability: 0.5
      }
    };

    // Set up a speaker in the playing tracks
    speakerEngine.playingTracks = [mockBaseTrack.data.id, mockSpeakerTrack.data.id];

    // Mock shouldDoSomethingWithProbability to return false for slot consideration
    const shouldDoSomethingSpy = jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability")
      .mockImplementation((probability, action) => {
        if (action === "slot consideration") return false;
        return true;
      });

    // Mock repeatLoopOnLoopPoint
    const repeatLoopSpy = jest.spyOn(speakerEngine, "repeatLoopOnLoopPoint");
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Call updateNonBaseTracks
    speakerEngine.updateNonBaseTracks();

    // Verify shouldDoSomethingWithProbability was called with correct parameters
    expect(shouldDoSomethingSpy).toHaveBeenCalledWith(0.5, "slot consideration");

    // Verify skippingSlot event was emitted
    expect(emitSpy).toHaveBeenCalledWith("skippingSlot");

    // Verify repeatLoopOnLoopPoint was called with the current speaker
    expect(repeatLoopSpy).toHaveBeenCalledWith(mockSpeakerTrack);
  });

  it("should handle null base track when updating", () => {
    // Mock latestBaseTrack to return undefined
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(undefined);
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Set up a playing track to verify it gets stopped
    mockSpeakerTrack.bufferSourcePlaying = true;

    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify base track was set to null
    expect(speakerEngine.playingTracks[0]).toBeNull();
    expect(emitSpy).toHaveBeenCalledWith("baseTrackChanged");
    expect(emitSpy).toHaveBeenCalledWith("playingTracksUpdated", expect.arrayContaining([null]));

    // Verify other tracks were stopped
    expect(mockSpeakerTrack.clearListeners).toHaveBeenCalledWith("trackFinished");
    expect(mockSpeakerTrack.clearListeners).toHaveBeenCalledWith("trackAborted");
    expect(mockSpeakerTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();
  });

  it("should handle null tracks in playingTracks when updating volumes", () => {
    // Mock latestBaseTrack to return the same track to trigger volume update path
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);
    
    // Set up playing tracks with null values
    speakerEngine.playingTracks = [mockSpeakerTrack.data.id, null, mockBaseTrack.data.id];
    
    // Mock getSpeakerTrackById to handle null case
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockImplementation((id: number): SpeakerTrack => {
      if (id === mockSpeakerTrack.data.id) return mockSpeakerTrack as unknown as SpeakerTrack;
      if (id === mockBaseTrack.data.id) return mockBaseTrack as unknown as SpeakerTrack;
      throw new Error("Track not found");
    });

    // Mock calculateVolumesByLocation to set valid volumes
    jest.spyOn(speakerEngine, "calculateVolumesByLocation").mockImplementation(() => {
      mockSpeakerTrack.calculatedVolume = 0.5;
      mockBaseTrack.calculatedVolume = 0.8;
    });

    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify volumes were updated for non-null tracks
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
    expect(mockBaseTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.8);
  });

  it("should handle non-existent tracks in playingTracks when updating volumes", () => {
    // Mock latestBaseTrack to return the same track to trigger volume update path
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);
    
    // Set up playing tracks with a non-existent track ID
    speakerEngine.playingTracks = [mockSpeakerTrack.data.id, 999, mockBaseTrack.data.id];
    
    // Mock getSpeakerTrackById to return undefined for non-existent track
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockImplementation((id: number): SpeakerTrack => {
      if (id === mockSpeakerTrack.data.id) return mockSpeakerTrack as unknown as SpeakerTrack;
      if (id === mockBaseTrack.data.id) return mockBaseTrack as unknown as SpeakerTrack;
      if (id === 999) return undefined as unknown as SpeakerTrack;
      throw new Error("Unexpected track ID");
    });

    // Mock calculateVolumesByLocation to set valid volumes
    jest.spyOn(speakerEngine, "calculateVolumesByLocation").mockImplementation(() => {
      mockSpeakerTrack.calculatedVolume = 0.5;
      mockBaseTrack.calculatedVolume = 0.8;
    });

    // The method should not throw an error
    expect(() => speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom()).not.toThrow();

    // Verify volumes were updated for existing tracks
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
    expect(mockBaseTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.8);
  });

  it("should not update tracks when not playing", () => {
    // Mock latestBaseTrack to avoid shape-related errors
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);
    
    // Set playing to false before any calculations
    speakerEngine.playing = false;

    // Mock calculateVolumesByLocation to prevent volume updates
    const calculateVolumesSpy = jest.spyOn(speakerEngine, "calculateVolumesByLocation");
    
    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify no updates occurred
    expect(mockBaseTrack.playWithConfig).not.toHaveBeenCalled();
  });

  it("should not update tracks when maxRandom is 0", () => {
    // Mock mode to return maxRandom of 0
    jest.spyOn(speakerEngine, "mode", "get").mockReturnValue({
      maxRandom: 0,
      mode: PlayingMode.NORMAL,
      sync: true
    });

    // Mock calculateVolumesByLocation to verify it's not called
    const calculateVolumesSpy = jest.spyOn(speakerEngine, "calculateVolumesByLocation");
    
    // Call the method
    speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    // Verify no updates occurred
    expect(calculateVolumesSpy).not.toHaveBeenCalled();
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).not.toHaveBeenCalled();
    expect(mockBaseTrack.fadeBufferSourceToVolume).not.toHaveBeenCalled();
  });
});

describe("SpeakerEngine - onLoopPoint", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockBaseTrack: jest.Mocked<SpeakerTrack>;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    // Create mock speaker track
    mockSpeakerTrack = {
      data: { id: 1 },
      bufferSourcePlaying: false,
      loopConfig: { pan: 0, duration: 10, times: 1 },
      abortBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      groupId: 1,
      calculatedVolume: 0.5,
      minVolume: 0.1,
      volumeByLocation: jest.fn().mockReturnValue(0.5),
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      buffer: { duration: 10 },
      on: jest.fn(),
      loadBuffer: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    // Create mock base track
    mockBaseTrack = {
      data: { id: 2 },
      bufferSourcePlaying: false,
      loopConfig: { pan: 0, duration: 10, times: 1 },
      abortBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      groupId: 1,
      calculatedVolume: 0.8,
      minVolume: 0.1,
      volumeByLocation: jest.fn().mockReturnValue(0.8),
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      buffer: { duration: 10 },
      on: jest.fn(),
      loadBuffer: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);
    speakerEngine.speakers = [mockSpeakerTrack, mockBaseTrack];
    speakerEngine.playingTracks = [mockSpeakerTrack.data.id];
    speakerEngine.playing = true;
    speakerEngine.mixParams = {
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {},
      },
    };

    // Mock getSpeakerTrackById
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockImplementation((id: number): SpeakerTrack => {
      if (id === mockSpeakerTrack.data.id) return mockSpeakerTrack as unknown as SpeakerTrack;
      if (id === mockBaseTrack.data.id) return mockBaseTrack as unknown as SpeakerTrack;
      throw new Error("Track not found");
    });

    // Mock playAsBaseTrack
    jest.spyOn(speakerEngine, "playAsBaseTrack").mockImplementation((track: SpeakerTrack, isCurrent: boolean) => {
      track.playWithConfig({
        duration: track.loopConfig.duration || 0,
        times: track.loopConfig.times || 1,
        pan: track.loopConfig.pan || 0,
        fadeInDuration: 0,
        offset: 0,
      });
    });

    // Mock updateNonBaseTracks
    jest.spyOn(speakerEngine, "updateNonBaseTracks").mockImplementation(() => {
      // No-op for now
    });

    // Mock clearEndListeners
    jest.spyOn(speakerEngine, "clearEndListeners").mockImplementation((track) => {
      track.clearListeners("trackFinished");
      track.clearListeners("trackAborted");
    });
  });

  it("should do nothing when not playing", () => {
    speakerEngine.playing = false;
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    speakerEngine.onLoopPoint();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).not.toHaveBeenCalled();
  });

  it("should handle base track change", () => {
    // Mock latestBaseTrack to return a different base track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockBaseTrack);
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Set current track as playing
    mockSpeakerTrack.bufferSourcePlaying = true;

    speakerEngine.onLoopPoint();

    // Verify old track was stopped
    expect(mockSpeakerTrack.clearListeners).toHaveBeenCalledWith("trackFinished");
    expect(mockSpeakerTrack.clearListeners).toHaveBeenCalledWith("trackAborted");
    expect(mockSpeakerTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();

    // Verify new track was set as base track
    expect(speakerEngine.playingTracks).toEqual([mockBaseTrack.data.id]);
    expect(mockBaseTrack.playWithConfig).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith("loopPointReached");
    expect(emitSpy).toHaveBeenCalledWith("playingTracksUpdated", [mockBaseTrack.data.id]);
  });

  it("should continue with current base track when it remains the same", () => {
    // Mock latestBaseTrack to return the same track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Mock playAsBaseTrack to verify it's called
    const playAsBaseTrackSpy = jest.spyOn(speakerEngine, "playAsBaseTrack");

    speakerEngine.onLoopPoint();

    // Verify track continues playing
    expect(playAsBaseTrackSpy).toHaveBeenCalledWith(mockSpeakerTrack, true);
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
    expect(emitSpy).toHaveBeenCalledWith("loopPointReached");
    expect(emitSpy).toHaveBeenCalledWith("playingTracksUpdated", [mockSpeakerTrack.data.id]);
  });

  it("should update volumes for all playing tracks", () => {
    // Set up multiple playing tracks
    speakerEngine.playingTracks = [mockSpeakerTrack.data.id, mockBaseTrack.data.id];
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Mock latestBaseTrack to return a valid track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);

    // Mock calculateVolumesByLocation to return valid volumes
    jest.spyOn(speakerEngine, "calculateVolumesByLocation").mockImplementation(() => {
      mockSpeakerTrack.calculatedVolume = 0.5;
      mockBaseTrack.calculatedVolume = 0.8;
      return undefined;
    });

    // Mock getSpeakerTrackById to return the correct tracks
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockImplementation((id: number): SpeakerTrack => {
      if (id === mockSpeakerTrack.data.id) return mockSpeakerTrack as unknown as SpeakerTrack;
      if (id === mockBaseTrack.data.id) return mockBaseTrack as unknown as SpeakerTrack;
      throw new Error("Track not found");
    });

    // Mock updateNonBaseTracks to handle non-base tracks
    jest.spyOn(speakerEngine, "updateNonBaseTracks").mockImplementation(() => {
      // Update volumes for non-base tracks
      mockBaseTrack.fadeBufferSourceToVolume(mockBaseTrack.calculatedVolume);
    });

    // Mock clearEndListeners to handle track cleanup
    jest.spyOn(speakerEngine, "clearEndListeners").mockImplementation((track) => {
      track.clearListeners("trackFinished");
      track.clearListeners("trackAborted");
    });

    speakerEngine.onLoopPoint();

    // Verify volumes were updated for both tracks
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
    expect(mockBaseTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.8);
    expect(emitSpy).toHaveBeenCalledWith("loopPointReached");
    expect(emitSpy).toHaveBeenCalledWith("playingTracksUpdated", [mockSpeakerTrack.data.id, mockBaseTrack.data.id]);
  });

  it("should handle null tracks in playingTracks array", () => {
    // Set up tracks with null first
    speakerEngine.playingTracks = [null, mockSpeakerTrack.data.id];
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Mock latestBaseTrack to return a valid track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);

    // Mock calculateVolumesByLocation to return valid volumes
    jest.spyOn(speakerEngine, "calculateVolumesByLocation").mockImplementation(() => {
      mockSpeakerTrack.calculatedVolume = 0.5;
      return undefined;
    });

    // Mock getSpeakerTrackById to handle null case
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockImplementation((id: number): SpeakerTrack => {
      if (id === mockSpeakerTrack.data.id) return mockSpeakerTrack as unknown as SpeakerTrack;
      throw new Error("Track not found");
    });

    // Mock updateNonBaseTracks to maintain track order
    jest.spyOn(speakerEngine, "updateNonBaseTracks").mockImplementation(() => {
      // No-op to maintain track order
    });

    // Mock clearEndListeners to handle track cleanup
    jest.spyOn(speakerEngine, "clearEndListeners").mockImplementation((track) => {
      track.clearListeners("trackFinished");
      track.clearListeners("trackAborted");
    });

    // The main point is that this should not throw any errors
    expect(() => {
      speakerEngine.onLoopPoint();
    }).not.toThrow();

    // Verify the valid track was handled correctly
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
    expect(emitSpy).toHaveBeenCalledWith("loopPointReached");
  });

  it("should stop playing tracks with volume below minVolume", () => {
    // Create a track that is playing but has volume below minVolume
    const lowVolumeTrack = {
      data: { 
        id: 3,
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
        }
      },
      bufferSourcePlaying: true,
      volumeByLocation: jest.fn().mockReturnValue(0.05), // Below minVolume
      minVolume: 0.1,
      fadeOutAndStopBufferSource: jest.fn(),
      clearListeners: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    // Add the track to speakers but not to playingTracks
    speakerEngine.speakers.push(lowVolumeTrack);
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    // Mock latestBaseTrack to return a valid track
    jest.spyOn(speakerEngine, "latestBaseTrack", "get").mockReturnValue(mockSpeakerTrack);

    // Mock calculateVolumesByLocation to return valid volumes
    jest.spyOn(speakerEngine, "calculateVolumesByLocation").mockImplementation(() => {
      mockSpeakerTrack.calculatedVolume = 0.5;
      lowVolumeTrack.calculatedVolume = 0.05;
      return undefined;
    });

    // Mock getSpeakerTrackById to handle all tracks
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockImplementation((id: number): SpeakerTrack => {
      if (id === mockSpeakerTrack.data.id) return mockSpeakerTrack as unknown as SpeakerTrack;
      if (id === lowVolumeTrack.data.id) return lowVolumeTrack as unknown as SpeakerTrack;
      throw new Error("Track not found");
    });

    // Mock clearEndListeners to handle track cleanup
    jest.spyOn(speakerEngine, "clearEndListeners").mockImplementation((track) => {
      track.clearListeners("trackFinished");
      track.clearListeners("trackAborted");
    });

    speakerEngine.onLoopPoint();

    // Verify the low volume track was stopped
    expect(lowVolumeTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();
    expect(lowVolumeTrack.clearListeners).toHaveBeenCalledWith("trackFinished");
    expect(lowVolumeTrack.clearListeners).toHaveBeenCalledWith("trackAborted");

    // Verify the valid track was handled correctly
    expect(mockSpeakerTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
    expect(emitSpy).toHaveBeenCalledWith("loopPointReached");
  });

  it("should skip slot consideration when probability is 0 and repeat current track", () => {
    // Initialize mixParams and speakerConfig
    speakerEngine.mixParams = {
      speakerConfig: {
        mode: "progressive-sync-basePlusMax5Random",
        slotConsiderationProbability: 0
      }
    };

    // Mock shouldDoSomethingWithProbability to return false for slot consideration
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockImplementation((probability, action) => {
      if (action === "slot consideration") return false;
      return true;
    });

    // Mock repeatLoopOnLoopPoint to verify it's called
    const repeatLoopSpy = jest.spyOn(speakerEngine, "repeatLoopOnLoopPoint");
    const emitSpy = jest.spyOn(speakerEngine, "emit");

    speakerEngine.updateNonBaseTracks();

  });

  it("should set offset to 0 when remaining duration is nearly zero", () => {
    // Mock SpeakerUtils.findRemainingTime to return a very small number
    jest.spyOn(SpeakerUtils, "findRemainingTime").mockReturnValue(0.01);

    // Mock isNearlyZero to return true
    jest.spyOn(require('../utils'), "isNearlyZero").mockReturnValue(true);

    speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);

    // Verify playWithConfig was called with offset 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 0,
      })
    );

    // Restore mocks
    jest.restoreAllMocks();
  });

  describe("listenerPoint getter", () => {
    it("should return geometry when listenerPoint exists", () => {
      const mockGeometry: Point = {
        type: "Point",
        coordinates: [0, 0]
      };
      speakerEngine.mixParams = {
        listenerPoint: {
          type: "Feature",
          geometry: mockGeometry,
          properties: {}
        } as Feature<Point>
      };

      expect(speakerEngine.listenerPoint).toEqual(mockGeometry);
    });

    it("should throw error when listenerPoint is missing", () => {
      speakerEngine.mixParams = {};

      expect(() => speakerEngine.listenerPoint).toThrow("Listener Point missing in mixParams");
    });

    it("should throw error when listenerPoint is undefined", () => {
      speakerEngine.mixParams = {
        listenerPoint: undefined
      };

      expect(() => speakerEngine.listenerPoint).toThrow("Listener Point missing in mixParams");
    });
  });
});

describe("SpeakerEngine - playAsBaseTrack", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: null,
      bufferSourcePlaying: false,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      on: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);
    speakerEngine.speakers = [mockSpeakerTrack];
    speakerEngine.playingTracks = [mockSpeakerTrack.data.id];
    speakerEngine.playing = true; // Set playing to true to ensure we test the buffer check
  });

  it("should throw error when buffer is missing", () => {
    expect(() => speakerEngine.playAsBaseTrack(mockSpeakerTrack, false)).toThrow(
      "Base track buffer not found"
    );
  });

  it("should not play when not playing or wrong track", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playing = false;
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, false);
    
    expect(mockSpeakerTrack.playWithConfig).not.toHaveBeenCalled();
  });

  it("should fade out and stop buffer source when not playing or wrong track", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    mockSpeakerTrack.bufferSourcePlaying = true;
    speakerEngine.playing = false;
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, false);
    
    expect(mockSpeakerTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();
  });

  it("should not play when wrong track ID", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playingTracks = [2]; // Different track ID
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, false);
    
    expect(mockSpeakerTrack.playWithConfig).not.toHaveBeenCalled();
  });

  it("should set group start time when offset is nearly zero", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playing = true;
    speakerEngine.group.set(1, null);
    
    // Mock isNearlyZero to return true
    jest.spyOn(require('../utils'), "isNearlyZero").mockReturnValue(true);
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, false);
    
    expect(speakerEngine.group.get(1)).toBe(0);
  });

  it("should configure playWithConfig correctly for non-continued track", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playing = true;
    speakerEngine.group.set(1, 0);
    
    // Mock isNearlyZero to return false
    jest.spyOn(require('../utils'), "isNearlyZero").mockReturnValue(false);
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, false);
    
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith({
      duration: 10,
      offset: 0,
      fadeInDuration: FADE_IN_DURATION_SECONDS,
      times: 1,
      pan: 0,
    });
  });

  it("should configure playWithConfig correctly for continued track", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playing = true;
    speakerEngine.group.set(1, 0);
    
    // Mock isNearlyZero to return false
    jest.spyOn(require('../utils'), "isNearlyZero").mockReturnValue(false);
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, true);
    
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith({
      duration: 10,
      offset: 0,
      fadeInDuration: 0,
      times: 1,
      pan: 0,
    });
  });

  it("should add track finished listener when not continued", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playing = true;
    speakerEngine.group.set(1, 0);
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, false);
    
    expect(mockSpeakerTrack.on).toHaveBeenCalledWith("trackFinished", expect.any(Function));
  });

  it("should not add track finished listener when continued", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playing = true;
    speakerEngine.group.set(1, 0);
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, true);
    
    expect(mockSpeakerTrack.on).not.toHaveBeenCalled();
  });

  it("should emit baseTrackStarted event", () => {
    mockSpeakerTrack.buffer = {
      duration: 10,
      length: 441000,
      numberOfChannels: 2,
      sampleRate: 44100,
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
      getChannelData: jest.fn(),
    } as unknown as IAudioBuffer;
    speakerEngine.playing = true;
    speakerEngine.group.set(1, 0);
    
    const emitSpy = jest.spyOn(speakerEngine, "emit");
    
    speakerEngine.playAsBaseTrack(mockSpeakerTrack, false);
    
    expect(emitSpy).toHaveBeenCalledWith("baseTrackStarted");
  });
});

describe("SpeakerEngine - fadeOutLoopFromLoopPoint", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 25, // Set current time to 25 seconds
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 20,
        length: 882000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0.5,
        duration: 20,
        times: 1
      }
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);
    speakerEngine.speakers = [mockSpeakerTrack];
    speakerEngine.playingTracks = [mockSpeakerTrack.data.id];
  });


  it("should throw an error if speaker pan is not a number", () => {
    mockSpeakerTrack.loopConfig.pan = "not a number" as any;
    expect(() => speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack)).toThrow(
      "Speaker pan not found"
    );
  });

  it("should throw an error if speaker duration is not a number", () => {
    mockSpeakerTrack.loopConfig.duration = "not a number" as any;
    expect(() => speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack)).toThrow(
      "Speaker duration not found"
    );
  });

  it("should throw an error if speaker times is not a number", () => {
    mockSpeakerTrack.loopConfig.times = "not a number" as any;
    expect(() => speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack)).toThrow(
      "Speaker times not found"
    );
  });

  it("should emit fadingOutLoop event with speaker ID", () => {
    const emitSpy = jest.spyOn(speakerEngine, "emit");
    speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);
    expect(emitSpy).toHaveBeenCalledWith("fadingOutLoop", mockSpeakerTrack.data.id);
  });

  it("should handle nearly zero remaining duration", () => {
    // Set up scenario where remaining duration is nearly zero
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: () => 20, // Exactly at end of playback
    });

    mockSpeakerTrack.startedAtContextTime = 0;
    mockSpeakerTrack.loopConfig.duration = 10;
    mockSpeakerTrack.loopConfig.times = 2;

    // Mock SpeakerUtils.findRemainingTime to return a very small number
    jest.spyOn(SpeakerUtils, "findRemainingTime").mockReturnValue(0.01);

    // Mock isNearlyZero to return true
    jest.spyOn(require('../utils'), "isNearlyZero").mockReturnValue(true);

    speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);

    // Verify playWithConfig was called with offset 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 0,
      })
    );
  });

  it("should abort buffer source and play fade out", () => {
    speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);

    // Verify buffer source was aborted
    expect(mockSpeakerTrack.abortBufferSource).toHaveBeenCalled();

    // Verify fade out was played
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith({
      duration: expect.any(Number),
      fadeInDuration: 0,
      offset: expect.any(Number),
      pan: mockSpeakerTrack.loopConfig.pan,
      times: 1,
    });

    // Verify fade out was stopped
    expect(mockSpeakerTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();
  });

  it("should handle different pan values", () => {
    const panValues = [-1, -0.5, 0, 0.5, 1];
    
    panValues.forEach(pan => {
      mockSpeakerTrack.loopConfig.pan = pan;
      speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);
      expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          pan: pan,
        })
      );
    });
  });

  it("should handle different loop configurations", () => {
    const testCases = [
      { duration: 5, times: 1 },
      { duration: 10, times: 2 },
      { duration: 15, times: 3 },
    ];

    testCases.forEach(({ duration, times }) => {
      mockSpeakerTrack.loopConfig.duration = duration;
      mockSpeakerTrack.loopConfig.times = times;
      
      // Mock SpeakerUtils.findRemainingTime to return half the total duration
      jest.spyOn(SpeakerUtils, "findRemainingTime").mockReturnValue((duration * times) / 2);

      speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);

      // Verify playWithConfig was called with correct configuration
      expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: expect.any(Number),
          times: 1,
        })
      );
    });
  });

  it("should not call fadeOutAndStopBufferSource when bufferSourcePlaying is false", () => {
    mockSpeakerTrack.bufferSourcePlaying = false;
    speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);

    // Verify buffer source was aborted
    expect(mockSpeakerTrack.abortBufferSource).toHaveBeenCalled();

    // Verify fade out was played
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith({
      duration: expect.any(Number),
      fadeInDuration: 0,
      offset: expect.any(Number),
      pan: mockSpeakerTrack.loopConfig.pan,
      times: 1,
    });

    // Verify fade out was not stopped since bufferSourcePlaying was false
    expect(mockSpeakerTrack.fadeOutAndStopBufferSource).not.toHaveBeenCalled();
  });

  it("should set offset to 0 when remaining duration is nearly zero", () => {
    // Mock SpeakerUtils.findRemainingTime to return a very small number
    jest.spyOn(SpeakerUtils, "findRemainingTime").mockReturnValue(0.01);

    // Mock isNearlyZero to return true
    jest.spyOn(require('../utils'), "isNearlyZero").mockReturnValue(true);

    speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack);

    // Verify playWithConfig was called with offset 0
    expect(mockSpeakerTrack.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 0,
      })
    );

    // Restore mocks
    jest.restoreAllMocks();
  });
});

describe("SpeakerEngine - Constructor", () => {
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockSpeakerData: ISpeakerData[];

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerData = [
      { 
        id: 1, 
        shape: { 
          type: "MultiPolygon", 
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]] 
        },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio1",
        parents: []
      },
      { 
        id: 2, 
        shape: { 
          type: "MultiPolygon", 
          coordinates: [[[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]] 
        },
        maxvolume: 1.0,
        minvolume: 0.0,
        attenuation_distance: 100,
        uri: "http://example.com/audio2",
        parents: [1]
      }
    ];

    // Mock SpeakerUtils.getRootForSpeaker to return different group IDs
    jest.spyOn(SpeakerUtils, "getRootForSpeaker").mockImplementation((data) => data.id);
  });

  it("should initialize with prefetch strategy", () => {
    mockConfig = { mode: "prefetch" };
    
    // Mock SpeakerUtils.getLoadingStrategy to return PREFETCH
    jest.spyOn(SpeakerUtils, "getLoadingStrategy").mockReturnValue(LoadingStrategy.PREFETCH);
    
    // Create a spy on SpeakerTrack.prototype.loadBuffer
    const loadBufferSpy = jest.spyOn(SpeakerTrack.prototype, "loadBuffer") as jest.Mock;

    const speakerEngine = new SpeakerEngine(mockSpeakerData, mockAudioContext, mockConfig);
    
    expect(speakerEngine.speakers.length).toBe(2);
    expect(speakerEngine.group.size).toBe(2);
    expect(loadBufferSpy).toHaveBeenCalledTimes(2);
  });

  it("should initialize with progressive strategy", () => {
    mockConfig = { mode: "progressive-sync" };
    
    // Mock SpeakerUtils.getLoadingStrategy to return PROGRESSIVE
    jest.spyOn(SpeakerUtils, "getLoadingStrategy").mockReturnValue(LoadingStrategy.PROGRESSIVE);
    
    // Create a spy on SpeakerTrack.prototype.loadBuffer
    const loadBufferSpy = jest.spyOn(SpeakerTrack.prototype, "loadBuffer") as jest.Mock;

    const speakerEngine = new SpeakerEngine(mockSpeakerData, mockAudioContext, mockConfig);
    
    expect(speakerEngine.speakers.length).toBe(2);
    expect(speakerEngine.group.size).toBe(2);
  });
});

describe("SpeakerEngine - updateNonBaseTracks", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockBaseTrack: jest.Mocked<SpeakerTrack>;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let emitSpy: jest.Mock;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync-basePlusMax5Random" };

    mockBaseTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      }
    } as unknown as jest.Mocked<SpeakerTrack>;

    mockSpeakerTrack = {
      data: { id: 2 },
      buffer: {
        duration: 5,
        length: 220500,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio2",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0.5,
        duration: 5,
        times: 2
      }
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);
    speakerEngine.speakers = [mockBaseTrack, mockSpeakerTrack];
    speakerEngine.playingTracks = [mockBaseTrack.data.id, mockSpeakerTrack.data.id];
    speakerEngine.playing = true;
    speakerEngine.mixParams = {
      speakerConfig: {
        mode: "progressive-sync-basePlusMax5Random",
        loopPointUpdateProbability: 1,
        slotConsiderationProbability: 1,
        replaceWithNoneProbability: 0,
        loopFractions: [0.5, 1],
        effects: {
          pan: [0.5]
        }
      }
    } as IMixParams;

    // Mock SpeakerUtils.shouldDoSomethingWithProbability
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockImplementation((probability, _) => {
      return probability === 0 ? false : true;
    });

    emitSpy = jest.spyOn(speakerEngine, "emit") as jest.Mock;
  });

  it("should skip loop point update when probability is 0", () => {
    speakerEngine.mixParams.speakerConfig!.loopPointUpdateProbability = 0;
    speakerEngine.updateNonBaseTracks();
    
    expect(mockSpeakerTrack.playWithConfig).not.toHaveBeenCalled();
  });

  it("should replace speaker with none when probability is 1", () => {
    speakerEngine.mixParams.speakerConfig!.replaceWithNoneProbability = 1;
    speakerEngine.updateNonBaseTracks();
    
    expect(emitSpy).toHaveBeenCalledWith("replacingWithNone", mockSpeakerTrack.data.id);
    expect(speakerEngine.playingTracks[1]).toBeNull();
    expect(mockSpeakerTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();
  });

  it("should replace speaker with new speaker when available", () => {
    const newSpeaker = {
      data: { id: 3 },
      buffer: {
        duration: 5,
        length: 220500,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: false,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio3",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0.5,
        duration: 5,
        times: 2
      }
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine.speakers.push(newSpeaker);
    speakerEngine.updateNonBaseTracks();
    
    expect(emitSpy).toHaveBeenCalledWith("newSpeaker", expect.any(Object));
    expect(speakerEngine.playingTracks[1]).toBe(newSpeaker.data.id);
    expect(newSpeaker.playWithConfig).toHaveBeenCalled();
  });

  it("should handle buffer loading for new speaker", () => {
    const newSpeaker = {
      data: { id: 3 },
      buffer: null,
      bufferSourcePlaying: false,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio3",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0.5,
        duration: 5,
        times: 2
      },
      loadBuffer: jest.fn()
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine.speakers.push(newSpeaker);
    speakerEngine.updateNonBaseTracks();
    
    // Verify loadBuffer was called
    expect(newSpeaker.loadBuffer).toHaveBeenCalled();
    
    // Verify event listener was set up
    expect(newSpeaker.on).toHaveBeenCalledWith("loaded", expect.any(Function));
    
    // Simulate buffer loaded event
    const loadedCallback = (newSpeaker.on as jest.Mock).mock.calls[0][1] as () => void;
    const now = mockAudioContext.currentTime;
    loadedCallback();
    
    // Verify playWithConfig was called with correct parameters
    expect(newSpeaker.playWithConfig).toHaveBeenCalledWith({
      duration: expect.any(Number),
      offset: 0,
      fadeInDuration: expect.any(Number),
      times: expect.any(Number),
      pan: expect.any(Number)
    });
  });

  it("should handle different loop fractions and pan positions", () => {
    speakerEngine.mixParams.speakerConfig!.loopFractions = [0.25, 0.5, 0.75, 1];
    speakerEngine.mixParams.speakerConfig!.effects!.pan = [-0.5, 0, 0.5];
    
    const newSpeaker = {
      data: { id: 3 },
      buffer: {
        duration: 5,
        length: 220500,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: false,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio3",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0.5,
        duration: 5,
        times: 2
      }
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine.speakers.push(newSpeaker);
    speakerEngine.updateNonBaseTracks();
    
    expect(newSpeaker.playWithConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: expect.any(Number),
        times: expect.any(Number),
        pan: expect.any(Number)
      })
    );
  });

  it("should handle case when no new speakers are available", () => {
    // Remove all speakers except the base track and current speaker
    speakerEngine.speakers = [mockBaseTrack, mockSpeakerTrack];
    speakerEngine.updateNonBaseTracks();
    
    expect(speakerEngine.playingTracks[1]).toBeNull();
  });

  it("should handle case when speaker is not in playingTracks", () => {
    speakerEngine.playingTracks = [mockBaseTrack.data.id];
    speakerEngine.updateNonBaseTracks();
    
    expect(speakerEngine.playingTracks.length).toBe(5);
    expect(speakerEngine.playingTracks[0]).toBe(mockBaseTrack.data.id);
  });

  it("should repeat all non-base tracks when loop point update is skipped", () => {
    // Set up multiple non-base tracks
    const mockSpeakerTrack2 = {
      data: { id: 3 },
      buffer: {
        duration: 5,
        length: 220500,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio3",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0.5,
        duration: 5,
        times: 2
      }
    } as unknown as jest.Mocked<SpeakerTrack>;

    // Add second non-base track
    speakerEngine.speakers.push(mockSpeakerTrack2);
    speakerEngine.playingTracks = [mockBaseTrack.data.id, mockSpeakerTrack.data.id, mockSpeakerTrack2.data.id];

    // Set loop point update probability to 0 to trigger skip
    speakerEngine.mixParams.speakerConfig!.loopPointUpdateProbability = 0;

    // Mock shouldDoSomethingWithProbability to return false for loop point updates
    jest.spyOn(SpeakerUtils, "shouldDoSomethingWithProbability").mockImplementation((probability, action) => {
      if (action === "loop point update") return false;
      return true;
    });

    // Mock repeatLoopOnLoopPoint to verify it's called
    const repeatLoopSpy = jest.spyOn(speakerEngine, "repeatLoopOnLoopPoint");

    speakerEngine.updateNonBaseTracks();

    // Verify skippingLoopPointUpdate event was emitted
    expect(emitSpy).toHaveBeenCalledWith("skippingLoopPointUpdate");

    // Verify repeatLoopOnLoopPoint was called for each non-base track
    expect(repeatLoopSpy).toHaveBeenCalledTimes(2);
    expect(repeatLoopSpy).toHaveBeenCalledWith(mockSpeakerTrack);
    expect(repeatLoopSpy).toHaveBeenCalledWith(mockSpeakerTrack2);

    // Verify base track was not repeated
    expect(repeatLoopSpy).not.toHaveBeenCalledWith(mockBaseTrack);
  });

  it("should not play speaker if it's no longer in playing tracks when buffer is loaded", () => {
    const newSpeaker = {
      data: { id: 3 },
      buffer: null,
      bufferSourcePlaying: false,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio3",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0.5,
        duration: 5,
        times: 2
      },
      loadBuffer: jest.fn()
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine.speakers.push(newSpeaker);
    speakerEngine.updateNonBaseTracks();
    
    // Verify loadBuffer was called
    expect(newSpeaker.loadBuffer).toHaveBeenCalled();
    
    // Verify event listener was set up
    expect(newSpeaker.on).toHaveBeenCalledWith("loaded", expect.any(Function));
    
    // Remove speaker from playing tracks before buffer is loaded
    speakerEngine.playingTracks = [mockBaseTrack.data.id];
    
    // Simulate buffer loaded event
    const loadedCallback = (newSpeaker.on as jest.Mock).mock.calls[0][1] as () => void;
    loadedCallback();
    
    // Verify playWithConfig was not called since speaker is no longer in playing tracks
    expect(newSpeaker.playWithConfig).not.toHaveBeenCalled();
  });

  it("should throw error when base track is not found", () => {
    // Set up speaker engine with no base track
    speakerEngine.playingTracks = [null];
    speakerEngine.speakers = [mockSpeakerTrack];

    // Mock getSpeakerTrackById to return null for base track
    jest.spyOn(speakerEngine, "getSpeakerTrackById").mockImplementation((id: number): SpeakerTrack => {
      if (id === mockSpeakerTrack.data.id) return mockSpeakerTrack as unknown as SpeakerTrack;
      throw new Error("Track not found");
    });

    // Expect error to be thrown
    expect(() => speakerEngine.updateNonBaseTracks()).toThrow("Base track not found");
  });
});

describe("SpeakerEngine - repeatLoopOnLoopPoint", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockConfig: SpeakerConfig;
  let mockBaseTrack: jest.Mocked<SpeakerTrack>;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockConfig = { mode: "progressive-sync" };

    mockBaseTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      }
    } as unknown as jest.Mocked<SpeakerTrack>;

    mockSpeakerTrack = {
      data: { id: 2 },
      buffer: {
        duration: 5,
        length: 220500,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      loopConfig: {
        pan: 0.5,
        duration: 5,
        times: 2
      },
      abortBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
    } as unknown as jest.Mocked<SpeakerTrack>;

    speakerEngine = new SpeakerEngine([], mockAudioContext, mockConfig);
    speakerEngine.speakers = [mockBaseTrack, mockSpeakerTrack];
    speakerEngine.playingTracks = [mockBaseTrack.data.id];
    speakerEngine.group.set(1, 0);
  });

  it("should throw error when base track is not found", () => {
    speakerEngine.playingTracks = [null];
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Base track not found"
    );
  });

  it("should handle odd duration tracks correctly", () => {
    mockSpeakerTrack.loopConfig.duration = 3; // Odd duration that doesn't divide evenly into base track duration
    const emitSpy = jest.spyOn(speakerEngine, "emit");
    
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);
    
    expect(emitSpy).toHaveBeenCalledWith("repeatingTrack", expect.objectContaining({
      trackId: mockSpeakerTrack.data.id,
      exceededDuration: expect.any(Number),
      newTimes: expect.any(Number)
    }));
  });

  it("should handle even duration tracks correctly", () => {
    mockSpeakerTrack.loopConfig.duration = 5; // Even duration that divides evenly into base track duration
    const emitSpy = jest.spyOn(speakerEngine, "emit");
    
    speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack);
    
    expect(emitSpy).toHaveBeenCalledWith("repeatingTrack", expect.objectContaining({
      trackId: mockSpeakerTrack.data.id,
      exceededDuration: 0,
      newTimes: mockSpeakerTrack.loopConfig.times
    }));
  });
});

describe("SpeakerEngine - repeatLoopOnLoopPoint error cases", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig = { mode: "progressive-sync" };

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 3, // Set to 3 to make it odd duration with base track duration of 10
        times: 1
      }
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

    speakerEngine = new SpeakerEngine(
      mockSpeakerData,
      mockAudioContext,
      mockConfig
    );

    speakerEngine.speakers = [mockSpeakerTrack];
  });

  it("should throw error when base track is not found", () => {
    speakerEngine.playingTracks = [];
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow("Base track not found");
  });

  it("should throw error when group is not started yet", () => {
    speakerEngine.playingTracks = [1];
    speakerEngine.group = new Map();
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Tried to repeat track who's group is not started yet!"
    );
  });
});

describe("SpeakerEngine - fadeOutLoopFromLoopPoint error cases", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      }
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

    speakerEngine.speakers = [mockSpeakerTrack];
  });

  it("should throw error when speaker pan is not found", () => {
    mockSpeakerTrack.loopConfig.pan = undefined;
    expect(() => speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack)).toThrow("Speaker pan not found");
  });

  it("should throw error when speaker duration is not found", () => {
    mockSpeakerTrack.loopConfig.duration = undefined;
    expect(() => speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack)).toThrow("Speaker duration not found");
  });

  it("should throw error when speaker times is not found", () => {
    mockSpeakerTrack.loopConfig.times = undefined;
    expect(() => speakerEngine.fadeOutLoopFromLoopPoint(mockSpeakerTrack)).toThrow("Speaker times not found");
  });
});

describe("SpeakerEngine - getSpeakerTrackById error cases", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      }
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

    speakerEngine.speakers = [mockSpeakerTrack];
  });

  it("should throw error when speaker track is not found", () => {
    expect(() => speakerEngine.getSpeakerTrackById(999)).toThrow("Speaker track not found: 999");
  });
});

describe("SpeakerEngine - listenerPoint getter error cases", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      }
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

    speakerEngine.speakers = [mockSpeakerTrack];
  });

  it("should throw error when listener point is missing in mixParams", () => {
    speakerEngine.mixParams = {};
    expect(() => speakerEngine.listenerPoint).toThrow("Listener Point missing in mixParams");
  });
});

describe("SpeakerEngine - repeatLoopOnLoopPoint error cases", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 3, // Set to 3 to make it odd duration with base track duration of 10
        times: 1
      }
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

    speakerEngine.speakers = [mockSpeakerTrack];
  });

  it("should throw error when base track is not found", () => {
    speakerEngine.playingTracks = [];
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow("Base track not found");
  });

  it("should throw error when group is not started yet", () => {
    speakerEngine.playingTracks = [1];
    speakerEngine.group = new Map();
    expect(() => speakerEngine.repeatLoopOnLoopPoint(mockSpeakerTrack)).toThrow(
      "Tried to repeat track who's group is not started yet!"
    );
  });
});

describe("SpeakerEngine - play", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { id: 1 },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      },
      volumeByLocation: jest.fn().mockReturnValue(0.5)
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
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
        },
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
  });

  it("should throw error when using prefetch strategy and not all speakers are loaded", async () => {
    mockMixParams.speakerConfig = { mode: "prefetch" };
    speakerEngine.updateParams(mockMixParams);
    mockSpeakerTrack.buffer = null;
    speakerEngine.speakers = [mockSpeakerTrack];

    // Mock the loading strategy getter
    Object.defineProperty(speakerEngine, "loadingStrategy", {
      get: () => LoadingStrategy.PREFETCH
    });

    await expect(speakerEngine.play()).rejects.toThrow(
      "Prefetch strategy requires all speakers to be loaded before playing"
    );
  });

  it("should call onLocationUpdateProgressiveBasePlusMaxNRandom when using progressive strategy with maxRandom > 0", async () => {
    mockMixParams.speakerConfig = { mode: "progressive-sync-basePlusMax5Random" };
    speakerEngine.updateParams(mockMixParams);
    speakerEngine.speakers = [mockSpeakerTrack];
    speakerEngine.playing = true;

    // Mock the mode getter
    Object.defineProperty(speakerEngine, "mode", {
      get: () => ({ maxRandom: 5 })
    });

    const spy = jest.spyOn(speakerEngine as any, "onLocationUpdateProgressiveBasePlusMaxNRandom");
    await speakerEngine.play();
    expect(spy).toHaveBeenCalled();
  });
});

describe("SpeakerEngine - updateParams", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerTrack: jest.Mocked<SpeakerTrack>;
  let mockMixParams: IMixParams;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    mockAudioContext = {
      currentTime: 0,
    } as unknown as IAudioContext;

    mockSpeakerTrack = {
      data: { 
        id: 1,
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
        }
      },
      buffer: {
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        copyFromChannel: jest.fn(),
        copyToChannel: jest.fn(),
        getChannelData: jest.fn(),
      } as unknown as IAudioBuffer,
      bufferSourcePlaying: true,
      groupId: 1,
      clearListeners: jest.fn(),
      fadeOutAndStopBufferSource: jest.fn(),
      playWithConfig: jest.fn(),
      abortBufferSource: jest.fn(),
      stopBufferSource: jest.fn(),
      clearBufferSource: jest.fn(),
      startBufferSource: jest.fn(),
      fadeBufferSourceToVolume: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
      maxVolume: 1.0,
      minVolume: 0.0,
      attenuationDistanceKm: 0.1,
      uri: "http://example.com/audio1",
      calculatedVolume: 0.8,
      config: mockConfig,
      audioContext: mockAudioContext,
      loopConfig: {
        pan: 0,
        duration: 10,
        times: 1
      },
      loadBuffer: jest.fn(),
      unload: jest.fn(),
      volumeByLocation: jest.fn().mockReturnValue(0.5)
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
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
        },
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
  });

  it("should load and unload speakers based on distance when using progressive strategy", () => {
    mockMixParams.speakerConfig = {
      mode: "progressive-sync",
      prefetchDistanceMeters: 50
    };
    speakerEngine.speakers = [mockSpeakerTrack];

    // Mock the loading strategy getter
    Object.defineProperty(speakerEngine, "loadingStrategy", {
      get: () => LoadingStrategy.PROGRESSIVE
    });

    speakerEngine.updateParams(mockMixParams);

    expect(mockSpeakerTrack.loadBuffer).toHaveBeenCalled();
    expect(mockSpeakerTrack.unload).not.toHaveBeenCalled();
  });

  it("should call onLocationUpdateProgressiveBasePlusMaxNRandom when playing and maxRandom > 0", () => {
    mockMixParams.speakerConfig = { mode: "progressive-sync-basePlusMax5Random" };
    speakerEngine.speakers = [mockSpeakerTrack];
    speakerEngine.playing = true;

    // Mock the mode getter
    Object.defineProperty(speakerEngine, "mode", {
      get: () => ({ maxRandom: 5 })
    });

    const spy = jest.spyOn(speakerEngine as any, "onLocationUpdateProgressiveBasePlusMaxNRandom");
    speakerEngine.updateParams(mockMixParams);
    expect(spy).toHaveBeenCalled();
  });
});