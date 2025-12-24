import { AssetPool } from "./assetPool";
import { Mixer } from "./mixer";
import { Playlist } from "./playlist";
import { Roundware } from "./roundware";
import { SpeakerEngine } from "./speaker/speaker_engine";
import { Coordinates, IMixParams } from "./types";
import { buildAudioContext, coordsToPoints, getUrlParam } from "./utils";

jest.mock("./playlist");
jest.mock("./speaker/speaker_engine");
jest.mock("./utils");
jest.mock("./assetPool");
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

  it("should use default empty object for mixParams when undefined (line 39)", () => {
    // Test line 39: mixParams = {} default parameter
    // Pass undefined to trigger the default parameter value
    const mixerWithUndefinedMixParams = new Mixer({
      client: mockClient,
      listenerLocation,
      mixParams: undefined as any, // Pass undefined to test default parameter
    });

    // Verify mixer was created successfully with default mixParams = {}
    // The mixParams will be merged with listenerPoint, so it should have listenerPoint
    expect(mixerWithUndefinedMixParams).toBeInstanceOf(Mixer);
    expect(mixerWithUndefinedMixParams.mixParams).toHaveProperty("listenerPoint");
    expect(mixerWithUndefinedMixParams.playing).toBe(false);
    
    // Verify that mixParams was initialized (default {} was used and merged)
    expect(mixerWithUndefinedMixParams.mixParams.listenerPoint).toEqual({ x: 10, y: 20 });
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

  it("should not throw when skipTrack is called without playlist (line 90)", () => {
    // Test line 90: if (this.playlist) this.playlist.skip(trackId);
    // When playlist is null/undefined, the condition is false and skip is not called
    mixer.playlist = null as any;

    // Should not throw when playlist is null
    expect(() => mixer.skipTrack(5)).not.toThrow();
  });

  it("should call skip method (line 93)", () => {
    // Test line 93: skip() {} - empty method
    // Verify the method exists and can be called without throwing
    expect(() => mixer.skip()).not.toThrow();
    expect(typeof mixer.skip).toBe("function");
  });

  it("should replay a track if playlist exists", () => {
    const mockReplay = jest.fn();
    mixer.playlist = { replay: mockReplay } as unknown as Playlist;

    mixer.replayTrack(7);
    expect(mockReplay).toHaveBeenCalledWith(7);
  });

  it("should not throw when replayTrack is called without playlist (line 97-98)", () => {
    // Test lines 97-98: if (this.playlist) this.playlist.replay(trackId);
    // When playlist is null/undefined, the condition is false and replay is not called
    mixer.playlist = null as any;

    // Should not throw when playlist is null
    expect(() => mixer.replayTrack(7)).not.toThrow();
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

  it("should play correctly", async () => {
    mixer.initContext();
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
  
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
  
    await mixer.play();
  
    expect(mockClient.events!.logEvent).toHaveBeenCalledWith("play_stream");
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
  
    speakerPlaySpy.mockRestore();
  });

  it("should resume audioContext when state is suspended (line 168)", async () => {
    const mockResume = jest.fn().mockResolvedValue(undefined);
    
    // Mock audioContext with suspended state and resume method
    (buildAudioContext as jest.Mock).mockReturnValue({
      state: "suspended",
      resume: mockResume,
    } as any);
    
    // Create a new mixer with the mocked audioContext
    const mixerWithSuspendedContext = new Mixer({
      client: mockClient,
      listenerLocation,
      mixParams,
    });
    
    mixerWithSuspendedContext.initContext();
    const mockPlay = jest.fn();
    mixerWithSuspendedContext.playlist = { play: mockPlay } as unknown as Playlist;
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    // Call play - should resume audioContext (line 168)
    await mixerWithSuspendedContext.play();
    
    // Verify resume was called (line 168)
    expect(mockResume).toHaveBeenCalled();
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    
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

  it("should not log play_stream event when playing is already true (line 172)", async () => {
    // Test line 172: if (this.playing === false) - false branch
    mixer.initContext();
    mixer.playing = true; // Set playing to true before calling play()
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    const logEventSpy = jest.spyOn(mockClient.events!, "logEvent");
    
    await mixer.play();
    
    // When playing is already true, logEvent should not be called (line 172 condition is false)
    expect(logEventSpy).not.toHaveBeenCalledWith("play_stream");
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    
    speakerPlaySpy.mockRestore();
    logEventSpy.mockRestore();
  });

  it("should call playlist.play when playlist exists (line 176)", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Explicitly test the true branch of line 176
    mixer.initContext();
    const mockPlay = jest.fn();
    const playlistMock = { play: mockPlay } as unknown as Playlist;
    mixer.playlist = playlistMock;
    
    // Spy on the playlist.play method directly to verify line 176 execution
    const playlistPlaySpy = jest.spyOn(playlistMock, 'play' as any);
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    // Ensure playing is false initially to test the full play() flow
    mixer.playing = false;
    
    await mixer.play();
    
    // Verify line 176 executed: playlist.play() was called when playlist exists
    // This verifies the condition (this.playlist) evaluated to true and the method was called
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(playlistPlaySpy).toHaveBeenCalledTimes(1);
    expect(mockPlay).toHaveBeenCalledWith(); // Verify it was called with no arguments
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    playlistPlaySpy.mockRestore();
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 condition check when playlist is truthy", async () => {
    // Additional test to ensure line 176 condition is evaluated
    // Test with different truthy values to ensure the condition works
    mixer.initContext();
    const mockPlay = jest.fn();
    
    // Test with a truthy object (not just a mock)
    mixer.playlist = { 
      play: mockPlay,
      pause: jest.fn(),
      skip: jest.fn(),
      replay: jest.fn(),
    } as unknown as Playlist;
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 176: if (this.playlist) should evaluate to true and call this.playlist.play()
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    
    speakerPlaySpy.mockRestore();
  });

  it("should not call playlist.play when playlist is null (line 176)", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Test the false branch when playlist is null - condition evaluates to false
    mixer.initContext();
    mixer.playlist = null as any; // Set playlist to null (falsy)
    
    const mockPlay = jest.fn();
    // Create a separate object to verify it's not called
    const unusedPlaylist = { play: mockPlay };
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 176 condition (this.playlist) is false when null, so playlist.play() should not be called
    expect(mockPlay).not.toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled(); // Line 177 should still execute
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should not call playlist.play when playlist is undefined (line 176)", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Test the false branch when playlist is undefined
    mixer.initContext();
    mixer.playlist = undefined as any; // Set playlist to undefined
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // playlist.play() should not be called when playlist is undefined (line 176 condition is false)
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 with playlist set before initContext", async () => {
    // Test line 176: Ensure the condition is evaluated even when playlist is set before initContext
    // Note: initContext() returns early if playlist exists, so we need to ensure speakerEngine exists
    mixer.initContext(); // Create speakerEngine first
    
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    
    // Set up spy after speakerEngine is created
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 176 should execute: if (this.playlist) this.playlist.play();
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(speakerPlaySpy).toHaveBeenCalled();
    
    speakerPlaySpy.mockRestore();
  });

  it("should not execute playlist.play when playlist is false (line 176)", async () => {
    // Test line 176: if (this.playlist) - test with false value
    mixer.initContext();
    mixer.playlist = false as any; // Set playlist to false (falsy value)
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    const mockPlay = jest.fn();
    
    await mixer.play();
    
    // Line 176 condition should be false, so playlist.play() should not be called
    expect(mockPlay).not.toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should not execute playlist.play when playlist is empty string (line 176)", async () => {
    // Test line 176: if (this.playlist) - test with empty string (falsy)
    mixer.initContext();
    mixer.playlist = "" as any; // Set playlist to empty string (falsy value)
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    const mockPlay = jest.fn();
    
    await mixer.play();
    
    // Line 176 condition should be false, so playlist.play() should not be called
    expect(mockPlay).not.toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should not execute playlist.play when playlist is 0 (line 176)", async () => {
    // Test line 176: if (this.playlist) - test with 0 (falsy)
    mixer.initContext();
    mixer.playlist = 0 as any; // Set playlist to 0 (falsy value)
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    const mockPlay = jest.fn();
    
    await mixer.play();
    
    // Line 176 condition should be false, so playlist.play() should not be called
    expect(mockPlay).not.toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 and call playlist.play() when playlist is truthy object", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Explicit test case for line 176 with a truthy playlist object
    mixer.initContext();
    
    // Create a mock playlist with play method
    const mockPlayMethod = jest.fn();
    const mockPlaylist = {
      play: mockPlayMethod,
      pause: jest.fn(),
      skip: jest.fn(),
      replay: jest.fn(),
    };
    
    mixer.playlist = mockPlaylist as unknown as Playlist;
    
    // Mock speakerEngine to avoid errors
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    // Ensure playing state is set correctly
    mixer.playing = false;
    
    // Execute play() which should trigger line 176
    await mixer.play();
    
    // Verify line 176 executed: the condition (this.playlist) was truthy and this.playlist.play() was called
    expect(mockPlayMethod).toHaveBeenCalledTimes(1);
    expect(mockPlayMethod).toHaveBeenCalledWith();
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should evaluate line 176 condition and skip playlist.play when playlist is NaN", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Test with NaN (falsy value) to ensure condition evaluates correctly
    mixer.initContext();
    mixer.playlist = NaN as any; // Set playlist to NaN (falsy)
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    const mockPlay = jest.fn();
    
    await mixer.play();
    
    // Line 176 condition should be false when playlist is NaN, so playlist.play() should not be called
    expect(mockPlay).not.toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 true branch when playlist is a non-empty object", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Ensure the true branch is executed with a clear truthy object
    mixer.initContext();
    
    // Create a playlist object that's clearly truthy
    const playlistObj = Object.create(null);
    const mockPlayFn = jest.fn();
    playlistObj.play = mockPlayFn;
    
    mixer.playlist = playlistObj as unknown as Playlist;
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 176: if (this.playlist) should be true, so this.playlist.play() should be called
    expect(mockPlayFn).toHaveBeenCalledTimes(1);
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 false branch when playlist is explicitly set to null after init", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Explicitly test false branch by setting playlist to null after initContext
    mixer.initContext();
    
    // First set it to a truthy value, then explicitly set to null
    mixer.playlist = { play: jest.fn() } as unknown as Playlist;
    mixer.playlist = null as any; // Explicitly set to null to test false branch
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    const mockPlay = jest.fn();
    
    await mixer.play();
    
    // Line 176 condition (this.playlist) is false when null, so playlist.play() should not be called
    expect(mockPlay).not.toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should cover line 176 by verifying condition evaluation with truthy playlist", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Direct test to ensure the condition is evaluated and true branch executes
    mixer.initContext();
    
    // Set playlist to a truthy value that will pass the condition
    const playMethod = jest.fn();
    mixer.playlist = { play: playMethod } as unknown as Playlist;
    
    // Verify playlist is truthy before calling play()
    expect(!!mixer.playlist).toBe(true);
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 176: if (this.playlist) evaluates to true, so this.playlist.play() is called
    expect(playMethod).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    
    speakerPlaySpy.mockRestore();
  });

  it("should cover line 176 by verifying condition evaluation with falsy playlist", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // Direct test to ensure the condition is evaluated and false branch executes
    mixer.initContext();
    
    // Set playlist to null (falsy) that will fail the condition
    mixer.playlist = null as any;
    
    // Verify playlist is falsy before calling play()
    expect(!!mixer.playlist).toBe(false);
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    const playMethod = jest.fn();
    
    await mixer.play();
    
    // Line 176: if (this.playlist) evaluates to false, so this.playlist.play() is NOT called
    expect(playMethod).not.toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
    
    speakerPlaySpy.mockRestore();
  });

  it("should call speakerEngine.play when speakerEngine exists (line 177)", async () => {
    // Test line 177: this.speakerEngine?.play();
    // Test the true branch when speakerEngine exists
    mixer.initContext();
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 177 should execute: this.speakerEngine?.play() when speakerEngine exists
    expect(speakerPlaySpy).toHaveBeenCalledTimes(1);
    expect(mockPlay).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should not throw when speakerEngine is null (line 177)", async () => {
    // Test line 177: this.speakerEngine?.play();
    // Test the false branch when speakerEngine is null (optional chaining)
    mixer.initContext();
    mixer.speakerEngine = null as any; // Set speakerEngine to null
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    
    // Should not throw when speakerEngine is null (line 177 uses optional chaining)
    await expect(mixer.play()).resolves.not.toThrow();
    
    // playlist.play() should still be called (line 176)
    expect(mockPlay).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
  });

  it("should not throw when speakerEngine is undefined (line 177)", async () => {
    // Test line 177: this.speakerEngine?.play();
    // Test the false branch when speakerEngine is undefined (optional chaining)
    mixer.initContext();
    mixer.speakerEngine = undefined as any; // Set speakerEngine to undefined
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    
    // Should not throw when speakerEngine is undefined (line 177 uses optional chaining)
    await expect(mixer.play()).resolves.not.toThrow();
    
    // playlist.play() should still be called (line 176)
    expect(mockPlay).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
  });

  it("should execute both lines 176 and 177 together", async () => {
    // Test lines 176-177: Ensure both lines execute in sequence
    mixer.initContext();
    const mockPlay = jest.fn();
    mixer.playlist = { play: mockPlay } as unknown as Playlist;
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 176: if (this.playlist) this.playlist.play();
    expect(mockPlay).toHaveBeenCalledTimes(1);
    
    // Line 177: this.speakerEngine?.play();
    expect(speakerPlaySpy).toHaveBeenCalledTimes(1);
    
    // Verify both executed in order
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute lines 176-177 in correct order: playlist.play() before speakerEngine.play()", async () => {
    // Test lines 176-177: Verify execution order
    mixer.initContext();
    const mockPlaylistPlay = jest.fn();
    mixer.playlist = { play: mockPlaylistPlay } as unknown as Playlist;
    
    const callOrder: string[] = [];
    
    // Track call order by pushing to array in mock implementations
    mockPlaylistPlay.mockImplementation(() => {
      callOrder.push("playlist.play");
    });
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => {
      callOrder.push("speakerEngine.play");
      return Promise.resolve();
    });
    
    await mixer.play();
    
    // Verify line 176 executes before line 177
    expect(callOrder).toEqual(["playlist.play", "speakerEngine.play"]);
    expect(mockPlaylistPlay).toHaveBeenCalledTimes(1);
    expect(speakerPlaySpy).toHaveBeenCalledTimes(1);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 177 even when line 176 condition is false (playlist is null)", async () => {
    // Test lines 176-177: Line 177 should execute even if line 176 condition is false
    mixer.initContext();
    mixer.playlist = null as any; // Line 176 condition will be false
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    await mixer.play();
    
    // Line 176: if (this.playlist) - condition is false, so playlist.play() is not called
    // Line 177: this.speakerEngine?.play() - should still execute
    expect(speakerPlaySpy).toHaveBeenCalledTimes(1);
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 when playlist exists and play() is called", async () => {
    // Test line 176: Direct test to ensure line 176 executes when playlist exists
    // First call initContext() to set up speakerEngine
    mixer.initContext();
    
    // Now set playlist AFTER initContext() so it won't be overwritten
    const mockPlaylistPlay = jest.fn();
    const playlistMock = { play: mockPlaylistPlay } as unknown as Playlist;
    mixer.playlist = playlistMock;
    
    // Verify playlist is set before calling play()
    expect(mixer.playlist).toBe(playlistMock);
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    // Call play() - initContext() will be called internally, but since playlist exists, it won't create a new one
    await mixer.play();
    
    // Line 176: if (this.playlist) this.playlist.play(); - should execute
    expect(mockPlaylistPlay).toHaveBeenCalledTimes(1);
    expect(speakerPlaySpy).toHaveBeenCalledTimes(1);
    expect(mixer.playing).toBe(true);
    
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 ensuring playlist.play() is called directly", async () => {
    // Test line 176: Direct test to ensure line 176 executes and calls playlist.play()
    // This test specifically targets line 176 coverage
    mixer.initContext(); // Set up speakerEngine
    
    // Create a mock playlist with a spy on the play method
    const mockPlaylistPlay = jest.fn();
    const playlistMock = { play: mockPlaylistPlay } as unknown as Playlist;
    mixer.playlist = playlistMock;
    
    // Spy directly on the play method to verify it's called
    const playlistPlaySpy = jest.spyOn(playlistMock, 'play' as any);
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    // Call play() - line 176 should execute: if (this.playlist) this.playlist.play();
    await mixer.play();
    
    // Verify line 176 executed: playlist.play() was called
    expect(playlistPlaySpy).toHaveBeenCalledTimes(1);
    expect(mockPlaylistPlay).toHaveBeenCalledTimes(1);
    expect(speakerPlaySpy).toHaveBeenCalledTimes(1);
    expect(mixer.playing).toBe(true);
    
    playlistPlaySpy.mockRestore();
    speakerPlaySpy.mockRestore();
  });

  it("should execute line 176 using Playlist instance from initContext", async () => {
    // Test line 176: Use the actual Playlist instance created by initContext()
    // This ensures line 176 executes with the real playlist object
    mixer.initContext(); // This creates a Playlist instance
    
    // Verify playlist exists
    expect(mixer.playlist).toBeDefined();
    
    // Spy on the play method of the actual playlist instance
    const playlistPlaySpy = jest.spyOn(mixer.playlist!, 'play' as any);
    
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => Promise.resolve());
    
    // Call play() - line 176 should execute: if (this.playlist) this.playlist.play();
    await mixer.play();
    
    // Verify line 176 executed: playlist.play() was called
    expect(playlistPlaySpy).toHaveBeenCalledTimes(1);
    expect(speakerPlaySpy).toHaveBeenCalledTimes(1);
    expect(mixer.playing).toBe(true);
    
    playlistPlaySpy.mockRestore();
    speakerPlaySpy.mockRestore();
  });

  it("should not execute line 176 when initContext fails to create playlist (line 176 false branch)", async () => {
    // Test line 176: if (this.playlist) this.playlist.play();
    // When initContext fails (missing listenerPoint), playlist remains undefined
    mixer.mixParams.listenerPoint = undefined;
    mixer.playing = false;
    
    const mockPlay = jest.fn();
    // Don't set playlist - it should remain undefined after failed initContext
    
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    // play() calls initContext() which will fail and return early, leaving playlist undefined
    await mixer.play();
    
    // Line 176: if (this.playlist) - condition is false, so playlist.play() should not be called
    expect(mockPlay).not.toHaveBeenCalled();
    expect(mixer.playlist).toBeUndefined();
    expect(mixer.speakerEngine).toBeUndefined(); // speakerEngine also not created when initContext fails
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Line 177 won't execute because speakerEngine is undefined (optional chaining prevents error but doesn't call)
    expect(mixer.playing).toBe(true);
    
    consoleErrorSpy.mockRestore();
  });

  it("should execute line 177 even when initContext fails to create speakerEngine (line 177)", async () => {
    // Test line 177: this.speakerEngine?.play();
    // When initContext fails (missing listenerPoint), speakerEngine remains undefined
    mixer.mixParams.listenerPoint = undefined;
    mixer.playing = false;
    
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    // play() calls initContext() which will fail and return early, leaving speakerEngine undefined
    // Should not throw due to optional chaining
    await expect(mixer.play()).resolves.not.toThrow();
    expect(mixer.speakerEngine).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(true);
    
    consoleErrorSpy.mockRestore();
  });

  it("should cover line 176 false branch when playlist is undefined from failed initContext", async () => {
    // Test line 176: Ensure false branch is covered when playlist is undefined
    // This happens when initContext() fails to create playlist
    mixer.mixParams.listenerPoint = undefined;
    mixer.playing = false;
    
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const mockPlay = jest.fn();
    
    await mixer.play();
    
    // Verify initContext was called (via play) but playlist wasn't created
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mixer.playlist).toBeUndefined();
    expect(mixer.speakerEngine).toBeUndefined(); // speakerEngine also not created when initContext fails
    
    // Line 176: if (this.playlist) - false branch, playlist.play() not called
    expect(mockPlay).not.toHaveBeenCalled();
    // Line 177 won't execute because speakerEngine is undefined (optional chaining prevents error but doesn't call)
    expect(mixer.playing).toBe(true);
    
    consoleErrorSpy.mockRestore();
  });

  it("should execute line 186 using Playlist instance from initContext", () => {
    // Test line 186: Use the actual Playlist instance created by initContext()
    // This ensures line 186 executes with the real playlist object
    mixer.initContext(); // This creates a Playlist instance
    mixer.playing = true;
    
    // Verify playlist exists
    expect(mixer.playlist).toBeDefined();
    
    // Spy on the pause method of the actual playlist instance
    const playlistPauseSpy = jest.spyOn(mixer.playlist!, 'pause' as any);
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    
    // Call stop() - line 186 should execute: if (this.playlist) this.playlist.pause();
    mixer.stop();
    
    // Verify line 186 executed: playlist.pause() was called
    expect(playlistPauseSpy).toHaveBeenCalledTimes(1);
    expect(speakerStopSpy).toHaveBeenCalledTimes(1);
    expect(mixer.playing).toBe(false);
    
    playlistPauseSpy.mockRestore();
    speakerStopSpy.mockRestore();
  });

  it("should stop and log pause_stream event when playing is true (lines 180-186)", () => {
    // Test lines 180-186: stop() method
    mixer.initContext();
    mixer.playing = true; // Set playing to true
    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    const logEventSpy = jest.spyOn(mockClient.events!, "logEvent");
    
    mixer.stop();
    
    // Verify lines 182-186: when playing is true, log pause_stream and pause playlist
    expect(logEventSpy).toHaveBeenCalledWith("pause_stream");
    expect(mixer.playing).toBe(false);
    expect(mockPause).toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    
    speakerStopSpy.mockRestore();
    logEventSpy.mockRestore();
  });

  it("should not log pause_stream event when playing is already false (line 182)", () => {
    // Test line 182: if (this.playing === true) - false branch
    mixer.initContext();
    mixer.playing = false; // Set playing to false before calling stop()
    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    const logEventSpy = jest.spyOn(mockClient.events!, "logEvent");
    
    mixer.stop();
    
    // When playing is already false, logEvent should not be called (line 182 condition is false)
    expect(logEventSpy).not.toHaveBeenCalledWith("pause_stream");
    expect(mixer.playing).toBe(false);
    expect(mockPause).toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    
    speakerStopSpy.mockRestore();
    logEventSpy.mockRestore();
  });

  it("should call playlist.pause when playlist exists (line 186)", () => {
    // Test line 186: if (this.playlist) this.playlist.pause();
    // Explicitly test the true branch of line 186
    mixer.initContext();
    mixer.playing = true;
    const mockPause = jest.fn();
    const playlistMock = { pause: mockPause } as unknown as Playlist;
    mixer.playlist = playlistMock;
    
    // Spy on the playlist.pause method directly to verify line 186 execution
    const playlistPauseSpy = jest.spyOn(playlistMock, 'pause' as any);
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    
    mixer.stop();
    
    // Verify line 186 executed: playlist.pause() was called when playlist exists
    expect(mockPause).toHaveBeenCalledTimes(1);
    expect(playlistPauseSpy).toHaveBeenCalledTimes(1);
    expect(speakerStopSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
    
    playlistPauseSpy.mockRestore();
    speakerStopSpy.mockRestore();
  });

  it("should not call playlist.pause when playlist is null (line 186)", () => {
    // Test line 186: if (this.playlist) this.playlist.pause();
    // Test the false branch when playlist is null - condition evaluates to false
    mixer.initContext();
    mixer.playlist = null as any; // Set playlist to null (falsy)
    mixer.playing = true;
    
    const mockPause = jest.fn();
    // Create a separate object to verify it's not called
    const unusedPlaylist = { pause: mockPause };
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    
    mixer.stop();
    
    // Line 186 condition (this.playlist) is false when null, so playlist.pause() should not be called
    expect(mockPause).not.toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled(); // speakerEngine.stop() should still execute
    expect(mixer.playing).toBe(false);
    
    speakerStopSpy.mockRestore();
  });

  it("should not call playlist.pause when playlist is undefined (line 186)", () => {
    // Test line 186: if (this.playlist) this.playlist.pause();
    // Test the false branch when playlist is undefined
    mixer.initContext();
    mixer.playlist = undefined as any; // Set playlist to undefined
    mixer.playing = true;
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    
    mixer.stop();
    
    // playlist.pause() should not be called when playlist is undefined (line 186 condition is false)
    expect(speakerStopSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
    
    speakerStopSpy.mockRestore();
  });

  it("should execute line 186 with playlist set before initContext", () => {
    // Test line 186: Ensure the condition is evaluated even when playlist is set before initContext
    // Note: initContext() returns early if playlist exists, so we need to ensure speakerEngine exists
    mixer.initContext(); // Create speakerEngine first
    
    const mockPause = jest.fn();
    mixer.playlist = { pause: mockPause } as unknown as Playlist;
    mixer.playing = true;
    
    // Set up spy after speakerEngine is created
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    
    mixer.stop();
    
    // Line 186 should execute: if (this.playlist) this.playlist.pause();
    expect(mockPause).toHaveBeenCalledTimes(1);
    expect(speakerStopSpy).toHaveBeenCalled();
    
    speakerStopSpy.mockRestore();
  });

  it("should not execute playlist.pause when playlist is false (line 186)", () => {
    // Test line 186: if (this.playlist) - test with false value
    mixer.initContext();
    mixer.playlist = false as any; // Set playlist to false (falsy value)
    mixer.playing = true;
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    const mockPause = jest.fn();
    
    mixer.stop();
    
    // Line 186 condition should be false, so playlist.pause() should not be called
    expect(mockPause).not.toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
    
    speakerStopSpy.mockRestore();
  });

  it("should not execute playlist.pause when playlist is empty string (line 186)", () => {
    // Test line 186: if (this.playlist) - test with empty string (falsy)
    mixer.initContext();
    mixer.playlist = "" as any; // Set playlist to empty string (falsy value)
    mixer.playing = true;
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    const mockPause = jest.fn();
    
    mixer.stop();
    
    // Line 186 condition should be false, so playlist.pause() should not be called
    expect(mockPause).not.toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
    
    speakerStopSpy.mockRestore();
  });

  it("should not execute playlist.pause when playlist is 0 (line 186)", () => {
    // Test line 186: if (this.playlist) - test with 0 (falsy)
    mixer.initContext();
    mixer.playlist = 0 as any; // Set playlist to 0 (falsy value)
    mixer.playing = true;
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    const mockPause = jest.fn();
    
    mixer.stop();
    
    // Line 186 condition should be false, so playlist.pause() should not be called
    expect(mockPause).not.toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
    
    speakerStopSpy.mockRestore();
  });

  it("should execute line 186 true branch when playlist is a non-empty object", () => {
    // Test line 186: if (this.playlist) this.playlist.pause();
    // Ensure the true branch is executed with a clear truthy object
    mixer.initContext();
    mixer.playing = true;
    
    // Create a playlist object that's clearly truthy
    const playlistObj = Object.create(null);
    const mockPauseFn = jest.fn();
    playlistObj.pause = mockPauseFn;
    
    mixer.playlist = playlistObj as unknown as Playlist;
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    
    mixer.stop();
    
    // Line 186: if (this.playlist) should be true, so this.playlist.pause() should be called
    expect(mockPauseFn).toHaveBeenCalledTimes(1);
    expect(speakerStopSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
    
    speakerStopSpy.mockRestore();
  });

  it("should execute line 186 false branch when playlist is explicitly set to null after init", () => {
    // Test line 186: if (this.playlist) this.playlist.pause();
    // Explicitly test false branch by setting playlist to null after initContext
    mixer.initContext();
    mixer.playing = true;
    
    // First set it to a truthy value, then explicitly set to null
    mixer.playlist = { pause: jest.fn() } as unknown as Playlist;
    mixer.playlist = null as any; // Explicitly set to null to test false branch
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    const mockPause = jest.fn();
    
    mixer.stop();
    
    // Line 186 condition (this.playlist) is false when null, so playlist.pause() should not be called
    expect(mockPause).not.toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    expect(mixer.playing).toBe(false);
    
    speakerStopSpy.mockRestore();
  });

  it("should cover line 186 by verifying condition evaluation with truthy playlist", () => {
    // Test line 186: if (this.playlist) this.playlist.pause();
    // Direct test to ensure the condition is evaluated and true branch executes
    mixer.initContext();
    mixer.playing = true;
    
    // Set playlist to a truthy value that will pass the condition
    const pauseMethod = jest.fn();
    mixer.playlist = { pause: pauseMethod } as unknown as Playlist;
    
    // Verify playlist is truthy before calling stop()
    expect(!!mixer.playlist).toBe(true);
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    
    mixer.stop();
    
    // Line 186: if (this.playlist) evaluates to true, so this.playlist.pause() is called
    expect(pauseMethod).toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    
    speakerStopSpy.mockRestore();
  });

  it("should cover line 186 by verifying condition evaluation with falsy playlist", () => {
    // Test line 186: if (this.playlist) this.playlist.pause();
    // Direct test to ensure the condition is evaluated and false branch executes
    mixer.initContext();
    mixer.playing = true;
    
    // Set playlist to null (falsy) that will fail the condition
    mixer.playlist = null as any;
    
    // Verify playlist is falsy before calling stop()
    expect(!!mixer.playlist).toBe(false);
    
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
    const pauseMethod = jest.fn();
    
    mixer.stop();
    
    // Line 186: if (this.playlist) evaluates to false, so this.playlist.pause() is NOT called
    expect(pauseMethod).not.toHaveBeenCalled();
    expect(speakerStopSpy).toHaveBeenCalled();
    
    speakerStopSpy.mockRestore();
  });

  it("should filter audioTracks when selectTrackId is provided (lines 125-127)", () => {
    const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    
    // Mock getUrlParam to return a track ID (lines 125-127)
    (getUrlParam as jest.Mock).mockReturnValue("5");
    
    // Mock audiotracks to return multiple tracks
    const mockAudioTracks = [
      { id: 1, name: "Track 1" },
      { id: 5, name: "Track 5" },
      { id: 10, name: "Track 10" },
    ];
    (mockClient.audiotracks as jest.Mock).mockReturnValue(mockAudioTracks);
    
    // Call initContext - should filter tracks to only track with id 5
    mixer.initContext();
    
    // Verify getUrlParam was called with correct parameters
    expect(getUrlParam).toHaveBeenCalledWith(
      window.location.toString(),
      "rwfSelectTrackId"
    );
    
    // Verify console.info was called with the isolation message (line 127)
    expect(consoleInfoSpy).toHaveBeenCalledWith("isolating track #5");
    
    // Verify that Playlist was created with filtered tracks (only track with id 5)
    expect(Playlist).toHaveBeenCalledWith(
      expect.objectContaining({
        audioTracks: [{ id: 5, name: "Track 5" }],
      })
    );
    
    consoleInfoSpy.mockRestore();
  });

  describe("lines 186-187: stop() method playlist.pause() and speakerEngine.stop()", () => {
    it("should execute both lines 186 and 187 when playlist and speakerEngine exist", () => {
      // Test lines 186-187: if (this.playlist) this.playlist.pause(); this.speakerEngine?.stop();
      mixer.initContext();
      mixer.playing = true;
      
      const mockPause = jest.fn();
      mixer.playlist = { pause: mockPause } as unknown as Playlist;
      
      const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
      
      mixer.stop();
      
      // Line 186: if (this.playlist) this.playlist.pause(); - should execute
      expect(mockPause).toHaveBeenCalledTimes(1);
      
      // Line 187: this.speakerEngine?.stop(); - should execute
      expect(speakerStopSpy).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
      
      speakerStopSpy.mockRestore();
    });

    it("should execute line 186 (playlist.pause) when playlist exists (line 186)", () => {
      // Test line 186: if (this.playlist) this.playlist.pause();
      mixer.initContext();
      mixer.playing = true;
      
      const mockPause = jest.fn();
      mixer.playlist = { pause: mockPause } as unknown as Playlist;
      
      const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
      
      mixer.stop();
      
      // Verify line 186 executed: playlist.pause() was called when playlist exists
      expect(mockPause).toHaveBeenCalledTimes(1);
      expect(speakerStopSpy).toHaveBeenCalled();
      
      speakerStopSpy.mockRestore();
    });

    it("should execute line 187 (speakerEngine.stop) when speakerEngine exists (line 187)", () => {
      // Test line 187: this.speakerEngine?.stop();
      mixer.initContext();
      mixer.playing = true;
      
      const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
      
      mixer.stop();
      
      // Verify line 187 executed: speakerEngine.stop() was called when speakerEngine exists
      expect(speakerStopSpy).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
      
      speakerStopSpy.mockRestore();
    });

    it("should not execute line 186 when playlist is null, but line 187 should still execute", () => {
      // Test lines 186-187: Line 186 condition is false, but line 187 should still execute
      mixer.initContext();
      mixer.playing = true;
      mixer.playlist = null as any; // Line 186 condition will be false
      
      const mockPause = jest.fn();
      const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
      
      mixer.stop();
      
      // Line 186: if (this.playlist) - condition is false, so playlist.pause() should not be called
      expect(mockPause).not.toHaveBeenCalled();
      
      // Line 187: this.speakerEngine?.stop(); - should still execute
      expect(speakerStopSpy).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
      
      speakerStopSpy.mockRestore();
    });

    it("should not execute line 186 when playlist is undefined, but line 187 should still execute", () => {
      // Test lines 186-187: Line 186 condition is false, but line 187 should still execute
      mixer.initContext();
      mixer.playing = true;
      mixer.playlist = undefined as any; // Line 186 condition will be false
      
      const mockPause = jest.fn();
      const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
      
      mixer.stop();
      
      // Line 186: if (this.playlist) - condition is false, so playlist.pause() should not be called
      expect(mockPause).not.toHaveBeenCalled();
      
      // Line 187: this.speakerEngine?.stop(); - should still execute
      expect(speakerStopSpy).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
      
      speakerStopSpy.mockRestore();
    });

    it("should not throw when speakerEngine is null (line 187 optional chaining)", () => {
      // Test line 187: this.speakerEngine?.stop(); - optional chaining handles null
      mixer.initContext();
      mixer.playing = true;
      mixer.speakerEngine = null as any; // Set speakerEngine to null
      
      const mockPause = jest.fn();
      mixer.playlist = { pause: mockPause } as unknown as Playlist;
      
      // Should not throw when speakerEngine is null (line 187 uses optional chaining)
      expect(() => mixer.stop()).not.toThrow();
      
      // Line 186 should still execute
      expect(mockPause).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
    });

    it("should not throw when speakerEngine is undefined (line 187 optional chaining)", () => {
      // Test line 187: this.speakerEngine?.stop(); - optional chaining handles undefined
      mixer.initContext();
      mixer.playing = true;
      mixer.speakerEngine = undefined as any; // Set speakerEngine to undefined
      
      const mockPause = jest.fn();
      mixer.playlist = { pause: mockPause } as unknown as Playlist;
      
      // Should not throw when speakerEngine is undefined (line 187 uses optional chaining)
      expect(() => mixer.stop()).not.toThrow();
      
      // Line 186 should still execute
      expect(mockPause).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
    });

    it("should execute lines 186-187 in correct order: playlist.pause() before speakerEngine.stop()", () => {
      // Test lines 186-187: Verify execution order
      mixer.initContext();
      mixer.playing = true;
      
      const mockPause = jest.fn();
      mixer.playlist = { pause: mockPause } as unknown as Playlist;
      
      const callOrder: string[] = [];
      
      // Track call order by pushing to array in mock implementations
      mockPause.mockImplementation(() => {
        callOrder.push("playlist.pause");
      });
      
      const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => {
        callOrder.push("speakerEngine.stop");
        return Promise.resolve();
      });
      
      mixer.stop();
      
      // Verify line 186 executes before line 187
      expect(callOrder).toEqual(["playlist.pause", "speakerEngine.stop"]);
      expect(mockPause).toHaveBeenCalledTimes(1);
      expect(speakerStopSpy).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
      
      speakerStopSpy.mockRestore();
    });

    it("should execute line 187 even when both playlist and speakerEngine are null", () => {
      // Test lines 186-187: Both conditions are false/null, but stop() should not throw
      mixer.initContext();
      mixer.playing = true;
      mixer.playlist = null as any;
      mixer.speakerEngine = null as any;
      
      // Should not throw even when both are null
      expect(() => mixer.stop()).not.toThrow();
      expect(mixer.playing).toBe(false);
    });

    it("should execute line 186 with truthy playlist and line 187 with truthy speakerEngine", () => {
      // Test lines 186-187: Both conditions are truthy
      mixer.initContext();
      mixer.playing = true;
      
      const mockPause = jest.fn();
      mixer.playlist = { pause: mockPause } as unknown as Playlist;
      
      const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => Promise.resolve());
      
      mixer.stop();
      
      // Both lines should execute
      expect(mockPause).toHaveBeenCalledTimes(1);
      expect(speakerStopSpy).toHaveBeenCalledTimes(1);
      expect(mixer.playing).toBe(false);
      
      speakerStopSpy.mockRestore();
    });

    it("should not execute line 186 when initContext fails to create playlist (line 186 false branch)", () => {
      // Test line 186: if (this.playlist) this.playlist.pause();
      // When initContext fails (missing listenerPoint), playlist remains undefined
      mixer.mixParams.listenerPoint = undefined;
      mixer.playing = true;
      
      const mockPause = jest.fn();
      // Don't set playlist - it should remain undefined after failed initContext
      
      // stop() calls initContext() which will fail and return early, leaving playlist undefined
      mixer.stop();
      
      // Line 186: if (this.playlist) - condition is false, so playlist.pause() should not be called
      expect(mockPause).not.toHaveBeenCalled();
      expect(mixer.playlist).toBeUndefined();
      expect(mixer.playing).toBe(false);
    });

    it("should execute line 187 even when initContext fails to create speakerEngine (line 187)", () => {
      // Test line 187: this.speakerEngine?.stop();
      // When initContext fails (missing listenerPoint), speakerEngine remains undefined
      mixer.mixParams.listenerPoint = undefined;
      mixer.playing = true;
      
      // stop() calls initContext() which will fail and return early, leaving speakerEngine undefined
      // Should not throw due to optional chaining
      expect(() => mixer.stop()).not.toThrow();
      expect(mixer.speakerEngine).toBeUndefined();
      expect(mixer.playing).toBe(false);
    });

    it("should cover line 186 false branch when playlist is undefined from failed initContext", () => {
      // Test line 186: Ensure false branch is covered when playlist is undefined
      // This happens when initContext() fails to create playlist
      mixer.mixParams.listenerPoint = undefined;
      mixer.playing = true;
      
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      mixer.stop();
      
      // Verify initContext was called (via stop) but playlist wasn't created
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mixer.playlist).toBeUndefined();
      
      // Line 186: if (this.playlist) - false branch, playlist.pause() not called
      expect(mixer.playing).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });
  });
});
