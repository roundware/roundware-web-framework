import AssetPool, { assetDecorationMapper } from "./assetPool";
import { ITimedAssetData, GeoListenModeType } from "./types/index";
import { getRandomAssetData } from "../tests/__mocks__/assetData";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { AudioContext } from "standardized-audio-context";
import { Playlist } from "./playlist";
import { Roundware } from "./roundware";
import { IAudioTrackData } from "./types/audioTrack";
import { Feature, Point } from "geojson";
import { IAssetFilters, IDecoratedAsset } from "./types/asset";

import { AssetSorter } from "./assetSorter";
import { InvalidArgumentError } from "./errors/app.errors";
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

    // Set up the next asset to be resumed
    const resumedAsset = testAssets[1];
    resumedAsset.status = "resumed" as const;

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
  });
});
