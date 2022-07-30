import { rankForGeofilteringEligibility } from "../../src/assetFilters";
import { assetDecorationMapper } from "../../src/assetPool";
import {
  ASSET_PRIORITIES,
  calculateDistanceInMeters,
  dateRangeFilter,
  distanceFixedFilter,
  GeoListenMode,
  pausedAssetFilter,
  timedRepeatFilter,
} from "../../src/roundware";
import { getRandomAssetData } from "../__mocks__/assetData";
import { point } from "@turf/helpers";
import { faker } from "@faker-js/faker";
import { IDecoratedAsset } from "../../src/types/asset";
import {
  InvalidArgumentError,
  RoundwareFrameworkError,
} from "../../src/errors/app.errors";
import { addDays, subDays } from "date-fns";
import { omit } from "lodash";
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

  test("should throw error if recording Oradius is not there", () => {
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

describe("timedRepeatFilter", () => {
  test("should normal if not listened before", () => {
    expect(
      timedRepeatFilter()(
        {
          ...omit(getRandomAssetData(1, true)[0] as IDecoratedAsset, [
            "lastListenTime",
          ]),
        },
        {}
      )
    ).toBe(ASSET_PRIORITIES.NORMAL);
  });

  test("should normal if asset is paused", () => {
    expect(
      timedRepeatFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          lastListenTime: Date.now(),
          status: "paused",
        },
        {}
      )
    ).toBe(ASSET_PRIORITIES.NORMAL);
  });

  test("should discard if played and not asked to repeat", () => {
    expect(
      timedRepeatFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          playCount: 2,
        },
        {
          repeatRecordings: false,
        }
      )
    ).toBe(ASSET_PRIORITIES.DISCARD);
  });

  test("should discard if last listen is less than banned duration", () => {
    expect(
      timedRepeatFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          lastListenTime: Date.now() - 200,
        },
        {
          repeatRecordings: true,
          bannedDuration: 600 / 1000,
        }
      )
    ).toBe(ASSET_PRIORITIES.DISCARD);
  });

  test("should lowest if last listen is more than banned duration", () => {
    expect(
      timedRepeatFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          lastListenTime: Date.now() - 600,
        },
        {
          repeatRecordings: true,
          bannedDuration: 600 / 1000,
        }
      )
    ).toBe(ASSET_PRIORITIES.LOWEST);
  });
});

describe("dateRangeFilter", () => {
  test("should normal if within range", () => {
    const testDate = new Date();
    expect(
      dateRangeFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          created: testDate,
        },
        {
          startDate: subDays(testDate, 1),
          endDate: addDays(testDate, 1),
        }
      )
    ).toBe(ASSET_PRIORITIES.NORMAL);
  });

  test("should discard if in filter future range", () => {
    expect(
      dateRangeFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          created: new Date(),
        },
        {
          startDate: addDays(new Date(), 1),
          endDate: addDays(new Date(), 2),
        }
      )
    ).toBe(ASSET_PRIORITIES.DISCARD);
  });

  test("should discard if in filter past range", () => {
    expect(
      dateRangeFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          created: new Date(),
        },
        {
          startDate: subDays(new Date(), 2),
          endDate: subDays(new Date(), 1),
        }
      )
    ).toBe(ASSET_PRIORITIES.DISCARD);
  });

  test("should be lowest if not date filters", () => {
    expect(
      dateRangeFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          created: new Date(),
        },
        {}
      )
    ).toBe(ASSET_PRIORITIES.LOWEST);
  });

  test("should convert ISO string to date obejct", () => {
    const testDate = new Date();
    expect(
      dateRangeFilter()(
        {
          ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
          created: testDate.toISOString(),
        },
        {
          startDate: subDays(testDate, 1),
          endDate: addDays(testDate, 1),
        }
      )
    ).toBe(ASSET_PRIORITIES.NORMAL);
  });
});
describe("pausedAssetFilter", () => {
  test("should be lowest if asset is paused", () => {
    expect(
      pausedAssetFilter()({
        ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
        status: "paused",
      })
    ).toEqual(ASSET_PRIORITIES.LOWEST);
  });

  test("should return normal if not paused", () => {
    expect(
      pausedAssetFilter()({
        ...(getRandomAssetData(1, true)[0] as IDecoratedAsset),
        status: "resumed",
      })
    ).toEqual(ASSET_PRIORITIES.NORMAL);
  });
});
