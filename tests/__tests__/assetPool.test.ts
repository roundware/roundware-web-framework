import { AssetPool } from "../../src/assetPool";
import { GeoListenMode } from "../../src/roundware";
import { coordsToPoints } from "../../src/utils";
import {
  MOCK_ASSET_DATA,
  MOCK_FULL_ASSETDATA,
  MOCK_TIMED_ASSET_DATA,
} from "../__mocks__/mock_api_responses";

describe("assetPool", () => {
  const MOCK_MIX_PARAM = {
    getListenMode: GeoListenMode.MANUAL,

    listenerPoint: coordsToPoints({
      latitude: 40.7683525085449,
      longitude: -73.9643249511719,
    }),
    recordingRadius: 134,
    maxDist: 134.02141359705166,
  };
  const assetPool = new AssetPool({
    assets: MOCK_FULL_ASSETDATA,
    timedAssets: MOCK_TIMED_ASSET_DATA,
    mixParams: MOCK_MIX_PARAM,
  });
  describe("#nextForTrack", () => {
    test("MANHATTAN LOCATION ", () => {
      const nextAsset = assetPool.nextForTrack(
        // @ts-ignore
        {
          mixParams: MOCK_MIX_PARAM,
        },
        {
          // elapsedSeconds: 0,
          // filterOutAssets: [],
          listenerPoint: MOCK_MIX_PARAM.listenerPoint,
          // deviceId: "kMuWJ7PDqYB3ej3Z0gT4g",
          //   speakerFilters: {
          //     activeyn: true,
          //   },
          //   assetFilters: {
          //     submitted: true,
          //     media_type: "audio",
          //   },
          timedAssetPriority: "discard",
          listenTagIds: [91, 92, 218, 281, 282],

          ...MOCK_MIX_PARAM,
        }
      );

      console.log(nextAsset);
      expect(nextAsset).not.toBeFalsy();
    });
  });
});
