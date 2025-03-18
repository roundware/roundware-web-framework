import { Mixer } from "./mixer";
import { Roundware, AssetPriorityType } from "./roundware";
import { Playlist } from "./playlist";
import { SpeakerEngine } from "./speaker/speaker_engine";
import { buildAudioContext, coordsToPoints } from "./utils";
import { AssetPool } from "./assetPool";
import { IMixParams, Coordinates } from "./types";

jest.mock("./playlist");
jest.mock("./speaker/speaker_engine");
jest.mock("./utils");
jest.mock("./assetPool");
jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => {});
jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => {});

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
  
    const speakerPlaySpy = jest.spyOn(SpeakerEngine.prototype, "play").mockImplementation(() => {});
  
    mixer.play();
  
    expect(mockClient.events!.logEvent).toHaveBeenCalledWith("play_stream");
    expect(mockPlay).toHaveBeenCalled();
    expect(speakerPlaySpy).toHaveBeenCalled();
  
    speakerPlaySpy.mockRestore();
  });

  it("should test speakerEngine.stop directly", () => {
    const speakerStopSpy = jest.spyOn(SpeakerEngine.prototype, "stop").mockImplementation(() => {});
  
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
});
