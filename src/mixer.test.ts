import { IAudioContext } from "standardized-audio-context";
import { AssetPool } from "./assetPool";
import { Mixer } from "./mixer";
import { Playlist } from "./playlist";
import { Roundware } from "./roundware";
import { SpeakerEngine } from "./speaker/speaker_engine";
import { Coordinates, IMixParams } from "./types";
import { buildAudioContext, coordsToPoints, getUrlParam } from "./utils";

jest.mock("./playlist");
jest.mock("./speaker/speaker_engine");
jest.mock("./assetPool");

// Mock utils module
jest.mock("./utils", () => ({
  ...jest.requireActual("./utils"),
  buildAudioContext: jest.fn(),
  coordsToPoints: jest.fn(),
  getUrlParam: jest.fn()
}));

jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());

describe("Mixer", () => {
  let mockClient: Roundware;
  let listenerLocation: Coordinates;
  let mixParams: IMixParams;
  let mixer: Mixer;

  beforeEach(() => {
    mockClient = {
      assets: jest.fn().mockReturnValue([]),
      timedAssets: jest.fn().mockReturnValue([]),
      audiotracks: jest.fn().mockReturnValue([]),
      speakers: jest.fn().mockReturnValue([]),
      events: {
        logEvent: jest.fn(),
      },
    } as unknown as Roundware;

    listenerLocation = { latitude: 10, longitude: 20 };
    mixParams = {};

    (coordsToPoints as jest.Mock).mockReturnValue({ x: 10, y: 20 });
    (buildAudioContext as jest.Mock).mockReturnValue({} as any);

    mixer = new Mixer({
      client: mockClient,
      listenerLocation,
      mixParams,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize correctly", () => {
    expect(mixer.playing).toBe(false);
    expect(mixer.audioContext).toBeDefined();
    expect(mixer.assetPool).toBeInstanceOf(AssetPool);
  });

  it("should initialize context correctly during play", () => {
    mixer.play();
    expect(mixer.playlist).toBeInstanceOf(Playlist);
    expect(mixer.speakerEngine).toBeInstanceOf(SpeakerEngine);
  });

  it("should update parameters", () => {
    const newLocation = { latitude: 15, longitude: 25 };
    mixer.updateParams({ listenerLocation: newLocation });

    expect(coordsToPoints).toHaveBeenCalledWith({
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
    });
    expect(mixer.mixParams.listenerPoint).toEqual({ x: 10, y: 20 });
  });

  it("should skip a track if playlist exists", () => {
    const mockSkip = jest.fn();
    mixer.playlist = { skip: mockSkip } as unknown as Playlist;

    mixer.skipTrack(5);
    expect(mockSkip).toHaveBeenCalledWith(5);
  });

  it("should replay a track if playlist exists", () => {
    const mockReplay = jest.fn();
    mixer.playlist = { replay: mockReplay } as unknown as Playlist;

    mixer.replayTrack(7);
    expect(mockReplay).toHaveBeenCalledWith(7);
  });

  it("should return correct string representation", () => {
    expect(mixer.toString()).toBe("Roundware Mixer");
  });

  it("should initialize context if playlist doesn't exist", () => {
    mixer.initContext();

    expect(mixer.playlist).toBeInstanceOf(Playlist);
    expect(mixer.speakerEngine).toBeInstanceOf(SpeakerEngine);
  });

  it("should log error if listenerPoint is missing during initContext", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mixer.mixParams.listenerPoint = undefined;

    mixer.initContext();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[mixer] listenerPoint was missing while initiating mixer!"
    );
    consoleErrorSpy.mockRestore();
  });

  it("should toggle play state correctly", () => {
    const playSpy = jest.spyOn(mixer, "play");
    const stopSpy = jest.spyOn(mixer, "stop");

    mixer.toggle(true);
    expect(playSpy).toHaveBeenCalled();

    mixer.toggle(false);
    expect(stopSpy).toHaveBeenCalled();

    playSpy.mockRestore();
    stopSpy.mockRestore();
  });

  it("should play correctly", () => {
    mixer.initContext();
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
  
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
  
    mixer.play();
  
    expect(mockClient.events!.logEvent).toHaveBeenCalledWith("play_stream");
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
  
    speakerPlaySpy.mockRestore();
  });

  it("should resume suspended audio context when playing", async () => {
    // Mock audio context to be in suspended state
    const mockResume = jest.fn();
    mixer.audioContext = {
      state: "suspended",
      resume: mockResume
    } as unknown as IAudioContext;

    // Initialize context to set up speaker engine
    mixer.initContext();

    // Mock playlist and speaker engine
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());

    await mixer.play();

    expect(mockResume).toHaveBeenCalled();
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mockClient.events!.logEvent).toHaveBeenCalledWith("play_stream");

    speakerPlaySpy.mockRestore();
  });

  it("should test speakerEngine.stop directly", () => {
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
  
    mixer.initContext();
  
    mixer.speakerEngine?.stop();
  
    expect(speakerStopSpy).toHaveBeenCalled();
  
    speakerStopSpy.mockRestore();
  });

  it("should toggle play state based on current playing status", () => {
    const playSpy = jest.spyOn(mixer, "play");
    const stopSpy = jest.spyOn(mixer, "stop");
  
    mixer.playing = true;
    mixer.toggle();
    expect(stopSpy).toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
  
    jest.clearAllMocks();
  
    mixer.playing = false;
    mixer.toggle();
    expect(playSpy).toHaveBeenCalled();
    expect(stopSpy).not.toHaveBeenCalled();
  });

  it("should isolate specific track when selectTrackId is provided", () => {
    // Setup mock to return track ID
    (getUrlParam as jest.Mock).mockReturnValue("123");
    const mockConsoleInfo = jest.spyOn(console, "info").mockImplementation(() => {});

    // Create mock audio tracks
    const mockAudioTracks = [
      { id: 123, name: "Track 123" },
      { id: 456, name: "Track 456" }
    ];
    
    // Update mock client to return our mock audio tracks
    (mockClient.audiotracks as jest.Mock).mockReturnValue(mockAudioTracks);

    // Initialize context which will trigger track isolation
    mixer.initContext();

    // Verify that only the selected track is used
    expect(getUrlParam).toHaveBeenCalledWith(expect.any(String), "rwfSelectTrackId");
    expect(mockConsoleInfo).toHaveBeenCalledWith("isolating track #123");
    expect(mixer.playlist).toBeDefined();
    
    // Clean up
    mockConsoleInfo.mockRestore();
    (getUrlParam as jest.Mock).mockClear();
  });

  it("should handle skipTrack when playlist is undefined", () => {
    mixer.playlist = undefined;
    expect(() => mixer.skipTrack(5)).not.toThrow();
  });

  it("should handle replayTrack when playlist is undefined", () => {
    mixer.playlist = undefined;
    expect(() => mixer.replayTrack(7)).not.toThrow();
  });

  it("should not log play event when already playing", async () => {
    // Initialize context to set up speaker engine
    mixer.initContext();

    mixer.playing = true;
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());

    await mixer.play();

    expect(mockClient.events!.logEvent).not.toHaveBeenCalledWith("play_stream");
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();

    speakerPlaySpy.mockRestore();
  });

  it("should not log pause event when already stopped", () => {
    // Initialize context to set up speaker engine
    mixer.initContext();

    mixer.playing = false;
    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());

    mixer.stop();

    expect(mockClient.events!.logEvent).not.toHaveBeenCalledWith("pause_stream");
    expect(mockPause).toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();

    speakerStopSpy.mockRestore();
  });

  it("should handle empty skip method", () => {
    expect(() => mixer.skip()).not.toThrow();
  });

  it("should initialize without filters", () => {
    const mixerWithoutFilters = new Mixer({
      client: mockClient,
      listenerLocation,
      mixParams: {}
    });
    expect(mixerWithoutFilters).toBeDefined();
  });

  it("should handle play when speakerEngine is undefined", async () => {
    // Initialize context to set up speaker engine
    mixer.initContext();
    // Then set it to undefined to test the branch
    mixer.speakerEngine = undefined;

    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;

    await mixer.play();

    expect(mockPlay).toHaveBeenCalled();
    expect(mockClient.events!.logEvent).toHaveBeenCalledWith("play_stream");
  });

  it("should handle stop when speakerEngine is undefined", () => {
    // Initialize context to set up speaker engine
    mixer.initContext();
    // Then set it to undefined to test the branch
    mixer.speakerEngine = undefined;

    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;

    mixer.stop();

    expect(mockPause).toHaveBeenCalled();
  });

  it("should call pause on playlist and stop on speakerEngine when stopping", () => {
    // Initialize context to set up speaker engine
    mixer.initContext();

    const mockPause = jest.fn();
    const mockStop = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    mixer.speakerEngine = { stop: mockStop } as unknown as SpeakerEngine;

    mixer.stop();

    expect(mockPause).toHaveBeenCalled();
    expect(mockStop).toHaveBeenCalled();
  });

  it("should initialize with all optional parameters", () => {
    const mockFilter = jest.fn();
    const mixerWithAllParams = new Mixer({
      client: mockClient,
      listenerLocation,
      filters: mockFilter,
      sortMethods: ["test"],
      mixParams: {}
    });
    expect(mixerWithAllParams).toBeDefined();
  });

  it("should handle play and stop when speakerEngine is undefined", async () => {
    // Don't initialize context to keep speakerEngine undefined
    const mockPlay = jest.fn();
    const mockPause = jest.fn();
    mixer.playlist = { 
      play: mockPlay,
      pause: mockPause 
    } as unknown as Playlist;

    // Test play
    mixer.playing = false;
    await mixer.play();
    expect(mockPlay).toHaveBeenCalled();
    expect(mockClient.events!.logEvent).toHaveBeenCalledWith("play_stream");
    expect(mixer.playing).toBe(true);

    // Reset mocks
    jest.clearAllMocks();
    mockPlay.mockClear();
    mockPause.mockClear();

    // Test stop
    mixer.playing = true;
    mixer.stop();
    expect(mockPause).toHaveBeenCalled();
    expect(mockClient.events!.logEvent).toHaveBeenCalledWith("pause_stream");
    expect(mixer.playing).toBe(false);
  });

  it("should initialize with default mixParams when undefined is provided", () => {
    const mixerWithDefaultParams = new Mixer({
      client: mockClient,
      listenerLocation,
      mixParams: undefined as any
    });

    expect(mixerWithDefaultParams.mixParams).toEqual({
      listenerPoint: { x: 10, y: 20 }
    });
  });

  it("should handle stop when playlist is undefined", () => {
    // Initialize context to set up speaker engine
    mixer.initContext();

    const mockStop = jest.fn();
    mixer.playlist = undefined;
    mixer.speakerEngine = { stop: mockStop } as unknown as SpeakerEngine;

    expect(() => mixer.stop()).not.toThrow();
  });

  it("should handle playlist pause correctly in stop()", () => {
    // Test case 1: playlist exists
    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    mixer.speakerEngine = undefined;
    mixer.stop();
    expect(mockPause).toHaveBeenCalled();

    // Reset mocks
    mockPause.mockClear();
    mixer.playing = false;

    // Test case 2: playlist is undefined
    mixer.playlist = undefined;
    mixer.stop();
    expect(mockPause).not.toHaveBeenCalled();
  });

  it("should handle playlist state in stop()", () => {
    // Setup
    const mockPause = jest.fn();
    mixer.playing = true; // Ensure we're in playing state

    // Test with playlist defined
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    mixer.stop();
    expect(mockPause).toHaveBeenCalledTimes(1);
    expect(mixer.playing).toBe(false);

    // Reset
    mockPause.mockClear();
    mixer.playing = true;

    // Test with playlist undefined
    mixer.playlist = undefined;
    mixer.stop();
    expect(mockPause).not.toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
  });

  it("should handle stop when both playlist and speakerEngine are undefined", () => {
    mixer.playlist = undefined;
    mixer.speakerEngine = undefined;

    expect(() => mixer.stop()).not.toThrow();
  });

  it("should call pause on playlist when speakerEngine is undefined", () => {
    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    mixer.speakerEngine = undefined;

    mixer.stop();

    expect(mockPause).toHaveBeenCalled();
  });

  it("should not call pause when playlist is undefined", () => {
    mixer.playlist = undefined;
    mixer.speakerEngine = { stop: jest.fn() } as unknown as SpeakerEngine;

    expect(() => mixer.stop()).not.toThrow();
  });

  it("should pause playlist when stopping", () => {
    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    mixer.stop();
    expect(mockPause).toHaveBeenCalled();
  });

  it("should call speaker engine play and stop methods", async () => {
    // Mock initContext to prevent it from overwriting our setup
    const originalInitContext = mixer.initContext;
    mixer.initContext = jest.fn();
    
    // Mock the speaker engine methods
    const mockPlay = jest.fn();
    const mockStop = jest.fn();
    
    // Create a proper speaker engine instance
    mixer.speakerEngine = new SpeakerEngine(
      mockClient.speakers(),
      mixer.audioContext,
      { mode: "stream" }
    );
    
    // Spy on the methods
    jest.spyOn(mixer.speakerEngine, "play").mockImplementation(mockPlay);
    jest.spyOn(mixer.speakerEngine, "stop").mockImplementation(mockStop);
    
    // Test play
    await mixer.play();
    expect(mockPlay).toHaveBeenCalled();
    
    // Test stop
    mixer.stop();
    expect(mockStop).toHaveBeenCalled();
    
    // Restore original initContext
    mixer.initContext = originalInitContext;
  });
});
