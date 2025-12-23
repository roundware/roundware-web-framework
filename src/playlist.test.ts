import type { Feature as GeoJSONFeature, Point as GeoJSONPoint } from "geojson";
import { IAudioContext } from "standardized-audio-context";
import { AssetPool } from "./assetPool";
import { Playlist } from "./playlist";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { Roundware } from "./roundware";
import { IDecoratedAsset, IMixParams } from "./types";
import { IAudioTrackData } from "./types/audioTrack";
import { getUrlParam } from "./utils";

jest.mock("./utils");

// Mock dependencies
const mockClient = {
  triggerOnPlayAssets: jest.fn(),
  events: {
    logAssetStart: jest.fn(),
    logAssetEnd: jest.fn(),
  },
} as unknown as Roundware;

const mockAudioContext = {
  createMediaElementSource: jest.fn((mediaElement: HTMLMediaElement) => ({
    connect: jest.fn().mockReturnThis(),
  })),
  createGain: jest.fn(() => ({
    gain: { value: 1 },
    connect: jest.fn().mockReturnThis(),
  })),
  createStereoPanner: jest.fn(() => ({
    pan: {
      value: 0,
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn().mockReturnThis(),
  })),
  destination: {},
  state: "running",
  resume: jest.fn().mockResolvedValue(undefined),
} as unknown as IAudioContext;

const mockAssetPool = {
  nextForTrack: jest.fn(),
} as unknown as AssetPool;

const mockListenerPoint = {} as GeoJSONFeature<GeoJSONPoint>;

const mockAudioTrack = {
  play: jest.fn(),
  pause: jest.fn(),
  updateParams: jest.fn(),
  skip: jest.fn(),
  replay: jest.fn(),
  currentAsset: null,
  playing: false,
  trackId: 1,
  audioData: {
    id: 1,
    timed_asset_priority: "",
    tag_filters: [],
    minpanpos: 0,
    active: true,
    start_with_silence: false,
    banned_duration: 0,
    project_id: 1,
    minfadeintime: 0,
    maxfadeintime: 10,
    minfadeouttime: 0,
    maxfadeouttime: 10,
    fadeout_when_filtered: false,
    minvolume: 0,
    maxvolume: 1,
    minduration: 0,
    maxduration: 100,
    mindeadair: 0,
    maxdeadair: 10,
    repeatrecordings: false,
    maxpanpos: 0,
    minpanduration: 10,
    maxpanduration: 20,
  },
} as unknown as PlaylistAudiotrack;

const mockDecoratedAsset = {
  id: 1,
  activeRegionLowerBound: 0,
  locationPoint: {} as GeoJSONFeature<GeoJSONPoint>,
  playCount: 0,
  activeRegionLength: 0,
  activeRegionUpperBound: 0,
  description: "",
  latitude: 0,
  longitude: 0,
  filename: "",
  file: null,
  volume: 0,
  submitted: false,
  created: "",
  updated: "",
  weight: 0,
  start_time: 0,
  end_time: 0,
  media_type: "",
  audio_length_in_seconds: 0,
  tag_ids: [],
  session_id: 0,
  language_id: 0,
  envelope_ids: [],
  description_loc_ids: [],
  alt_text_loc_ids: [],
} as IDecoratedAsset;

describe("Playlist", () => {
  let playlist: Playlist;

  beforeEach(() => {
    playlist = new Playlist({
      client: mockClient,
      audioTracks: [],
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
    });
  });

  test("constructor should create PlaylistAudiotrack objects and populate track maps", () => {
    // Mock audio track data
    const mockAudioData1: IAudioTrackData = {
      fadeout_when_filtered: false,
      id: 1,
      minvolume: 0.5,
      maxvolume: 1.0,
      minduration: 30,
      maxduration: 300,
      mindeadair: 0,
      maxdeadair: 10,
      minfadeintime: 2,
      maxfadeintime: 5,
      minfadeouttime: 2,
      maxfadeouttime: 5,
      minpanpos: -1,
      maxpanpos: 1,
      minpanduration: 5,
      maxpanduration: 10,
      repeatrecordings: true,
      active: true,
      start_with_silence: false,
      banned_duration: 0,
      tag_filters: [],
      project_id: 123,
      timed_asset_priority: "normal",
    };

    const mockAudioData2: IAudioTrackData = {
      fadeout_when_filtered: true,
      id: 2,
      minvolume: 0.3,
      maxvolume: 0.8,
      minduration: 20,
      maxduration: 200,
      mindeadair: 5,
      maxdeadair: 15,
      minfadeintime: 1,
      maxfadeintime: 3,
      minfadeouttime: 1,
      maxfadeouttime: 3,
      minpanpos: -0.5,
      maxpanpos: 0.5,
      minpanduration: 3,
      maxpanduration: 8,
      repeatrecordings: false,
      active: false,
      start_with_silence: true,
      banned_duration: 10,
      tag_filters: [],
      project_id: 456,
      timed_asset_priority: "high",
    };

    const audioTracks: IAudioTrackData[] = [mockAudioData1, mockAudioData2];

    // Mock required constructor parameters
    const mockClient = {} as Roundware;
    const mockListenerPoint = {} as GeoJSONFeature<GeoJSONPoint>;
    const mockAssetPool = {} as AssetPool;

    const mockAudioContext = {
      createMediaElementSource: jest.fn((mediaElement: HTMLMediaElement) => ({
        connect: jest.fn().mockReturnThis(), // Enables chaining
      })),
      createGain: jest.fn(() => ({
        gain: { value: 1 },
        connect: jest.fn().mockReturnThis(), // Enables chaining
      })),
      createStereoPanner: jest.fn(() => {
        return {
          pan: {
            value: 0, 
            setValueAtTime: jest.fn(),
            linearRampToValueAtTime: jest.fn(), // Ensure this method is available
          },
          connect: jest.fn().mockReturnThis(), // Enables chaining
        };
      }),
      destination: {}, // Mock audioContext.destination
    } as unknown as IAudioContext;

    // Create the Playlist instance
    playlist = new Playlist({
      client: mockClient,
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
      audioTracks,
    });

    // Validate that trackIdMap is populated correctly
    expect(Object.keys(playlist.trackIdMap)).toHaveLength(2);
    expect(playlist.trackIdMap[1]).toBeInstanceOf(PlaylistAudiotrack);
    expect(playlist.trackIdMap[2]).toBeInstanceOf(PlaylistAudiotrack);

    // Validate that trackMap is populated correctly
    expect(playlist.trackMap.size).toBe(2);
    audioTracks.forEach((audioData) => {
      const track = playlist.trackIdMap[audioData.id];
      expect(track).toBeInstanceOf(PlaylistAudiotrack);
      expect(playlist.trackMap.get(track!)).toBe(null);
    });
  });


  test("tracks getter should return all tracks", () => {
    expect(Array.isArray(playlist.tracks)).toBe(true);
    expect(playlist.tracks).toHaveLength(0); // No tracks initialized
  });

  test("currentlyPlayingAssets getter should return assets of currently playing tracks", () => {
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockAudioTrack]);

    const mockDecoratedAsset: IDecoratedAsset = {
      id: 1,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      locationPoint: {} as GeoJSONFeature<GeoJSONPoint>,
      playCount: 0,
      activeRegionUpperBound: 0,
      description: "",
      latitude: 0,
      longitude: 0,
      filename: "",
      file: null,
      volume: 0,
      submitted: false,
      created: "",
      updated: "",
      weight: 0,
      start_time: 0,
      end_time: 0,
      media_type: "",
      audio_length_in_seconds: 0,
      tag_ids: [],
      session_id: 0,
      language_id: 0,
      envelope_ids: [],
      description_loc_ids: [],
      alt_text_loc_ids: []
    };

    mockAudioTrack.currentAsset = mockDecoratedAsset; // Use a fully mocked asset
    mockAudioTrack.playing = true;

    expect(playlist.currentlyPlayingAssets).toEqual([mockDecoratedAsset]);
  });

  test("updateParams should update listenerPoint and listenTagIds", () => {
    const newParams: IMixParams = {
      listenerPoint: {} as GeoJSONFeature<GeoJSONPoint>,
      listenTagIds: [1, 2],
    };

    playlist.updateParams(newParams);
    expect(playlist.listenerPoint).toBe(newParams.listenerPoint);
    expect(playlist.listenTagIds).toEqual([1, 2]);
  });

  test("updateParams should not update listenerPoint when falsy (line 90)", () => {
    const originalListenerPoint = playlist.listenerPoint;
    const newParams: IMixParams = {
      listenerPoint: undefined,
      listenTagIds: [1, 2],
    };

    playlist.updateParams(newParams);
    // listenerPoint should remain unchanged when falsy
    expect(playlist.listenerPoint).toBe(originalListenerPoint);
  });

  test("updateParams should not update listenTagIds when falsy (lines 91-93)", () => {
    playlist.listenTagIds = [5, 6]; // Set initial value
    const newParams: IMixParams = {
      listenerPoint: {} as GeoJSONFeature<GeoJSONPoint>,
      listenTagIds: undefined,
    };

    playlist.updateParams(newParams);
    // listenTagIds should remain unchanged when falsy
    expect(playlist.listenTagIds).toEqual([5, 6]);
  });

  test("play should start all tracks and update state", () => {
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockAudioTrack]);
    playlist.play();

    expect(mockAudioTrack.play).toHaveBeenCalled();
    expect(playlist.playing).toBe(true);
    expect(playlist.playlistLastStartedAt).toBeInstanceOf(Date);
  });

  test("pause should stop all tracks and update state", () => {
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockAudioTrack]);
    playlist.play(); // Start playing
    playlist.pause();

    expect(mockAudioTrack.pause).toHaveBeenCalled();
    expect(playlist.playing).toBe(false);
    expect(playlist.playlistLastStartedAt).toBeUndefined();
  });

  test("pause should not update elapsed time when not playing (line 119)", () => {
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockAudioTrack]);
    // Set initial elapsed time
    (playlist as any)._elapsedTimeMs = 1000;
    playlist.playlistLastStartedAt = undefined; // Not playing
    
    playlist.pause();

    expect(mockAudioTrack.pause).toHaveBeenCalled();
    expect(playlist.playing).toBe(false);
    // elapsedTimeMs should remain unchanged when playlistLastStartedAt is undefined
    expect((playlist as any)._elapsedTimeMs).toBe(1000);
    expect(playlist.playlistLastStartedAt).toBeUndefined();
  });

  test("elapsedTimeMs should calculate elapsed time correctly", () => {
    playlist.play(); // Start playing
    const elapsed = playlist.elapsedTimeMs;
    expect(typeof elapsed).toBe("number");
  });

  test("skip should skip the specified track", () => {
    playlist.trackIdMap[1] = mockAudioTrack;
    playlist.skip(1);

    expect(mockAudioTrack.skip).toHaveBeenCalled();
  });

  test("skip should not throw when trackId is undefined (line 106-109)", () => {
    const freshMockTrack = {
      skip: jest.fn(),
    } as unknown as PlaylistAudiotrack;
    
    playlist.trackIdMap = {};
    // Should not throw when trackId is undefined
    expect(() => playlist.skip(undefined)).not.toThrow();
    expect(freshMockTrack.skip).not.toHaveBeenCalled();
  });

  test("skip should not throw when track does not exist (line 106-109)", () => {
    const freshMockTrack = {
      skip: jest.fn(),
    } as unknown as PlaylistAudiotrack;
    
    playlist.trackIdMap = {};
    // Should not throw when track doesn't exist
    expect(() => playlist.skip(999)).not.toThrow();
    expect(freshMockTrack.skip).not.toHaveBeenCalled();
  });

  test("replay should replay the specified track", () => {
    playlist.trackIdMap[1] = mockAudioTrack;
    playlist.replay(1);

    expect(mockAudioTrack.replay).toHaveBeenCalled();
  });

  test("replay should not throw when track does not exist (line 111-114)", () => {
    const freshMockTrack = {
      replay: jest.fn(),
    } as unknown as PlaylistAudiotrack;
    
    playlist.trackIdMap = {};
    // Should not throw when track doesn't exist
    expect(() => playlist.replay(999)).not.toThrow();
    expect(freshMockTrack.replay).not.toHaveBeenCalled();
  });

  test("updateParams should call updateParams for all tracks without overwriting properties", () => {
    const mockTrack = { updateParams: jest.fn() } as unknown as PlaylistAudiotrack;
    const tracks = [mockTrack, mockTrack];
    const mockParams = {
      listenerPoint: {} as GeoJSONFeature<GeoJSONPoint>,
      listenTagIds: [1, 2],
      extraParam: "example", // Additional parameter for testing spread
    };

    const playlist = new Playlist({
      client: {} as Roundware,
      listenerPoint: {} as GeoJSONFeature<GeoJSONPoint>,
      assetPool: {} as AssetPool,
      audioContext: {} as IAudioContext,
      audioTracks: [],
    });

    jest.spyOn(playlist, "tracks", "get").mockReturnValue(tracks);

    const { listenerPoint: _, ...otherParams } = mockParams;
    playlist.updateParams({ listenerPoint: mockParams.listenerPoint, ...otherParams });

    tracks.forEach((track) => {
      expect(track.updateParams).toHaveBeenCalledWith({
        listenerPoint: mockParams.listenerPoint,
        listenTagIds: mockParams.listenTagIds,
        extraParam: "example",
      });
    });
  });

  test("next should get the next asset for a track", () => {
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockAudioTrack]);

    const mockDecoratedAsset: IDecoratedAsset = {
      id: 2,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      locationPoint: {} as GeoJSONFeature<GeoJSONPoint>,
      playCount: 0,
      activeRegionUpperBound: 0,
      description: "",
      latitude: 0,
      longitude: 0,
      filename: "",
      file: null,
      volume: 0,
      submitted: false,
      created: "",
      updated: "",
      weight: 0,
      start_time: 0,
      end_time: 0,
      media_type: "",
      audio_length_in_seconds: 0,
      tag_ids: [],
      session_id: 0,
      language_id: 0,
      envelope_ids: [],
      description_loc_ids: [],
      alt_text_loc_ids: []
    };

    (mockAssetPool.nextForTrack as jest.Mock).mockReturnValue(mockDecoratedAsset);  
    const nextAsset = playlist.next(mockAudioTrack);

    expect(mockAssetPool.nextForTrack).toHaveBeenCalled();
    expect(nextAsset).toEqual(mockDecoratedAsset);
    expect(playlist.trackMap.get(mockAudioTrack)).toEqual(mockDecoratedAsset);
    expect(mockClient.triggerOnPlayAssets).toHaveBeenCalled(); // Ensure it's called
  });

  test("should initialize elapsed time from URL parameter rwfTimerSeconds (lines 54-56)", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const timerSeconds = "5.5";
    
    // Mock getUrlParam to return the timer value
    (getUrlParam as jest.Mock).mockReturnValue(timerSeconds);
    
    // Create a new Playlist instance
    const testPlaylist = new Playlist({
      client: mockClient,
      audioTracks: [],
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
    });
    
    // Verify getUrlParam was called with correct parameters
    expect(getUrlParam).toHaveBeenCalledWith(
      window.location.toString(),
      "rwfTimerSeconds"
    );
    
    // Verify elapsed time is set correctly (5.5 seconds * 1000 = 5500 ms)
    // Access private property for testing
    expect((testPlaylist as any)._elapsedTimeMs).toBe(5500);
    
    // Verify console.log was called with the correct message (line 56)
    expect(consoleLogSpy).toHaveBeenCalledWith("Setting playlist timer to 5.5s");
    
    consoleLogSpy.mockRestore();
  });

  test("should use default empty array for audioTracks when not provided (line 26)", () => {
    // Mock getUrlParam to return null so timer logic doesn't interfere
    (getUrlParam as jest.Mock).mockReturnValue(null);
    
    // Create Playlist without providing audioTracks to use default value
    const testPlaylist = new Playlist({
      client: mockClient,
      // audioTracks is omitted to test default parameter value
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
    });
    
    // Verify that tracks array is empty (default value was used)
    expect(testPlaylist.tracks).toHaveLength(0);
    expect(Object.keys(testPlaylist.trackIdMap)).toHaveLength(0);
    expect(testPlaylist.trackMap.size).toBe(0);
  });

  test("should set trackMap to null when nextAsset is null/undefined (line 155)", () => {
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockAudioTrack]);
    
    // Mock nextForTrack to return null to test the || null branch
    (mockAssetPool.nextForTrack as jest.Mock).mockReturnValue(null);
    
    const nextAsset = playlist.next(mockAudioTrack);
    
    // Verify nextForTrack was called
    expect(mockAssetPool.nextForTrack).toHaveBeenCalled();
    
    // Verify nextAsset is null
    expect(nextAsset).toBeNull();
    
    // Verify trackMap is set to null (line 155: nextAsset || null)
    expect(playlist.trackMap.get(mockAudioTrack)).toBeNull();
    
    // Verify triggerOnPlayAssets was still called
    expect(mockClient.triggerOnPlayAssets).toHaveBeenCalled();
  });
});
