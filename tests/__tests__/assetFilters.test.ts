import { rankForGeofilteringEligibility } from "../../src/assetFilters";
import { assetDecorationMapper } from "../../src/assetPool";
import {
  ASSET_PRIORITIES,
  calculateDistanceInMeters,
  distanceFixedFilter,
  GeoListenMode,
} from "../../src/roundware";
import { getRandomAssetData } from "../__mocks__/assetData";
import { point } from "@turf/helpers";
import { faker } from "@faker-js/faker";
import { IDecoratedAsset } from "../../src/types/asset";
import {
  InvalidArgumentError,
  RoundwareFrameworkError,
} from "../../src/errors/app.errors";
describe("rankForGeofilteringEligibility", () => {
  test("should return false if geo listen mode is disabled", () => {
    expect(
      rankForGeofilteringEligibility(
        getRandomAssetData(1).map(assetDecorationMapper([]))[0],
        {
          geoListenMode: GeoListenMode.DISABLED,
        }
      )
    ).toBe(false);
  });

  test("should false if asset is undefined", () => {
    expect(
      rankForGeofilteringEligibility(undefined, {
        geoListenMode: GeoListenMode.AUTOMATIC,
        listenerPoint: point([
          +faker.address.latitude(),
          +faker.address.longitude(),
        ]),
      })
    ).toBe(false);
  });

  test("should should return true if asset and geo listen mode not disabled and wiith listener point", () => {
    expect(
      rankForGeofilteringEligibility(
        getRandomAssetData(1).map(assetDecorationMapper([]))[0],
        {
          geoListenMode: GeoListenMode.AUTOMATIC,
          listenerPoint: point([
            +faker.address.latitude(),
            +faker.address.longitude(),
          ]),
        }
      )
    ).toBe(true);
  });

  test("should return false listenerPoint is not passed", () => {
    expect(
      rankForGeofilteringEligibility(
        getRandomAssetData(1).map(assetDecorationMapper([]))[0],
        {
          geoListenMode: GeoListenMode.AUTOMATIC,
        }
      )
    ).toBe(false);
  });

  test("should return false if asset location is not passed", () => {
    const testAsset = getRandomAssetData(1).map(assetDecorationMapper([]))[0];
    // @ts-expect-error
    delete testAsset.locationPoint;
    expect(
      rankForGeofilteringEligibility(testAsset, {
        geoListenMode: GeoListenMode.AUTOMATIC,
        listenerPoint: point([
          +faker.address.latitude(),
          +faker.address.longitude(),
        ]),
      })
    ).toBe(false);
  });
});

describe("calculateDistanceInMeters()", () => {
  test("should return correct approximate correct in meters", () => {
    expect(
      +calculateDistanceInMeters(point([0, 1]), point([0, 2])).toFixed(0)
    ).toEqual(111195);
  });
});

describe("distanceFixedFilter()", () => {
  const testAsset = getRandomAssetData(1, true)[0] as IDecoratedAsset;

  test("should be lowest if GeoListenMode is disabled", () => {
    expect(
      distanceFixedFilter()(testAsset, {
        geoListenMode: GeoListenMode.DISABLED,
      })
    ).toEqual(ASSET_PRIORITIES.LOWEST);
  });

  test("should return neutral when not eligible for geo filtering", () => {
    expect(
      distanceFixedFilter()(testAsset, {
        geoListenMode: GeoListenMode.AUTOMATIC,
      })
    ).toEqual(ASSET_PRIORITIES.NEUTRAL);
  });

  test("testAsset has location point", () => {
    expect(testAsset.locationPoint).not.toBeFalsy();
  });

  test("should throw error if recording radius is not there", () => {
    expect.assertions(2);
    try {
      distanceFixedFilter()(testAsset, {
        geoListenMode: GeoListenMode.AUTOMATIC,
        listenerPoint: (getRandomAssetData(1, true)[0] as IDecoratedAsset)
          .locationPoint,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(RoundwareFrameworkError);
      expect(e.message).toEqual(
        'Expected argument "recordingRadius" to be "number" while distanceFixedFilter'
      );
    }
  });
});
