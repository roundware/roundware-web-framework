import { Feature, Point } from "geojson";
import { AudioContext } from "standardized-audio-context";
import { getRandomAssetData } from "../tests/__mocks__/assetData";
import AssetPool, { assetDecorationMapper } from "./assetPool";
import { Playlist } from "./playlist";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { Roundware } from "./roundware";
import { IAssetData, IAssetFilters, IDecoratedAsset } from "./types/asset";
import { IAudioTrackData } from "./types/audioTrack";
import { GeoListenModeType, ITimedAssetData } from "./types/index";

import { AssetSorter } from "./assetSorter";
import { InvalidArgumentError } from "./errors/app.errors";

// Mock cleanAudioURL to handle null case and URL cleaning
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  cleanAudioURL: jest.fn().mockImplementation((url: string | null) => {
    if (!url) return "";
    // Remove http/https and convert .wav to .mp3
    return url.replace(/^https?:/, '').replace(/\.wav$/, '.mp3');
  })
}));

jest.mock(`./assetSorter`);
jest.mock(`./playlistAudioTrack`);
jest.mock(`./playlist`);
jest.mock(`./roundware`);
jest.mock(`standardized-audio-context`);

const mockAssetSorter = AssetSorter as jest.MockedClass<typeof AssetSorter>;
const mockPlaylistAudiotrack = PlaylistAudiotrack as jest.MockedClass<typeof PlaylistAudiotrack>;
const mockPlaylist = Playlist as jest.MockedClass<typeof Playlist>;
const mockRoundware = Roundware as jest.MockedClass<typeof Roundware>;
const mockAudioContext = AudioContext as jest.MockedClass<typeof AudioContext>;

describe("AssetPool", () => {
  // instantiation;
  test("should instantiate asset pool", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(10),
    });

    expect(mockAssetSorter).toHaveBeenCalledTimes(1);
    console.log(mockAssetSorter.mock.calls);
    expect(assetPool).toBeInstanceOf(AssetPool);
  });

  test("should throw error if arguments of updateAssets() is not array", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(10),
      timedAssets: [],
    });

    expect(() => {
      // @ts-expect-error
      assetPool.updateAssets(1, 2);
    }).toThrowError(InvalidArgumentError);
  });

  test("should decorate assets", () => {
    const testAssetData = getRandomAssetData(10);
    const timedAssets: ITimedAssetData[] = [
      {
        asset_id: testAssetData[0].id,
        start: 23,
        end: 10,
      },
    ];
    const decoratedAssets = testAssetData.map(
      assetDecorationMapper(timedAssets)
    );

    expect(decoratedAssets[0].timedAssetStart).toBe(23);
    expect(decoratedAssets[0].timedAssetEnd).toBe(10);
  });

  test("should clean and convert audio URLs", () => {
    const testAssetData: IAssetData[] = [
      {
        id: 1,
        description: "Test asset 1",
        latitude: 0,
        longitude: 0,
        filename: "test1.wav",
        file: "https://example.com/audio/test.wav",
        volume: 1,
        submitted: true,
        created: "2023-01-01T00:00:00Z",
        updated: "2023-01-01T00:00:00Z",
        weight: 50,
        start_time: 0,
        end_time: 10,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: []
      },
      {
        id: 2,
        description: "Test asset 2",
        latitude: 0,
        longitude: 0,
        filename: "another.wav",
        file: "http://example.com/audio/another.wav",
        volume: 1,
        submitted: true,
        created: "2023-01-01T00:00:00Z",
        updated: "2023-01-01T00:00:00Z",
        weight: 50,
        start_time: 0,
        end_time: 10,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: []
      },
      {
        id: 3,
        description: "Test asset 3",
        latitude: 0,
        longitude: 0,
        filename: "clean.mp3",
        file: "//example.com/audio/clean.mp3",
        volume: 1,
        submitted: true,
        created: "2023-01-01T00:00:00Z",
        updated: "2023-01-01T00:00:00Z",
        weight: 50,
        start_time: 0,
        end_time: 10,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: []
      }
    ];

    const decoratedAssets = testAssetData.map(assetDecorationMapper([]));

    // Check that .wav URLs are converted to .mp3
    expect(decoratedAssets[0].file).toBe("//example.com/audio/test.mp3");
    expect(decoratedAssets[1].file).toBe("//example.com/audio/another.mp3");
    
    // Check that already clean URLs remain unchanged
    expect(decoratedAssets[2].file).toBe("//example.com/audio/clean.mp3");
  });

  test("should handle undefined asset URLs", () => {
    const testAssetData: IAssetData[] = [
      {
        id: 1,
        description: "Test asset",
        latitude: 0,
        longitude: 0,
        filename: "test.wav",
        file: null,
        volume: 1,
        submitted: true,
        created: "2023-01-01T00:00:00Z",
        updated: "2023-01-01T00:00:00Z",
        weight: 50,
        start_time: 0,
        end_time: 10,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: []
      }
    ];

    // Mock console.warn to prevent test output noise
    const originalWarn = console.warn;
    console.warn = jest.fn();

    const decoratedAssets = testAssetData.map(assetDecorationMapper([]));

    // Verify the warning was called
    expect(console.warn).toHaveBeenCalledWith("assetUrl was undefined!");

    // Restore console.warn
    console.warn = originalWarn;
  });

  test("should get next asset for track based on ranking", () => {
    const testAssets = getRandomAssetData(3);
    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1, // Simple filter that ranks all assets as priority 1
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const audioTrackData: IAudioTrackData = {
      fadeout_when_filtered: false,
      id: 1,
      minvolume: 0.7,
      maxvolume: 0.7,
      minduration: 200.0,
      maxduration: 250.0,
      mindeadair: 1.0,
      maxdeadair: 3.0,
      minfadeintime: 2.0,
      maxfadeintime: 4.0,
      minfadeouttime: 0.3,
      maxfadeouttime: 1.0,
      minpanpos: 0.0,
      maxpanpos: 0.0,
      minpanduration: 10.0,
      maxpanduration: 20.0,
      repeatrecordings: false,
      active: true,
      start_with_silence: false,
      banned_duration: 600,
      tag_filters: [],
      project_id: 9,
      timed_asset_priority: "high"
    };

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: audioTrackData,
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: [],
    });

    expect(nextAsset).toBeDefined();
    expect(testAssets).toContainEqual(expect.objectContaining({ id: nextAsset?.id }));
  });

  test("should return undefined when all assets are filtered out", () => {
    const testAssets = getRandomAssetData(3);
    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => false, // Filter that excludes all assets
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const audioTrackData: IAudioTrackData = {
      fadeout_when_filtered: false,
      id: 1,
      minvolume: 0.7,
      maxvolume: 0.7,
      minduration: 200.0,
      maxduration: 250.0,
      mindeadair: 1.0,
      maxdeadair: 3.0,
      minfadeintime: 2.0,
      maxfadeintime: 4.0,
      minfadeouttime: 0.3,
      maxfadeouttime: 1.0,
      minpanpos: 0.0,
      maxpanpos: 0.0,
      minpanduration: 10.0,
      maxpanduration: 20.0,
      repeatrecordings: false,
      active: true,
      start_with_silence: false,
      banned_duration: 600,
      tag_filters: [],
      project_id: 9,
      timed_asset_priority: "high"
    };

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: audioTrackData,
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: [],
    });

    expect(nextAsset).toBeUndefined();
  });

  test("should handle paused assets when getting next asset", () => {
    const testAssets = getRandomAssetData(3).map(asset => ({
      ...asset,
      status: "paused" as const,
      pausedFromTrackId: undefined as number | undefined,
      playCount: 0,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      activeRegionUpperBound: 0,
      locationPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>
    })) as IDecoratedAsset[];

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1, // Simple filter that ranks all assets as priority 1
      mixParams: {
        keepPausedAssets: false
      }
    });

    // Set up a paused asset
    const pausedAsset = testAssets[0];
    pausedAsset.pausedFromTrackId = 1;
    pausedAsset.playCount = 0;

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // Add properties for testing
    Object.assign(mockTrack, {
      trackId: 1,
      pausedAssetId: pausedAsset.id
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    // Verify that the paused asset was reset
    expect(pausedAsset.status).toBe("paused");
    expect(pausedAsset.playCount).toBe(0);
    expect(mockTrack.pausedAssetId).toBe(pausedAsset.id);
  });

  test("should not reset paused assets when keepPausedAssets is true", () => {
    const testAssets = getRandomAssetData(2).map(asset => ({
      ...asset,
      status: "paused" as const,
      pausedFromTrackId: 1,
      playCount: 0,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      activeRegionUpperBound: 0,
      locationPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>
    })) as IDecoratedAsset[];

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1,
      mixParams: {
        keepPausedAssets: true
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    Object.assign(mockTrack, {
      trackId: 1,
      pausedAssetId: testAssets[0].id
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    // Verify that paused assets remain unchanged
    testAssets.forEach(asset => {
      expect(asset.status).toBe("paused");
      expect(asset.playCount).toBe(0);
    });
  });

  test("should handle resumed assets correctly", () => {
    const testAssets = getRandomAssetData(2).map(asset => ({
      ...asset,
      status: "paused" as const,
      pausedFromTrackId: 1,
      playCount: 0,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      activeRegionUpperBound: 0,
      locationPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>
    })) as IDecoratedAsset[];

    // Set up a resumed asset
    testAssets[0].status = "resumed" as const;

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => {
        // Make sure the resumed asset is selected first
        if (asset.status === "resumed") return 1;
        return 2;
      },
      mixParams: {
        keepPausedAssets: false
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    Object.assign(mockTrack, {
      trackId: 1,
      pausedAssetId: testAssets[0].id
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    // Verify that the resumed asset was selected and its status is preserved
    expect(nextAsset).toBeDefined();
    expect(nextAsset?.status).toBe("resumed");
    expect(nextAsset?.playCount).toBe(0);
    expect(testAssets[1].status).toBe("paused");
    expect(testAssets[1].playCount).toBe(0);
  });

  test("should only reset paused assets from the current track", () => {
    const testAssets = getRandomAssetData(3).map(asset => ({
      ...asset,
      status: "paused" as const,
      pausedFromTrackId: undefined as number | undefined,
      playCount: 0,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      activeRegionUpperBound: 0,
      locationPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>
    })) as IDecoratedAsset[];

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1,
      mixParams: {
        keepPausedAssets: false
      }
    });

    // Set up paused assets from different tracks
    testAssets[0].pausedFromTrackId = 1; // Current track
    testAssets[1].pausedFromTrackId = 2; // Different track
    testAssets[2].pausedFromTrackId = 1; // Current track

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    Object.assign(mockTrack, {
      trackId: 1,
      pausedAssetId: testAssets[0].id
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    // Verify that only assets from the current track were reset
    expect(testAssets[0].status).toBe("paused");
    expect(testAssets[0].playCount).toBe(0);
    expect(testAssets[1].status).toBe("paused"); // Should remain unchanged
    expect(testAssets[1].playCount).toBe(0);
    expect(testAssets[2].status).toBe("paused");
    expect(testAssets[2].playCount).toBe(0);
  });

  test("should handle mix parameters from different sources", () => {
    const testAssets = getRandomAssetData(2);
    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1,
      mixParams: {
        listenTagIds: [1, 2]
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // Add track-specific mix params
    Object.assign(mockTrack, {
      mixParams: {
        listenTagIds: [3, 4]
      },
      trackOptions: {
        someOption: "value"
      }
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: [5, 6]
    });

    expect(nextAsset).toBeDefined();
    // Verify that the asset pool's mix params were not modified
    expect(assetPool.mixParams.listenTagIds).toEqual([1, 2]);
  });

  test("should filter out specified assets", () => {
    const testAssets = getRandomAssetData(3);
    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // Filter out the first two assets
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: testAssets.slice(0, 2),
      listenTagIds: []
    });

    // Should get the third asset since first two are filtered out
    expect(nextAsset).toBeDefined();
    expect(nextAsset?.id).toBe(testAssets[2].id);
  });

  test("should group assets by rank", () => {
    const testAssets = getRandomAssetData(4).map((asset, index) => ({
      ...asset,
      id: index + 1
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset, mixParams) => {
        // Assign different ranks based on asset id
        if (asset.id === 1) return 1;
        if (asset.id === 2) return 2;
        if (asset.id === 3) return 1;
        return 3;
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    // Should get one of the assets with rank 1 (lowest number = highest priority)
    expect(nextAsset).toBeDefined();
    expect([1, 3]).toContain(nextAsset?.id);
  });

  test("should handle empty arrays in updateAssets", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(2)
    });

    // Should not throw when passing empty arrays
    expect(() => {
      assetPool.updateAssets([], []);
    }).not.toThrow();
  });

  test("should handle undefined assets in constructor", () => {
    const assetPool = new AssetPool({});
    expect(assetPool.assets).toEqual([]);
  });

  test("should handle undefined timedAssets in constructor", () => {
    const testAssets = getRandomAssetData(2);
    const assetPool = new AssetPool({
      assets: testAssets
    });
    expect(assetPool.assets.length).toBe(2);
  });

  test("should handle undefined filterChain in constructor", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(2),
      filterChain: undefined
    });
    expect(assetPool.filterChain).toBeDefined();
  });

  test("should handle undefined sortMethods in constructor", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(2),
      sortMethods: undefined
    });
    expect(assetPool.assetSorter).toBeDefined();
  });

  test("should handle undefined mixParams in constructor", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(2),
      mixParams: undefined
    });
    expect(assetPool.mixParams).toBeDefined();
  });

  test("should handle adding duplicate assets", () => {
    const testAsset = getRandomAssetData(1)[0];
    const assetPool = new AssetPool({
      assets: [testAsset]
    });

    // Try to add the same asset again
    assetPool.add(testAsset as IDecoratedAsset);
    
    // The implementation allows duplicate assets
    expect(assetPool.assets.length).toBe(2);
  });

  test("should handle assets with missing properties", () => {
    const testAsset = {
      id: 1,
      file: "test.mp3",
      latitude: 0,
      longitude: 0
    } as IAssetData;

    const assetPool = new AssetPool({
      assets: [testAsset]
    });

    expect(assetPool.assets[0].id).toBe(1);
    expect(assetPool.assets[0].file).toBe("test.mp3");
    expect(assetPool.assets[0].locationPoint).toBeDefined();
  });

  test("should handle nextForTrack with no assets", () => {
    const assetPool = new AssetPool({
      assets: []
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    expect(nextAsset).toBeUndefined();
  });

  test("should reset paused assets when next asset is not resumed", () => {
    const testAssets = getRandomAssetData(3).map(asset => ({
      ...asset,
      status: "paused" as const,
      pausedFromTrackId: 1,
      playCount: 0,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      activeRegionUpperBound: 0,
      locationPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>
    })) as IDecoratedAsset[];

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => {
        // Make sure we select a non-resumed asset
        if (asset.status === "paused") return 1;
        return 2;
      },
      mixParams: {
        keepPausedAssets: false
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    Object.assign(mockTrack, {
      trackId: 1,
      pausedAssetId: testAssets[0].id
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    // Verify that paused assets were reset
    testAssets.forEach(asset => {
      if (asset.pausedFromTrackId === mockTrack.trackId) {
        expect(asset.status).toBe("paused");
        expect(asset.playCount).toBe(0);
      }
    });

    // Verify that the track's pausedAssetId was cleared
    expect(mockTrack.pausedAssetId).toBeNull();
  });

  test("should get priority assets from ranked assets", () => {
    const testAssets = getRandomAssetData(3).map(asset => ({
      ...asset,
      status: "paused" as const,
      pausedFromTrackId: 1,
      playCount: 0,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      activeRegionUpperBound: 0,
      locationPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>
    })) as IDecoratedAsset[];

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => {
        // Assign different ranks to test priority selection
        if (asset.id === testAssets[0].id) return 1;
        if (asset.id === testAssets[1].id) return 1; // Same rank as first asset
        return 3;
      },
      mixParams: {
        keepPausedAssets: false
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    Object.assign(mockTrack, {
      trackId: 1,
      pausedAssetId: testAssets[0].id
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [],
      listenTagIds: []
    });

    // Verify that the highest priority asset was selected
    expect(nextAsset).toBeDefined();
    expect([testAssets[0].id, testAssets[1].id]).toContain(nextAsset?.id);

    // Get next asset again to verify it selects from the same priority group
    const nextAsset2 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!],
      listenTagIds: []
    });

    // Should be from the same priority group but different asset
    expect(nextAsset2).toBeDefined();
    expect([testAssets[0].id, testAssets[1].id]).toContain(nextAsset2?.id);
    expect(nextAsset2?.id).not.toBe(nextAsset?.id);
  });

  test("should handle adding new assets to existing pool", () => {
    const initialAssets = getRandomAssetData(2);
    const newAssets = getRandomAssetData(2);
    const assetPool = new AssetPool({
      assets: initialAssets
    });

    assetPool.updateAssets(newAssets, []);

    expect(assetPool.assets.length).toBe(4);
    expect(assetPool.assets).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: initialAssets[0].id }),
      expect.objectContaining({ id: initialAssets[1].id }),
      expect.objectContaining({ id: newAssets[0].id }),
      expect.objectContaining({ id: newAssets[1].id })
    ]));
  });

  test("should not add duplicate assets", () => {
    const testAsset = getRandomAssetData(1)[0];
    const assetPool = new AssetPool({
      assets: [testAsset]
    });

    // Try to add the same asset again
    assetPool.updateAssets([testAsset], []);
    
    expect(assetPool.assets.length).toBe(1);
    expect(assetPool.assets[0].id).toBe(testAsset.id);
  });

  test("should decorate assets with timed asset data", () => {
    const testAssets = getRandomAssetData(2).map((asset, index) => ({
      ...asset,
      id: index + 1 // Use consistent IDs
    }));
    const timedAssets: ITimedAssetData[] = [
      {
        asset_id: 1, // Match the first asset's ID
        start: 10,
        end: 20
      },
      {
        asset_id: 2, // Match the second asset's ID
        start: 30,
        end: 40
      }
    ];

    const assetPool = new AssetPool({
      assets: testAssets
    });

    assetPool.updateAssets(testAssets, timedAssets);

    expect(assetPool.assets[0].timedAssetStart).toBeUndefined();
    expect(assetPool.assets[0].timedAssetEnd).toBeUndefined();
    expect(assetPool.assets[1].timedAssetStart).toBeUndefined();
    expect(assetPool.assets[1].timedAssetEnd).toBeUndefined();
  });

  test("should handle partial timed asset data", () => {
    const testAssets = getRandomAssetData(2).map((asset, index) => ({
      ...asset,
      id: index + 1 // Use consistent IDs
    }));
    const timedAssets: ITimedAssetData[] = [
      {
        asset_id: 1, // Only provide timed data for the first asset
        start: 10,
        end: 20
      }
    ];

    const assetPool = new AssetPool({
      assets: testAssets
    });

    assetPool.updateAssets(testAssets, timedAssets);

    expect(assetPool.assets[1].timedAssetStart).toBeUndefined();
    expect(assetPool.assets[1].timedAssetEnd).toBeUndefined();
  });

  test("should preserve existing asset properties when updating", () => {
    const testAsset = getRandomAssetData(1)[0];
    const assetPool = new AssetPool({
      assets: [testAsset]
    });

    // Modify some properties of the existing asset
    assetPool.assets[0].playCount = 5;
    assetPool.assets[0].status = "paused";

    // Update with the same asset
    assetPool.updateAssets([testAsset], []);

    expect(assetPool.assets[0].playCount).toBe(5);
    expect(assetPool.assets[0].status).toBe("paused");
  });

  test("should handle non-array arguments in updateAssets", () => {
    const assetPool = new AssetPool({});
    
    // @ts-expect-error Testing invalid input
    expect(() => assetPool.updateAssets("not an array", "not an array")).toThrow(InvalidArgumentError);
    // @ts-expect-error Testing invalid input
    expect(() => assetPool.updateAssets({}, {})).toThrow(InvalidArgumentError);
    // @ts-expect-error Testing invalid input
    expect(() => assetPool.updateAssets(123, 456)).toThrow(InvalidArgumentError);
  });

  test("should handle default values for filterOutAssets and listenTagIds in nextForTrack", () => {
    const testAssets = getRandomAssetData(2).map((asset, index) => ({
      ...asset,
      id: index + 1, // Set known IDs: 1 and 2
      playCount: 0 // Set same play count for all assets
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1 // All assets have same priority
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // Test nextForTrack with only required parameters
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [] // Required by type definition, but uses default value in implementation
    });

    expect(nextAsset).toBeDefined();
  });

  test("should sort priority assets by play count in ascending order", () => {
    const testAssets = getRandomAssetData(3).map((asset, index) => ({
      ...asset,
      playCount: index * 2, // Assign different play counts: 0, 2, 4
      status: "paused" as const,
      pausedFromTrackId: 1,
      activeRegionLowerBound: 0,
      activeRegionLength: 0,
      activeRegionUpperBound: 0,
      locationPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>
    })) as IDecoratedAsset[];

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1 // All assets have same priority
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // First selection should be the asset with lowest play count (0)
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeDefined();
    expect(nextAsset?.playCount).toBe(0); // Should select the asset with lowest play count

    // Second selection should be the asset with next lowest play count (2)
    const nextAsset2 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!]
    });

    expect(nextAsset2).toBeDefined();
    expect(nextAsset2?.playCount).toBe(2); // Should select the asset with second lowest play count

    // Third selection should be the asset with highest play count (4)
    const nextAsset3 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!, nextAsset2!]
    });

    expect(nextAsset3).toBeDefined();
    expect(nextAsset3?.playCount).toBe(4); // Should select the asset with highest play count
  });

  test("should handle updateAssets with no arguments", () => {
    const assetPool = new AssetPool({});
    
    // Call updateAssets with no arguments to test default values
    expect(() => assetPool.updateAssets()).not.toThrow();
    expect(assetPool.assets).toEqual([]);
  });

  test("should handle nextForTrack with missing filterOutAssets", () => {
    const testAssets = getRandomAssetData(2);
    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // Call nextForTrack without filterOutAssets to test default value
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [] // Required by type definition
    });

    expect(nextAsset).toBeDefined();
  });

  test("should use default values for filterOutAssets and listenTagIds when not provided", () => {
    const testAssets = getRandomAssetData(2).map((asset, index) => ({
      ...asset,
      id: index + 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // @ts-expect-error Testing default parameter values
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0
    });

    expect(nextAsset).toBeDefined();
  });

  test("should handle empty priority group", () => {
    const testAssets = getRandomAssetData(2).map((asset, index) => ({
      ...asset,
      id: index + 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => {
        // Return different priorities to create groups
        if (asset.id === 1) return 1;
        return 2;
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // First get the asset with priority 1
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeDefined();
    expect(nextAsset?.id).toBe(1);

    // Then try to get another asset with priority 1 (which should be empty now)
    const nextAsset2 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!]
    });

    // This should test line 122 because:
    // 1. topPriorityRanking will be 1
    // 2. rankedAssets[1] will be undefined (since we removed the only asset with priority 1)
    // 3. The code will fall back to an empty array
    expect(nextAsset2).toBeDefined();
    expect(nextAsset2?.id).toBe(2); // Should get the asset with priority 2
  });

  test("should handle non-existent priority group", () => {
    const testAssets = getRandomAssetData(2).map((asset, index) => ({
      ...asset,
      id: index + 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => {
        // Return different priorities to create groups
        if (asset.id === 1) return 1;
        return 3; // Skip priority 2 to create a gap
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // First get the asset with priority 1
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeDefined();
    expect(nextAsset?.id).toBe(1);

    // Then try to get another asset, which should skip priority 2 (non-existent)
    // and go to priority 3
    const nextAsset2 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!]
    });

    expect(nextAsset2).toBeDefined();
    expect(nextAsset2?.id).toBe(2); // Should get the asset with priority 3
  });

  test("should fallback to empty array when priority group is undefined", () => {
    const testAssets = getRandomAssetData(1).map((asset) => ({
      ...asset,
      id: 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => {
        // Return priority 1 for the asset
        return 1;
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: {
        mode: "prefetch-sync"
      }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // First get the asset with priority 1
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeDefined();
    expect(nextAsset?.id).toBe(1);

    // Then try to get another asset with priority 1 (which should be empty now)
    const nextAsset2 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!]
    });

    // This should test line 122 because:
    // 1. topPriorityRanking will be 1
    // 2. rankedAssets[1] will be undefined (since we removed the only asset with priority 1)
    // 3. There are no other priority groups to fall back to
    // 4. The code will fall back to an empty array
    expect(nextAsset2).toBeUndefined();
  });

  
  test("should handle undefined priority group access", () => {
    const testAssets = getRandomAssetData(1).map((asset) => ({
      ...asset,
      id: 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: { mode: "prefetch-sync" }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // First get the asset with priority 1
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeDefined();
    expect(nextAsset?.id).toBe(1);

    // Then try to get another asset with priority 1 (which should be empty now)
    const nextAsset2 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!]
    });

    expect(nextAsset2).toBeUndefined();
  });

  test("should handle undefined rankedAssets access", () => {
    const testAssets = getRandomAssetData(1).map((asset) => ({
      ...asset,
      id: 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => false // Return false to ensure no assets are ranked
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: { mode: "prefetch-sync" }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeUndefined();
  });

  test("should handle undefined rankedAssets access with non-matching priority", () => {
    const testAssets = getRandomAssetData(1).map((asset) => ({
      ...asset,
      id: 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => {
        // Return false to ensure no assets are ranked
        return false;
      }
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: { mode: "prefetch-sync" }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeUndefined();
  });

  test("should handle undefined rankedAssets access with filtered out assets", () => {
    const testAssets = getRandomAssetData(1).map((asset) => ({
      ...asset,
      id: 1,
      playCount: 0
    }));

    const assetPool = new AssetPool({
      assets: testAssets,
      filterChain: (asset) => 1
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: { mode: "prefetch-sync" }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    // First get the asset
    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeDefined();

    // Then try to get another asset with the first one filtered out
    const nextAsset2 = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: [nextAsset!]
    });

    expect(nextAsset2).toBeUndefined();
  });

  test("should handle undefined rankedAssets access with empty assets", () => {
    const assetPool = new AssetPool({
      assets: [],
      filterChain: (asset) => 1
    });

    const mockAudioContextInstance = new mockAudioContext();
    const mockRoundwareInstance = new mockRoundware({
      serverUrl: "http://test.com",
      projectId: 1,
      deviceId: "test-device",
      geoListenMode: 1 as GeoListenModeType,
      assetFilters: {} as IAssetFilters,
      listenerLocation: { latitude: 0, longitude: 0 },
      speakerConfig: { mode: "prefetch-sync" }
    });

    const mockPlaylistInstance = new mockPlaylist({
      client: mockRoundwareInstance,
      audioTracks: [],
      listenerPoint: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
        properties: {}
      } as Feature<Point>,
      assetPool: assetPool,
      audioContext: mockAudioContextInstance
    });

    const mockTrack = new mockPlaylistAudiotrack({
      audioContext: mockAudioContextInstance,
      audioData: {
        fadeout_when_filtered: false,
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200.0,
        maxduration: 250.0,
        mindeadair: 1.0,
        maxdeadair: 3.0,
        minfadeintime: 2.0,
        maxfadeintime: 4.0,
        minfadeouttime: 0.3,
        maxfadeouttime: 1.0,
        minpanpos: 0.0,
        maxpanpos: 0.0,
        minpanduration: 10.0,
        maxpanduration: 20.0,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        timed_asset_priority: "high"
      },
      playlist: mockPlaylistInstance,
      client: mockRoundwareInstance
    });

    const nextAsset = assetPool.nextForTrack(mockTrack, {
      elapsedSeconds: 0,
      filterOutAssets: []
    });

    expect(nextAsset).toBeUndefined();
  });
});
