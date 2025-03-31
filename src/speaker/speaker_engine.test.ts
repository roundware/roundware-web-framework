import { SpeakerEngine } from "./speaker_engine";
import { IAudioContext } from "standardized-audio-context";
import { ISpeakerData } from "../types/speaker";
import { SpeakerConfig } from "../types";
import { point } from "@turf/helpers";
import { MultiPolygon, Point } from "geojson";
import { PlayingMode } from "./speaker_utils";
import { SpeakerUtils } from "./speaker_utils";

// Mock the standardized-audio-context
jest.mock("standardized-audio-context", () => ({
  AudioContext: jest.fn().mockImplementation(() => ({
    createBuffer: jest.fn(),
    createBufferSource: jest.fn().mockReturnValue({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    }),
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: { value: 0 },
    }),
  })),
}));

describe("SpeakerEngine", () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakerData: ISpeakerData[];
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create mock audio context
    mockAudioContext = {
      createBuffer: jest.fn(),
      createBufferSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      }),
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: { value: 0 },
      }),
    } as unknown as IAudioContext;

    // Create mock speaker data
    mockSpeakerData = [
      {
        id: 1,
        maxvolume: 1.0,
        minvolume: 0.1,
        attenuation_distance: 50,
        uri: "http://example.com/speaker1.mp3",
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]],
        } as MultiPolygon,
      },
      {
        id: 2,
        maxvolume: 1.0,
        minvolume: 0.1,
        attenuation_distance: 50,
        uri: "http://example.com/speaker2.mp3",
        shape: {
          type: "MultiPolygon",
          coordinates: [[[[1, 0], [1, 1], [2, 1], [2, 0], [1, 0]]]],
        } as MultiPolygon,
      },
    ];

    mockConfig = {
      mode: "progressive-sync-basePlusMax5Random",
      prefetchDistanceMeters: 10,
    };

    speakerEngine = new SpeakerEngine(mockSpeakerData, mockAudioContext, mockConfig);
  });

  describe("constructor", () => {
    it("should initialize with provided speakers and config", () => {
      expect(speakerEngine.speakers).toHaveLength(2);
      expect(speakerEngine.audioContext).toBe(mockAudioContext);
    });

    it("should emit init event on construction", () => {
      const initSpy = jest.fn();
      const engine = new SpeakerEngine(mockSpeakerData, mockAudioContext, mockConfig);
      engine.on("init", initSpy);
      // Force a tick to ensure event is processed
      jest.runAllTimers();
    });

    it("should prefetch all speakers when using prefetch strategy", () => {
      // Create mock speakers with loadBuffer method
      const mockSpeakers = mockSpeakerData.map(speaker => ({
        ...speaker,
        loadBuffer: jest.fn(),
        volumeByLocation: jest.fn().mockReturnValue(0.5)
      }));

      const prefetchConfig = {
        mode: "prefetch" as const,
        prefetchDistanceMeters: 10,
      };
      const engine = new SpeakerEngine(mockSpeakers, mockAudioContext, prefetchConfig);
      
      // Set up listener point and trigger the prefetch behavior
      engine.updateParams({
        speakerConfig: { mode: "prefetch" as const },
        listenerPoint: point([0.5, 0.5]),
      });

      // Force a tick to ensure event is processed
      jest.runAllTimers();

    });

    it("should not prefetch speakers when using progressive strategy", () => {
      // Create mock speakers with loadBuffer method
      const mockSpeakers = mockSpeakerData.map(speaker => ({
        ...speaker,
        loadBuffer: jest.fn(),
        volumeByLocation: jest.fn().mockReturnValue(0.5)
      }));

      const progressiveConfig = {
        mode: "progressive-sync" as const,
        prefetchDistanceMeters: 10,
      };
      const engine = new SpeakerEngine(mockSpeakers, mockAudioContext, progressiveConfig);
      
      // Set up listener point and trigger the update
      engine.updateParams({
        speakerConfig: { mode: "progressive-sync" as const },
        listenerPoint: point([0.5, 0.5]),
      });

      // Force a tick to ensure event is processed
      jest.runAllTimers();

      // Verify that loadBuffer was not called for any speaker
      mockSpeakers.forEach(speaker => {
        expect(speaker.loadBuffer).not.toHaveBeenCalled();
      });
    });
  });

  describe("play", () => {
    beforeEach(() => {
      // Set up required listener point before play tests
      speakerEngine.updateParams({
        listenerPoint: point([0.5, 0.5]),
      });
    });

    it("should set playing flag to true", async () => {
      await speakerEngine.play();
      expect(speakerEngine.playing).toBe(true);
    });

    it("should emit play event", async () => {
      const playSpy = jest.fn();
      speakerEngine.on("play", playSpy);
      await speakerEngine.play();
      expect(playSpy).toHaveBeenCalled();
    });

    it("should log loading strategy and mode when playing", async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });
      await speakerEngine.play();
      expect(consoleSpy).toHaveBeenCalledWith(
        "progressive",
        expect.objectContaining({
          mode: PlayingMode.BASEPLUSMAXNRANDOM,
          maxRandom: 5,
          sync: true
        })
      );
      consoleSpy.mockRestore();
    });

    it("should throw error if prefetch strategy and speakers not loaded", async () => {
      // Set prefetch strategy
      speakerEngine.updateParams({
        speakerConfig: { mode: "prefetch" as const },
        listenerPoint: point([0.5, 0.5]),
      });

      await expect(speakerEngine.play()).rejects.toThrow(
        "Prefetch strategy requires all speakers to be loaded before playing"
      );
    });

    it("should handle progressive strategy with maxRandom > 0", async () => {
      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      await speakerEngine.play();
      // Verify that onLocationUpdateProgressiveBasePlusMaxNRandom was called
      expect(speakerEngine.playing).toBe(true);
    });
  });

  describe("stop", () => {
    it("should set playing flag to false", async () => {
      await speakerEngine.stop();
      expect(speakerEngine.playing).toBe(false);
    });

    it("should emit stop event", async () => {
      const stopSpy = jest.fn();
      speakerEngine.on("stop", stopSpy);
      await speakerEngine.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it("should stop all playing tracks", async () => {
      // Set up a playing track
      const mockTrack = {
        off: jest.fn(),
        stopUrgently: jest.fn(),
      };
      speakerEngine.playingTracks = [mockTrack as any];

      await speakerEngine.stop();
      expect(mockTrack.off).toHaveBeenCalledWith("baseTrackEnded", expect.any(Function));
      expect(mockTrack.stopUrgently).toHaveBeenCalled();
    });
  });

  describe("updateParams", () => {
    it("should update mixParams", () => {
      const newParams = {
        speakerConfig: { mode: "progressive-sync" as const },
        listenerPoint: point([0.5, 0.5]),
      };

      speakerEngine.updateParams(newParams);
      expect(speakerEngine.mixParams).toEqual(newParams);
    });

    it("should handle progressive strategy with maxRandom > 0 when playing", () => {
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null];
      
      // Mock the onLocationUpdateProgressiveBasePlusMaxNRandom method
      const updateSpy = jest.spyOn(speakerEngine as any, 'onLocationUpdateProgressiveBasePlusMaxNRandom');
      
      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      expect(updateSpy).toHaveBeenCalled();
      updateSpy.mockRestore();
    });

    it("should emit speakerNear event when speaker is within prefetch distance", () => {
      const speakerNearSpy = jest.fn();
      speakerEngine.on("speakerNear", speakerNearSpy);

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      expect(speakerNearSpy).toHaveBeenCalled();
    });

    it("should handle progressive strategy updates with maxRandom > 0", () => {
      const baseTrackChangedSpy = jest.fn();
      speakerEngine.on("baseTrackChanged", baseTrackChangedSpy);

      // Set up initial state
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null];

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      // Force a base track change by updating the playing tracks
      speakerEngine.playingTracks = [speakerEngine.speakers[0]];
      speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

      expect(baseTrackChangedSpy).toHaveBeenCalled();
    });

    it("should unload speakers outside prefetch distance", () => {
      // Mock unload method
      speakerEngine.speakers.forEach(speaker => {
        speaker.unload = jest.fn();
      });

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync" as const,
          prefetchDistanceMeters: 1 // Small distance to ensure some speakers are outside
        },
        listenerPoint: point([10, 10]), // Point far from speakers
      });

      // Verify that unload was called for speakers outside the distance
      speakerEngine.speakers.forEach(speaker => {
        expect(speaker.unload).toHaveBeenCalled();
      });
    });

    it("should not unload speakers within prefetch distance", () => {
      // Mock unload method
      speakerEngine.speakers.forEach(speaker => {
        speaker.unload = jest.fn();
      });

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync" as const,
          prefetchDistanceMeters: 100 // Large distance to ensure all speakers are within
        },
        listenerPoint: point([0.5, 0.5]), // Point near speakers
      });

      // Verify that unload was not called for any speaker
      speakerEngine.speakers.forEach(speaker => {
        expect(speaker.unload).not.toHaveBeenCalled();
      });
    });
  });

  describe("onLocationUpdateProgressiveBasePlusMaxNRandom", () => {
    it("should update playing tracks based on location", () => {
      // Set up initial state
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null];

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      // Calculate volumes and update tracks
      speakerEngine.calculateVolumesByLocation();
      speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

      // Verify that playingTracks was updated
      expect(speakerEngine.playingTracks.length).toBeGreaterThan(0);
      expect(speakerEngine.playingTracks[0]).toBeDefined();
    });

    it("should handle base track changes and emit baseTrackChanged event", () => {
      const baseTrackChangedSpy = jest.fn();
      speakerEngine.on("baseTrackChanged", baseTrackChangedSpy);
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null];

      // Set up a different base track
      const mockTrack = {
        data: { id: 1 },
        buffer: {},
        bufferSource: {},
        playAsBaseTrack: jest.fn(),
        on: jest.fn(),
      };

      // Mock the latestBaseTrack getter to return a different track
      Object.defineProperty(speakerEngine, 'latestBaseTrack', {
        get: () => mockTrack as any
      });

      // Mock currentBaseTrack to be different
      Object.defineProperty(speakerEngine, 'currentBaseTrack', {
        get: () => ({ data: { id: 2 } } as any)
      });

    });

    it("should handle base track without buffer", () => {
      const mockTrack = {
        loadBuffer: jest.fn(),
        on: jest.fn(),
        playAsBaseTrack: jest.fn(),
        data: { id: 1 },
        buffer: null,
        bufferSource: {},
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null];

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      // Mock the latestBaseTrack getter
      Object.defineProperty(speakerEngine, 'latestBaseTrack', {
        get: () => mockTrack as any
      });

      speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();
      expect(mockTrack.loadBuffer).toHaveBeenCalled();
      expect(mockTrack.on).toHaveBeenCalledWith("loaded", expect.any(Function));

      // Get the loaded event handler
      const loadedHandler = mockTrack.on.mock.calls.find(call => call[0] === "loaded")[1];
      
      // Call the loaded handler
      loadedHandler();
      
      // Verify that playAsBaseTrack was called
      expect(mockTrack.playAsBaseTrack).toHaveBeenCalled();
    });

    it("should handle base track with existing buffer", () => {
      const mockTrack = {
        loadBuffer: jest.fn(),
        on: jest.fn(),
        playAsBaseTrack: jest.fn(),
        data: { id: 1 },
        buffer: {},
        bufferSource: {},
        volumeByLocation: jest.fn().mockReturnValue(0.5),
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null];

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      // Mock the latestBaseTrack getter
      Object.defineProperty(speakerEngine, 'latestBaseTrack', {
        get: () => mockTrack as any
      });

      // Calculate volumes to trigger track update
      speakerEngine.calculateVolumesByLocation();
      speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

      expect(mockTrack.loadBuffer).not.toHaveBeenCalled();
      expect(mockTrack.playAsBaseTrack).toHaveBeenCalled();
    });

    it("should update volumes for existing tracks when base track hasn't changed", () => {
      const mockTrack = {
        loadBuffer: jest.fn(),
        on: jest.fn(),
        playAsBaseTrack: jest.fn(),
        volumeByLocation: jest.fn().mockReturnValue(0.5),
        fadeBufferSourceToVolume: jest.fn(),
        data: { id: 1 },
        buffer: {},
        bufferSource: {},
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [mockTrack as any];

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      // Mock the latestBaseTrack getter to return the same track
      Object.defineProperty(speakerEngine, 'latestBaseTrack', {
        get: () => mockTrack as any
      });

      // Calculate volumes to trigger track update
      speakerEngine.calculateVolumesByLocation();
      speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

    });

    it("should handle null tracks when updating volumes", () => {
      const mockTrack = {
        loadBuffer: jest.fn(),
        on: jest.fn(),
        playAsBaseTrack: jest.fn(),
        volumeByLocation: jest.fn().mockReturnValue(0.5),
        fadeBufferSourceToVolume: jest.fn(),
        data: { id: 1 },
        buffer: {},
        bufferSource: {},
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null, mockTrack as any, null];

      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      // Mock the latestBaseTrack getter to return the same track
      Object.defineProperty(speakerEngine, 'latestBaseTrack', {
        get: () => mockTrack as any
      });

      // Calculate volumes to trigger track update
      speakerEngine.calculateVolumesByLocation();
      speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

      // Verify that volumes were only updated for non-null tracks
      expect(mockTrack.volumeByLocation).toHaveBeenCalledWith(speakerEngine.listenerPoint);
      expect(mockTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(0.5);
    });
  });

  describe("playAsBaseTrack", () => {
    it("should handle track that is too late to play", () => {
      const mockTrack = {
        off: jest.fn(),
        fadeOutAndStopBufferSource: jest.fn(),
        data: { id: 1 },
      };
      speakerEngine.playing = false;
      speakerEngine.playingTracks = [{ data: { id: 2 } } as any];

      speakerEngine.playAsBaseTrack(mockTrack as any);
      expect(mockTrack.off).toHaveBeenCalled();
      expect(mockTrack.fadeOutAndStopBufferSource).toHaveBeenCalled();
    });

    it("should play track as base track", () => {
      const mockTrack = {
        playAsBaseTrack: jest.fn(),
        on: jest.fn(),
        data: { id: 1 },
        bufferSource: {},
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [{ data: { id: 1 } } as any];

      const baseTrackStartedSpy = jest.fn();
      speakerEngine.on("baseTrackStarted", baseTrackStartedSpy);

      speakerEngine.playAsBaseTrack(mockTrack as any);
      expect(mockTrack.playAsBaseTrack).toHaveBeenCalled();
      expect(mockTrack.on).toHaveBeenCalledWith("baseTrackEnded", expect.any(Function));
      expect(baseTrackStartedSpy).toHaveBeenCalled();
    });

    it("should throw error if buffer source is not available", () => {
      const mockTrack = {
        playAsBaseTrack: jest.fn(),
        on: jest.fn(),
        data: { id: 1 },
        bufferSource: null,
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [{ data: { id: 1 } } as any];

      expect(() => speakerEngine.playAsBaseTrack(mockTrack as any)).toThrow(
        "Buffer Source not available for setting up loop point"
      );
    });

    it("should handle buffer source availability check", () => {
      const mockTrack = {
        playAsBaseTrack: jest.fn(),
        on: jest.fn(),
        data: { id: 1 },
        bufferSource: {},
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [{ data: { id: 1 } } as any];

      // Should not throw error when bufferSource is available
      expect(() => speakerEngine.playAsBaseTrack(mockTrack as any)).not.toThrow();
      expect(mockTrack.playAsBaseTrack).toHaveBeenCalled();
      expect(mockTrack.on).toHaveBeenCalledWith("baseTrackEnded", expect.any(Function));
    });
  });

  describe("onLoopPoint", () => {
    beforeEach(() => {
      // Set up required listener point before loop point tests
      speakerEngine.updateParams({
        listenerPoint: point([0.5, 0.5]),
      });
    });

    it("should handle loop point when not playing", () => {
      speakerEngine.playing = false;
      speakerEngine.onLoopPoint();
      // Verify no events are emitted
      expect(speakerEngine.playingTracks.length).toBe(0);
    });

    it("should handle loop point with different base track", () => {
      const mockCurrentTrack = {
        off: jest.fn(),
        fadeOutAndStopBufferSource: jest.fn(),
        data: { id: 1 },
        volumeByLocation: jest.fn().mockReturnValue(0.5),
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [mockCurrentTrack as any];

      // Set up a different base track by updating params and calculating volumes
      speakerEngine.updateParams({
        speakerConfig: { 
          mode: "progressive-sync-basePlusMax5Random" as const,
          prefetchDistanceMeters: 10 
        },
        listenerPoint: point([0.5, 0.5]),
      });

      // Calculate volumes and update tracks
      speakerEngine.calculateVolumesByLocation();
      speakerEngine.onLocationUpdateProgressiveBasePlusMaxNRandom();

      // Force a different base track
      speakerEngine.playingTracks = [speakerEngine.speakers[0]];

      const loopPointReachedSpy = jest.fn();
      speakerEngine.on("loopPointReached", loopPointReachedSpy);

      speakerEngine.onLoopPoint();
      expect(loopPointReachedSpy).toHaveBeenCalled();
    });

    it("should handle null playing tracks", () => {
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [null];

      // Should not throw error
      expect(() => speakerEngine.onLoopPoint()).not.toThrow();
    });

    it("should handle loop point with existing base track", () => {
      const mockTrack = {
        loadBuffer: jest.fn(),
        on: jest.fn(),
        playAsBaseTrack: jest.fn(),
        volumeByLocation: jest.fn().mockReturnValue(0.5),
        fadeBufferSourceToVolume: jest.fn(),
        data: { id: 1 },
        buffer: {},
        bufferSource: {},
      };
      speakerEngine.playing = true;
      speakerEngine.playingTracks = [mockTrack as any];

      // Mock the latestBaseTrack getter to return the same track
      Object.defineProperty(speakerEngine, 'latestBaseTrack', {
        get: () => mockTrack as any
      });

      // Calculate volumes to trigger track update
      speakerEngine.calculateVolumesByLocation();
      speakerEngine.onLoopPoint();

      // Verify that the track was played and volumes were updated
      expect(mockTrack.playAsBaseTrack).toHaveBeenCalled();
      expect(mockTrack.fadeBufferSourceToVolume).toHaveBeenCalledWith(undefined);
    });
  });

  describe("calculateVolumesByLocation", () => {
    it("should calculate volumes for all speakers", () => {
      speakerEngine.updateParams({
        listenerPoint: point([0.5, 0.5]),
      });

      speakerEngine.calculateVolumesByLocation();
      speakerEngine.speakers.forEach(speaker => {
        expect(speaker.calculatedVolume).toBeDefined();
      });
    });

    it("should filter speakers based on minimum volume", () => {
      // Mock volumeByLocation to return different volumes
      speakerEngine.speakers[0].volumeByLocation = jest.fn().mockReturnValue(0.2); // Above minVolume (0.1)
      speakerEngine.speakers[1].volumeByLocation = jest.fn().mockReturnValue(0.05); // Below minVolume (0.1)

      speakerEngine.updateParams({
        listenerPoint: point([0.5, 0.5]),
      });

      speakerEngine.calculateVolumesByLocation();
      
      // Check that only the speaker with volume above minVolume is included
      const speakersAboveMinVolume = speakerEngine.speakers.filter(
        speaker => speaker.calculatedVolume > speaker.minVolume
      );
      expect(speakersAboveMinVolume).toHaveLength(1);
      expect(speakersAboveMinVolume[0].calculatedVolume).toBe(0.2);
    });

    it("should calculate volumes for all speakers regardless of minimum volume", () => {
      // Mock volumeByLocation to return different volumes
      speakerEngine.speakers[0].volumeByLocation = jest.fn().mockReturnValue(0.2); // Above minVolume (0.1)
      speakerEngine.speakers[1].volumeByLocation = jest.fn().mockReturnValue(0.05); // Below minVolume (0.1)

      speakerEngine.updateParams({
        listenerPoint: point([0.5, 0.5]),
      });

      speakerEngine.calculateVolumesByLocation();
      
      // Check that volumes were calculated for all speakers
      speakerEngine.speakers.forEach(speaker => {
        expect(speaker.calculatedVolume).toBeDefined();
      });
    });
  });

  describe("getters", () => {
    it("should return correct listenerPoint", () => {
      const listenerPoint = point([0.5, 0.5]);
      speakerEngine.updateParams({ listenerPoint });

      expect(speakerEngine.listenerPoint).toEqual(listenerPoint.geometry);
    });

    it("should throw error if listenerPoint is missing", () => {
      // Create a new instance without listener point to test the error case
      const engineWithoutListener = new SpeakerEngine(mockSpeakerData, mockAudioContext, mockConfig);
      expect(() => engineWithoutListener.listenerPoint).toThrow("Listener Point missing in mixParams");
    });

    it("should return correct loadingStrategy", () => {
      speakerEngine.updateParams({
        speakerConfig: { mode: "prefetch" as const },
        listenerPoint: point([0.5, 0.5]),
      });
      expect(speakerEngine.loadingStrategy).toBe("prefetch");

      speakerEngine.updateParams({
        speakerConfig: { mode: "progressive-sync" as const },
        listenerPoint: point([0.5, 0.5]),
      });
      expect(speakerEngine.loadingStrategy).toBe("progressive");
    });

    it("should return correct mode", () => {
      speakerEngine.updateParams({
        speakerConfig: { mode: "progressive-sync-basePlusMax5Random" as const },
        listenerPoint: point([0.5, 0.5]),
      });
      expect(speakerEngine.mode).toEqual({
        mode: PlayingMode.BASEPLUSMAXNRANDOM,
        maxRandom: 5,
        sync: true,
      });
    });

    it("should find correct base track using SpeakerUtils.findBaseSpeaker", () => {
      // Set up listener point
      speakerEngine.updateParams({
        listenerPoint: point([0.5, 0.5]),
      });

      // Mock volumeByLocation to return different volumes for different speakers
      speakerEngine.speakers[0].volumeByLocation = jest.fn().mockReturnValue(0.8); // Higher volume
      speakerEngine.speakers[1].volumeByLocation = jest.fn().mockReturnValue(0.3); // Lower volume

      // Calculate volumes to trigger base track selection
      speakerEngine.calculateVolumesByLocation();

      // Mock SpeakerUtils.findBaseSpeaker to return the first speaker
      jest.spyOn(SpeakerUtils, 'findBaseSpeaker').mockReturnValue(speakerEngine.speakers[0].data);

      // Get the latest base track
      const baseTrack = speakerEngine.latestBaseTrack;

      // Verify that the track with higher volume was selected
      expect(baseTrack).toBeDefined();
      expect(baseTrack?.data.id).toBe(speakerEngine.speakers[0].data.id);
    });

    it("should return undefined when no speakers are available", () => {
      // Set up listener point
      speakerEngine.updateParams({
        listenerPoint: point([0.5, 0.5]),
      });

      // Mock volumeByLocation to return volumes below minVolume for all speakers
      speakerEngine.speakers.forEach(speaker => {
        speaker.volumeByLocation = jest.fn().mockReturnValue(0.05); // Below minVolume (0.1)
      });

      // Calculate volumes to trigger base track selection
      speakerEngine.calculateVolumesByLocation();

      // Mock SpeakerUtils.findBaseSpeaker to return undefined when no speakers are available
      jest.spyOn(SpeakerUtils, 'findBaseSpeaker').mockImplementation((speakers: ISpeakerData[], currentLocation: Point) => {
        // Return undefined when no speakers are available
        const availableSpeakers = speakerEngine.speakers.filter(speaker => 
          speaker.calculatedVolume > speaker.minVolume
        );
        return availableSpeakers.length > 0 ? availableSpeakers[0].data : speakers[0];
      });

      // Get the latest base track
      const baseTrack = speakerEngine.latestBaseTrack;

      // Verify that no track was selected
      expect(baseTrack).toBeUndefined();
    });
  });

  describe("toString", () => {
    it("should return correct string representation", () => {
      expect(speakerEngine.toString()).toBe("Roundware Speaker Engine");
    });
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    speakerEngine.speakers.forEach(speaker => {
      speaker.off("loading", expect.any(Function));
      speaker.off("loaded", expect.any(Function));
      speaker.off("unloaded", expect.any(Function));
      speaker.off("playing", expect.any(Function));
      speaker.off("fadingOut", expect.any(Function));
      speaker.off("baseTrackEnded", expect.any(Function));
    });
    jest.useRealTimers();
  });
});
