import distance from "@turf/distance";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { Point } from "@turf/helpers";
import { Coord } from "@turf/helpers";
import { isEmpty } from "./utils";
import { GeoListenMode } from "./mixer";
import { GeoListenModeType, IAssetData, IMixParams } from "./types";
import { RoundwareFrameworkError } from "./errors/app.errors";

export const ASSET_PRIORITIES: Readonly<{
  DISCARD: false;
  NEUTRAL: number;
  LOWEST: number;
  NORMAL: number;
  HIGHEST: number;
  [key: string]: boolean | number;
}> = Object.freeze({
  DISCARD: false,
  NEUTRAL: 0,
  LOWEST: 1,
  NORMAL: 100,
  HIGHEST: 999,
});

const alwaysLowest = (): number => ASSET_PRIORITIES.LOWEST;
const alwaysNeutral = (): number => ASSET_PRIORITIES.NEUTRAL; // eslint-disable-line no-unused-vars

/**
 *Accept an asset if any one of the provided filters passes, returns the first non-discarded and non-neutral rank
 *
 * @export
 * @param {(Array<(asset: IAssetData, param?: IMixParams | any) => number>)} [filters=[]]
 * @param {IMixParams} [mixParams]
 * @return {*}
 */

export function anyAssetFilter(
  filters: Array<(asset: IAssetData, param?: IMixParams | any) => number> = [],
  mixParams?: IMixParams
) {
  if (isEmpty(filters)) return alwaysLowest;

  return (asset: IAssetData, { ...stateParams }) => {
    for (const filter of filters) {
      let rank = filter(asset, { ...mixParams, ...stateParams });
      if (
        // @ts-ignore
        rank !== ASSET_PRIORITIES.DISCARD &&
        rank !== ASSET_PRIORITIES.NEUTRAL
      ) {
        return rank;
      }
    }

    return ASSET_PRIORITIES.DISCARD;
  };
}

/** Filter composed of multiple inner filters that accepts assets which pass every inner filter. */
export function allAssetFilter(
  filters: Array<(asset: IAssetData, param?: IMixParams | any) => number> = [],
  mixParams?: IMixParams
): (asset: IAssetData, stateParams: IMixParams | any) => number {
  if (isEmpty(filters)) return alwaysLowest;

  return (asset: IAssetData, { ...stateParams }): number => {
    const ranks: number[] = [];

    for (let filter of filters) {
      let rank = filter(asset, { ...mixParams, ...stateParams });

      // @ts-ignore
      if (rank === ASSET_PRIORITIES.DISCARD) return rank; // can skip remaining filters

      ranks.push(rank);
    }

    const finalRank =
      ranks.find((r) => r !== ASSET_PRIORITIES.NEUTRAL) || ranks[0];
    return finalRank;
  };
}

// a "pre-filter" used by geo-enabled filters to make sure if we are missing data, or geoListenMode is DISABLED,
// we always return a neutral ranking
const rankForGeofilteringEligibility = (
  asset: IAssetData,
  {
    listenerPoint,
    geoListenMode,
  }: Pick<IMixParams, "listenerPoint" | "geoListenMode">
) => {
  return geoListenMode !== GeoListenMode.DISABLED && listenerPoint && asset;
};

const calculateDistanceInMeters = (loc1: Coord, loc2: Coord) =>
  distance(loc1, loc2, { units: "meters" });

/** Only accepts an asset if the user is within the project-configured recording radius  */
export const distanceFixedFilter =
  () =>
  (
    asset: IAssetData,
    options: Pick<
      IMixParams,
      "geoListenMode" | "listenerPoint" | "recordingRadius"
    >
  ): number => {
    try {
      if (options.geoListenMode === GeoListenMode.DISABLED) {
        return ASSET_PRIORITIES.LOWEST;
      }
      if (!rankForGeofilteringEligibility(asset, options))
        return ASSET_PRIORITIES.NEUTRAL;

      const { locationPoint: assetLocationPoint } = asset;
      const { listenerPoint, recordingRadius } = options;

      if (typeof listenerPoint == "undefined")
        throw new RoundwareFrameworkError(`listenerPoint was undefined`);
      if (typeof assetLocationPoint == "undefined")
        throw new RoundwareFrameworkError(`assetLocationPoint was undefined`);

      const distance = calculateDistanceInMeters(
        listenerPoint,
        assetLocationPoint
      );

      if (distance < recordingRadius!) {
        return ASSET_PRIORITIES.NORMAL;
      } else {
        // @ts-ignore
        return ASSET_PRIORITIES.DISCARD;
      }
    } catch (e) {
      throw new RoundwareFrameworkError(e);
    }
  };

/**
 Accepts an asset if the user is within range of it based on the current dynamic distance range.
 */
export const distanceRangesFilter =
  () =>
  (
    asset: IAssetData,
    options: Pick<
      IMixParams,
      "getListenMode" | "listenerPoint" | "minDist" | "maxDist"
    >
  ): number | boolean => {
    try {
      if (options.getListenMode === GeoListenMode.DISABLED) {
        return ASSET_PRIORITIES.LOWEST;
      }

      if (!rankForGeofilteringEligibility(asset, options)) {
        return ASSET_PRIORITIES.NEUTRAL;
      }
      const { listenerPoint, minDist, maxDist } = options;

      if (minDist === undefined || maxDist === undefined) {
        return ASSET_PRIORITIES.NEUTRAL;
      }
      const { locationPoint } = asset;

      if (
        typeof locationPoint == "undefined" ||
        typeof listenerPoint == "undefined"
      )
        throw new RoundwareFrameworkError(`locationPoint is undefined!`);
      const distance = calculateDistanceInMeters(listenerPoint, locationPoint);

      if (distance >= minDist && distance <= maxDist) {
        return ASSET_PRIORITIES.NORMAL;
      } else {
        return ASSET_PRIORITIES.DISCARD;
      }
    } catch (e) {
      console.error(e);
      throw new RoundwareFrameworkError(e);
    }
  };

// Rank the asset if it is tagged with one of the currently-enabled tag IDs
export function anyTagsFilter() {
  return (
    asset: IAssetData,
    { listenTagIds = [] }: Pick<IMixParams, "listenTagIds">
  ): number => {
    if (isEmpty(listenTagIds)) return ASSET_PRIORITIES.LOWEST;

    const { tag_ids: assetTagIds = [] } = asset;

    for (const tagId of assetTagIds) {
      if (listenTagIds.includes(tagId)) return ASSET_PRIORITIES.LOWEST; // matching only by tag should be the least-important filter
    }

    // @ts-ignore
    return ASSET_PRIORITIES.DISCARD;
  };
}

// keep assets that are slated to start now or in the past few minutes AND haven't been played before
export const timedAssetFilter = () => {
  return (
    asset: IAssetData,
    { elapsedSeconds = 0, timedAssetPriority = "normal" }
  ): number | boolean => {
    const { timedAssetStart, timedAssetEnd, playCount } = asset;

    if (!timedAssetStart || !timedAssetEnd) return ASSET_PRIORITIES.DISCARD;
    if (
      timedAssetStart >= elapsedSeconds ||
      timedAssetEnd <= elapsedSeconds ||
      playCount! > 0
    )
      return ASSET_PRIORITIES.DISCARD;

    const priorityEnumStr = timedAssetPriority.toUpperCase(); // "highest", "lowest", "normal", etc.

    return ASSET_PRIORITIES[priorityEnumStr] || ASSET_PRIORITIES.NEUTRAL;
  };
};

// Accept an asset if the user is currently within its defined shape
export const assetShapeFilter = () => {
  return (
    asset: IAssetData,
    options: Pick<IMixParams, "listenerPoint" | "geoListenMode">
  ): number | boolean => {
    const { shape } = asset;

    if (!(shape && rankForGeofilteringEligibility(asset, options)))
      return ASSET_PRIORITIES.NEUTRAL;

    const { listenerPoint } = options;
    if (!listenerPoint)
      throw new RoundwareFrameworkError(`listenerPoint was undefined`);
    if (booleanPointInPolygon(listenerPoint, shape)) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };
};

// Prevents assets from repeating until a certain time threshold has passed
export const timedRepeatFilter =
  () =>
  (asset: IAssetData, { bannedDuration = 600 }): number | boolean => {
    const { lastListenTime } = asset;

    if (!lastListenTime) return ASSET_PRIORITIES.NORMAL; // e.g. asset has never been heard before

    const durationSinceLastListen =
      (new Date().getTime() - new Date(lastListenTime).getTime()) / 1000;

    if (durationSinceLastListen <= bannedDuration) {
      return ASSET_PRIORITIES.DISCARD;
    } else {
      return ASSET_PRIORITIES.LOWEST;
    }
  };

export const dateRangeFilter =
  () =>
  (
    asset: IAssetData,
    { startDate, endDate }: { startDate: string | Date; endDate: string | Date }
  ): number | false => {
    if (startDate || endDate) {
      // dates can be of type strings
      // need to convert to date objects

      if (!(startDate instanceof Date)) startDate = new Date(startDate);
      if (!(endDate instanceof Date)) endDate = new Date(endDate);

      let assetCreated: string | any = asset.created;
      if (!(assetCreated instanceof Date))
        assetCreated = new Date(assetCreated);

      return (!startDate || assetCreated >= startDate) &&
        (!endDate || assetCreated <= endDate)
        ? ASSET_PRIORITIES.NORMAL
        : ASSET_PRIORITIES.DISCARD;
    } else {
      return ASSET_PRIORITIES.LOWEST;
    }
  };

export const roundwareDefaultFilterChain: (
  asset: IAssetData,
  mixParams?: IMixParams
) => number = allAssetFilter([
  // @ts-ignore
  anyAssetFilter([
    // @ts-ignore
    timedAssetFilter(), // if an asset is scheduled to play right now, or
    // @ts-ignore
    assetShapeFilter(), // if an asset has a shape and we AREN'T in it, reject entirely, or
    allAssetFilter([
      distanceFixedFilter(), // if it has no shape, consider a fixed distance from it, or
      // @ts-ignore
      distanceRangesFilter(),
      //angleFilter() // if the listener is within a user-configured distance or angle range
    ]),
  ]),
  // @ts-ignore
  timedRepeatFilter(), // only repeat assets if there's no other choice
  //blockedAssetsFilter(), // skip blocked assets and users
  anyTagsFilter(), // all the tags on an asset must be in our list of tags to listen for
  // @ts-ignore
  dateRangeFilter(),
  //trackTagsFilter(),     // if any track-level tag filters exist, apply them
  //dynamicTagFilter("_ten_most_recent_days",mostRecentFilter({ days: 10 })) // Only pass assets created within the most recent 10 days
]);
