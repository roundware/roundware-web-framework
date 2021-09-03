import {
  anyAssetFilter,
  distanceFixedFilter,
  roundwareDefaultFilterChain,
} from "../../src/assetFilters";
import { GeoListenMode } from "../../src/roundware";
import { IMixParams } from "../../src/types";
import { IDecoratedAsset } from "../../src/types/asset";
import { coordsToPoints } from "../../src/utils";
import { MOCK_DECORATED_ASSET_DATA } from "../__mocks__/mock_api_responses";
describe("assetFilters", () => {
  // test("#anyAssetFilter", () => {
  //   anyAssetFilter();
  // });

  describe("#roundwareDefaultFilterChain", () => {
    MOCK_DECORATED_ASSET_DATA.forEach((asset) => {
      const priority = roundwareDefaultFilterChain(asset, {
        getListenMode: GeoListenMode.MANUAL,

        listenerPoint: coordsToPoints({
          latitude: 40.7683525085449,
          longitude: -73.9643249511719,
        }),
        recordingRadius: 134,
        maxDist: 134.02141359705166,
      });
      console.log(priority);
    });
  });

  // describe("#distanceFixedFilter", () => {
  //   test("#distanceFixedFilter", () => {
  //     const filter = distanceFixedFilter();
  //     // @ts-ignore
  //     const MOCK_ASSET: IDecoratedAsset = {
  //       locationPoint: coordsToPoints({
  //         latitude: 40,
  //         longitude: 20,
  //       }),
  //     };

  //     const MOCK_MIX_PARAM: IMixParams = {
  //       listenerPoint: coordsToPoints({
  //         latitude: 20,
  //         longitude: 10,
  //       }),
  //       recordingRadius: 3000,
  //     };

  //     const priority = filter(MOCK_ASSET, MOCK_MIX_PARAM);

  //     expect(priority).toBe(false);
  //   });
  // });
});
