import { SpeakerTrack } from "./speaker_track";

import { SpeakerPrefetchPlayer } from "./players/prefetch";
import { SpeakerConfig } from "../types/roundware";
import { AudioContext } from "standardized-audio-context-mock";
import { LineString, Point } from "geojson";
import { polygon } from "@turf/helpers";

// Fake the SpeakerPrefetchPlayer so that SpeakerTrack selects it based on config.mode
jest.mock("./players/prefetch", () => {
  return {
    SpeakerPrefetchPlayer: class {
      audio = {
        addEventListener: jest.fn((event, cb) => {
          /* no-op */
        }),
      };
      isSafeToPlay = true;
      fade = jest.fn();
      fadeOutAndPause = jest.fn();
      play = jest.fn().mockResolvedValue(true);
      pause = jest.fn();
      constructor({ audioContext, id, uri, config }: any) {}
    },
  };
});

describe("SpeakerTrack", () => {
  let speakerData: any;
  let config: any;
  let fakeAudioContext = new AudioContext();
  let fakeSpeakerEngine: any;
  let outerBoundaryLineString: LineString;
  let attenuationBorderLineString: LineString;

  beforeEach(() => {
    // Define a square outer boundary: a polygon representing a square
    outerBoundaryLineString = {
      type: "LineString",
      coordinates: [
        [0, 0],
        [0, 10],
        [10, 10],
        [10, 0],
        [0, 0],
      ],
    };

    // Define a smaller square for the attenuation border
    attenuationBorderLineString = {
      type: "LineString",
      coordinates: [
        [2, 2],
        [2, 8],
        [8, 8],
        [8, 2],
        [2, 2],
      ],
    };

    speakerData = {
      id: 1,
      maxvolume: 1,
      minvolume: 0,
      attenuation_border: attenuationBorderLineString,
      boundary: outerBoundaryLineString,
      attenuation_distance: 1000, // in meters; conversion to km happens in the constructor
      uri: "test-uri",
      shape: polygon([
        [
          [0, 0],
          [0, 10],
          [10, 10],
          [10, 0],
          [0, 0],
        ],
      ]),
    };

    config = { mode: "prefetch" };
    fakeAudioContext = new AudioContext();
    fakeSpeakerEngine = { playing: true };
  });

  test("outerBoundaryContains returns true for a point inside the outer boundary", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    const point: [number, number] = [5, 5];
    expect(speaker.outerBoundaryContains(point)).toBe(true);
  });

  test("outerBoundaryContains returns false for a point outside the outer boundary", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    const point: [number, number] = [15, 15];
    expect(speaker.outerBoundaryContains(point)).toBe(false);
  });

  test("attenuationShapeContains returns true for a point inside the attenuation border", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    const point: [number, number] = [5, 5];
    expect(speaker.attenuationShapeContains(point)).toBe(true);
  });

  test("volumeByLocation returns calculatedVolume if no listener point is provided", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    speaker.calculatedVolume = 0.3;
    expect(speaker.volumeByLocation(null as any)).toBe(0.3);
  });

  test("volumeByLocation returns maxVolume when the listener is inside the attenuation zone", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    const listenerPoint: Point = { type: "Point", coordinates: [5, 5] };
    expect(speaker.volumeByLocation(listenerPoint)).toBe(speaker.maxVolume);
  });

  test("volumeByLocation returns minVolume when the listener is outside the outer boundary", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    const listenerPoint: Point = { type: "Point", coordinates: [15, 15] };
    expect(speaker.volumeByLocation(listenerPoint)).toBe(speaker.minVolume);
  });

  test("updateVolume calls fadeOutAndPause when calculatedVolume is nearly zero", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    speaker.calculatedVolume = 0.04;
    speaker.player.fadeOutAndPause = jest.fn();
    speaker.player.play = jest.fn();
    speaker.updateVolume();
    expect(speaker.player.fadeOutAndPause).toHaveBeenCalled();
    expect(speaker.player.play).not.toHaveBeenCalled();
  });

  test("updateVolume calls play and fade when calculatedVolume is above threshold", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    speaker.calculatedVolume = 0.5;
    speaker.player.fade = jest.fn();
    speaker.player.play = jest.fn();
    speaker.updateVolume();
    expect(speaker.player.play).toHaveBeenCalled();
    expect(speaker.player.fade).toHaveBeenCalledWith(0.5);
  });

  test("play retries playing if initial play call is unsuccessful", async () => {
    jest.useFakeTimers();
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    speaker.calculatedVolume = 0.7;
    const playMock = jest
      .spyOn(speaker.player, "play")
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true);

    // Capture the promise from play()
    const playPromise = speaker.play();
    // Fast-forward time to trigger any scheduled async operations
    jest.advanceTimersByTime(5000);
    await playPromise; // wait for all scheduled async operations
    expect(playMock).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test("pause calls the player's pause method", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    speaker.player.pause = jest.fn();
    speaker.pause();
    expect(speaker.player.pause).toHaveBeenCalled();
  });

  test("constructor sets basic properties from data", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.speakerId).toBe(speakerData.id);
    expect(speaker.maxVolume).toBe(speakerData.maxvolume);
    expect(speaker.minVolume).toBe(speakerData.minvolume);
    expect(speaker.attenuationDistanceKm).toBe(
      speakerData.attenuation_distance / 1000
    );
    expect(speaker.uri).toBe(speakerData.uri);
  });

  test("constructor sets attenuation border properties when provided", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.attenuationBorderLineString).toBe(
      speakerData.attenuation_border
    );
    // Check that the polygon was created by verifying it exists and has type property
    expect(speaker.attenuationBorderPolygon).toBeDefined();
    expect(speaker.attenuationBorderPolygon?.geometry.type).toMatch(
      /Polygon|MultiPolygon/
    );
  });

  test("constructor sets outer boundary when provided", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.outerBoundary).toBeDefined();
    expect(speaker.outerBoundary?.geometry.type).toMatch(
      /Polygon|MultiPolygon/
    );
  });

  test("constructor creates the appropriate player instance based on config.mode", () => {
    // For config.mode "prefetch", SpeakerPrefetchPlayer should be used (and is mocked)
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    // Check that the player instance has the expected properties defined in mock
    expect(speaker.player).toBeDefined();
    expect(speaker.player).toHaveProperty("audio");
    expect(typeof speaker.player.play).toBe("function");
  });

  test("constructor registers a 'playing' event listener on the player's audio", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config,
      speakerEngine: fakeSpeakerEngine,
    });
    // Check that addEventListener is called with "playing"
    expect(speaker.player.audio.addEventListener).toHaveBeenCalledWith(
      "playing",
      expect.any(Function)
    );
  });

  test("constructor uses SpeakerPrefetchPlayer when config.mode is 'prefetch'", () => {
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config: { mode: "prefetch" },
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.player).toBeInstanceOf(SpeakerPrefetchPlayer);
  });

  test("constructor selects SpeakerProgressiveSyncPlayer when config.mode starts with 'prefetch-sync'", () => {
    const localConfig = {
      mode: "progressive-sync-basePlusMax5Random",
    } as SpeakerConfig;
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config: localConfig,
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.player.constructor.name).toBe(
      "SpeakerProgressiveSyncPlayer"
    );
  });

  test("constructor selects SpeakerSyncStreamer when config.mode starts with 'stream-sync'", () => {
    const localConfig = { mode: "stream-sync" } as SpeakerConfig;
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config: localConfig,
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.player.constructor.name).toBe("SpeakerSyncStreamer");
  });

  test("constructor selects SpeakerPrefetchPlayer when config.mode starts with 'prefetch'", () => {
    const localConfig = { mode: "prefetch" } as SpeakerConfig;
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config: localConfig,
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.player.constructor.name).toBe("SpeakerPrefetchPlayer");
  });

  test("constructor selects SpeakerStreamer when config.mode does not match other prefixes", () => {
    const localConfig = { mode: "stream" } as SpeakerConfig;
    const speaker = new SpeakerTrack({
      audioContext: fakeAudioContext,
      data: speakerData,
      config: localConfig,
      speakerEngine: fakeSpeakerEngine,
    });
    expect(speaker.player.constructor.name).toBe("SpeakerStreamer");
  });
});
