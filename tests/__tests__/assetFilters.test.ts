import {
  roundwareDefaultFilterChain,
  dateRangeFilter,
} from "../../src/assetFilters";
import { assetDecorationMapper } from "../../src/assetPool";
import { ASSET_PRIORITIES, GeoListenMode } from "../../src/roundware";
import { coordsToPoints } from "../../src/utils";
import {
  MOCK_DECORATED_ASSET_DATA,
  MOCK_FULL_ASSETDATA,
  MOCK_TIMED_ASSET_DATA,
} from "../__mocks__/mock_api_responses";
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

  describe("#dateRangeFilter", () => {
    const dateFilter = dateRangeFilter();

    const mockStartDate = new Date(
      "Fri Aug 06 2021 13:46:00 GMT+0530 (India Standard Time)"
    );
    const decoratedAssets = MOCK_FULL_ASSETDATA.map(
      assetDecorationMapper(MOCK_TIMED_ASSET_DATA)
    );

    test("should discard assets older than start date", () => {
      expect.assertions(MOCK_FULL_ASSETDATA.length);
      const newAssets = decoratedAssets.map((asset) => {
        const priority = dateFilter(asset, {
          startDate: mockStartDate,
        });
        if (asset.created < mockStartDate) {
          expect(priority).toBe(ASSET_PRIORITIES.DISCARD);
        } else expect(priority).toBe(ASSET_PRIORITIES.NORMAL);
      });
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
