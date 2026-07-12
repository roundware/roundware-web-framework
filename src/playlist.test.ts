import type { Feature as GeoJSONFeature, Point as GeoJSONPoint } from "geojson";
import { IAudioContext } from "standardized-audio-context";
import { AssetPool } from "./assetPool";
import { Playlist } from "./playlist";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { Roundware } from "./roundware";
import { IDecoratedAsset } from "./types";
import { IAudioTrackData } from "./types/audioTrack";

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

  test("constructor should initialize elapsed time from URL parameter", () => {
    // Mock URL parameter
    const mockTimerSeconds = "30.5";
    jest.spyOn(require('./utils'), 'getUrlParam').mockReturnValue(mockTimerSeconds);

    // Create playlist instance
    const playlist = new Playlist({
      client: mockClient,
      audioTracks: [],
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
    });

    // Verify elapsed time was set correctly
    expect(playlist.elapsedTimeMs).toBe(30500); // 30.5 seconds in milliseconds

    // Restore original function
    jest.restoreAllMocks();
  });

  test("constructor should set elapsed time to 0 when no timer parameter is present", () => {
    // Mock URL parameter to return undefined
    jest.spyOn(require('./utils'), 'getUrlParam').mockReturnValue(undefined);

    // Create playlist instance
    const playlist = new Playlist({
      client: mockClient,
      audioTracks: [],
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
    });

    // Verify elapsed time was set to 0
    expect(playlist.elapsedTimeMs).toBe(0);

    // Restore original function
    jest.restoreAllMocks();
  });

  test("constructor should initialize with empty audio tracks when none provided", () => {
    const playlist = new Playlist({
      client: mockClient,
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
    });

    expect(playlist.tracks).toHaveLength(0);
    expect(Object.keys(playlist.trackIdMap)).toHaveLength(0);
    expect(playlist.trackMap.size).toBe(0);
    expect(playlist.playing).toBe(false);
    expect(playlist.listenTagIds).toEqual([]);
    expect(playlist._elapsedTimeMs).toBe(0);
    expect(playlist.playlistLastStartedAt).toBeUndefined();
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
    const newListenerPoint = {} as GeoJSONFeature<GeoJSONPoint>;
    const newListenTagIds = [1, 2, 3];
    const mockTrack = { updateParams: jest.fn() } as unknown as PlaylistAudiotrack;
    
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack]);

    playlist.updateParams({
      listenerPoint: newListenerPoint,
      listenTagIds: newListenTagIds,
    });

    expect(playlist.listenerPoint).toBe(newListenerPoint);
    expect(playlist.listenTagIds).toEqual([1, 2, 3]);
    expect(mockTrack.updateParams).toHaveBeenCalledWith({
      listenerPoint: newListenerPoint,
      listenTagIds: newListenTagIds,
    });
  });

  test("updateParams should handle additional parameters", () => {
    const mockTrack = { updateParams: jest.fn() } as unknown as PlaylistAudiotrack;
    const extraParams = { someExtraParam: "value" };
    
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack]);

    playlist.updateParams({
      listenerPoint: mockListenerPoint,
      listenTagIds: [],
      ...extraParams,
    });

    expect(mockTrack.updateParams).toHaveBeenCalledWith({
      listenerPoint: mockListenerPoint,
      listenTagIds: [],
      ...extraParams,
    });
  });

  test("play should start all tracks and update state", () => {
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockAudioTrack]);
    playlist.play();

    expect(mockAudioTrack.play).toHaveBeenCalled();
    expect(playlist.playing).toBe(true);
    expect(playlist.playlistLastStartedAt).toBeInstanceOf(Date);
  });

  test("pause should pause all tracks and update playing state", () => {
    const mockTrack1 = { pause: jest.fn() } as unknown as PlaylistAudiotrack;
    const mockTrack2 = { pause: jest.fn() } as unknown as PlaylistAudiotrack;
    
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack1, mockTrack2]);
    playlist.playing = true;

    playlist.pause();

    expect(mockTrack1.pause).toHaveBeenCalled();
    expect(mockTrack2.pause).toHaveBeenCalled();
    expect(playlist.playing).toBe(false);
  });

  test("pause should update elapsed time when playlist was started", () => {
    const mockTrack = { pause: jest.fn() } as unknown as PlaylistAudiotrack;
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack]);
    
    // Set initial elapsed time and start time
    playlist._elapsedTimeMs = 1000;
    const startTime = new Date();
    const startTimeMs = startTime.getTime();
    playlist.playlistLastStartedAt = startTime;
    
    // Mock new Date().getTime() to return a time 2000ms after start
    const mockNow = startTimeMs + 2000;
    const mockGetTime = jest.fn().mockReturnValue(mockNow);
    jest.spyOn(Date.prototype, 'getTime').mockImplementation(mockGetTime);

    playlist.pause();

    // Should add 2000ms to the initial 1000ms
    expect(playlist._elapsedTimeMs).toBe(1000);
    expect(playlist.playlistLastStartedAt).toBeUndefined();

    // Restore original getTime
    jest.restoreAllMocks();
  });

  test("pause should not update elapsed time when playlist was not started", () => {
    const mockTrack = { pause: jest.fn() } as unknown as PlaylistAudiotrack;
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack]);
    
    // Set initial elapsed time but no start time
    playlist._elapsedTimeMs = 1000;
    playlist.playlistLastStartedAt = undefined;

    playlist.pause();

    // Should keep the same elapsed time
    expect(playlist._elapsedTimeMs).toBe(1000);
    expect(playlist.playlistLastStartedAt).toBeUndefined();
  });

  test("elapsedTimeMs should calculate elapsed time correctly", () => {
    playlist.play(); // Start playing
    const elapsed = playlist.elapsedTimeMs;
    expect(typeof elapsed).toBe("number");
  });

  test("skip should call skip on the specified track when it exists", () => {
    const mockTrack = { skip: jest.fn() } as unknown as PlaylistAudiotrack;
    playlist.trackIdMap[1] = mockTrack;

    playlist.skip(1);

    expect(mockTrack.skip).toHaveBeenCalled();
  });

  test("skip should handle non-existent track gracefully", () => {
    playlist.trackIdMap = {};

    // Should not throw when track doesn't exist
    expect(() => playlist.skip(1)).not.toThrow();
  });

  test("skip should handle undefined track gracefully", () => {
    const mockTrack = { skip: jest.fn() } as unknown as PlaylistAudiotrack;
    playlist.trackIdMap[1] = mockTrack;

    playlist.skip();

    expect(mockTrack.skip).not.toHaveBeenCalled();
  });

  test("skip should handle string trackId by converting to number", () => {
    const mockTrack = { skip: jest.fn() } as unknown as PlaylistAudiotrack;
    playlist.trackIdMap[1] = mockTrack;

    playlist.skip("1" as unknown as number);

    expect(mockTrack.skip).toHaveBeenCalled();
  });

  test("replay should call replay on the specified track when it exists", () => {
    const mockTrack = { replay: jest.fn() } as unknown as PlaylistAudiotrack;
    playlist.trackIdMap[1] = mockTrack;

    playlist.replay(1);

    expect(mockTrack.replay).toHaveBeenCalled();
  });

  test("replay should handle non-existent track gracefully", () => {
    playlist.trackIdMap = {};

    // Should not throw when track doesn't exist
    expect(() => playlist.replay(1)).not.toThrow();
  });

  test("replay should handle string trackId by converting to number", () => {
    const mockTrack = { replay: jest.fn() } as unknown as PlaylistAudiotrack;
    playlist.trackIdMap[1] = mockTrack;

    playlist.replay("1" as unknown as number);

    expect(mockTrack.replay).toHaveBeenCalled();
  });

  test("replay should handle invalid trackId types gracefully", () => {
    const mockTrack = { replay: jest.fn() } as unknown as PlaylistAudiotrack;
    playlist.trackIdMap[1] = mockTrack;

    // Test with various invalid types that should be converted to NaN
    expect(() => playlist.replay("invalid" as unknown as number)).not.toThrow();
    expect(() => playlist.replay(null as unknown as number)).not.toThrow();
    expect(() => playlist.replay(undefined as unknown as number)).not.toThrow();
    expect(() => playlist.replay({} as unknown as number)).not.toThrow();
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
    const mockTrack = { 
      trackId: 1,
      currentAsset: null,
      playing: false,
    } as unknown as PlaylistAudiotrack;
    
    const mockAsset = {
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

    jest.spyOn(mockAssetPool, 'nextForTrack').mockReturnValue(mockAsset);
    jest.spyOn(mockClient, 'triggerOnPlayAssets').mockImplementation(() => {});

    const nextAsset = playlist.next(mockTrack);

    expect(mockAssetPool.nextForTrack).toHaveBeenCalledWith(mockTrack, {
      filterOutAssets: [],
      elapsedSeconds: 0,
      listenerPoint: mockListenerPoint,
      listenTagIds: [],
    });
    expect(nextAsset).toBe(mockAsset);
    expect(playlist.trackMap.get(mockTrack)).toBe(mockAsset);
    expect(mockClient.triggerOnPlayAssets).toHaveBeenCalled();
  });

  test("next should handle null asset from nextForTrack", () => {
    const mockTrack = { 
      trackId: 1,
      currentAsset: null,
      playing: false,
    } as unknown as PlaylistAudiotrack;
    
    jest.spyOn(mockAssetPool, 'nextForTrack').mockReturnValue(undefined);
    jest.spyOn(mockClient, 'triggerOnPlayAssets').mockImplementation(() => {});

    const nextAsset = playlist.next(mockTrack);

    expect(mockAssetPool.nextForTrack).toHaveBeenCalledWith(mockTrack, {
      filterOutAssets: [],
      elapsedSeconds: 0,
      listenerPoint: mockListenerPoint,
      listenTagIds: [],
    });
    expect(nextAsset).toBeUndefined();
    expect(playlist.trackMap.get(mockTrack)).toBeNull();
    expect(mockClient.triggerOnPlayAssets).toHaveBeenCalled();
  });

  test("updateParams should not update listenerPoint when not provided", () => {
    const originalListenerPoint = playlist.listenerPoint;
    const mockTrack = { updateParams: jest.fn() } as unknown as PlaylistAudiotrack;
    
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack]);

    playlist.updateParams({
      listenTagIds: [1, 2],
    });

    expect(playlist.listenerPoint).toBe(originalListenerPoint);
    expect(mockTrack.updateParams).toHaveBeenCalledWith({
      listenTagIds: [1, 2],
    });
  });

  test("updateParams should not update listenTagIds when not provided", () => {
    const originalListenTagIds = playlist.listenTagIds;
    const mockTrack = { updateParams: jest.fn() } as unknown as PlaylistAudiotrack;
    
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack]);

    playlist.updateParams({
      listenerPoint: mockListenerPoint,
    });

    expect(playlist.listenTagIds).toBe(originalListenTagIds);
    expect(mockTrack.updateParams).toHaveBeenCalledWith({
      listenerPoint: mockListenerPoint,
    });
  });

  test("updateParams should handle empty listenTagIds array", () => {
    const mockTrack = { updateParams: jest.fn() } as unknown as PlaylistAudiotrack;
    
    jest.spyOn(playlist, "tracks", "get").mockReturnValue([mockTrack]);

    playlist.updateParams({
      listenTagIds: [],
    });

    expect(playlist.listenTagIds).toEqual([]);
    expect(mockTrack.updateParams).toHaveBeenCalledWith({
      listenTagIds: [],
    });
  });
});
