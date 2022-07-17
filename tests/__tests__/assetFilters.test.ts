import { rankForGeofilteringEligibility } from "../../src/assetFilters";
import { assetDecorationMapper } from "../../src/assetPool";
import { calculateDistanceInMeters, GeoListenMode } from "../../src/roundware";
import { getRandomAssetData } from "../__mocks__/assetData";
import { point } from "@turf/helpers";
import { faker } from "@faker-js/faker";
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
});

describe("calculateDistanceInMeters()", () => {
  test("should return correct approximate correct in meters", () => {
    expect(
      +calculateDistanceInMeters(point([0, 1]), point([0, 2])).toFixed(0)
    ).toEqual(111195);
  });
});

describe("distanceFixedFilter()", () => {
  test("should be lowest if GeoListenMode is disabled", () => {});
});
