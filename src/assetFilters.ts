import distance from "@turf/distance";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { Point } from "@turf/helpers";
import { Coord } from "@turf/helpers";
import { isEmpty } from "./utils";
import { GeoListenMode } from "./mixer";
import { Asset } from "./types";

export const ASSET_PRIORITIES = Object.freeze({
  DISCARD: false,
  NEUTRAL: 0,
  LOWEST: 1,
  NORMAL: 100,
  HIGHEST: 999,
});

const alwaysLowest = (): number => ASSET_PRIORITIES.LOWEST;
const alwaysNeutral = (): number => ASSET_PRIORITIES.NEUTRAL; // eslint-disable-line no-unused-vars

// Accept an asset if any one of the provided filters passes, returns the first
// non-discarded and non-neutral rank
function anyAssetFilter(
  filters: Array<(asset: Asset, param: object) => boolean | number> = [],
  { ...mixParams }
) {
  if (isEmpty(filters)) return alwaysLowest;

  return (asset: Asset, { ...stateParams }) => {
    for (const filter of filters) {
      let rank = filter(asset, { ...mixParams, ...stateParams });
      if (
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
  filters: Array<(asset: Asset, param: object) => boolean | number> = [],
  { ...mixParams }
) {
  if (isEmpty(filters)) return alwaysLowest;

  return (asset: Asset, { ...stateParams }) => {
    const ranks = [];

    for (let filter of filters) {
      let rank = filter(asset, { ...mixParams, ...stateParams });

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
function rankForGeofilteringEligibility(
  asset: Asset,
  {
    listenerPoint,
    geoListenMode,
  }: {
    listenerPoint: Point;
    geoListenMode: string | number;
  }
) {
  return geoListenMode !== GeoListenMode.DISABLED && listenerPoint && asset;
}

const calculateDistanceInMeters = (loc1: Coord, loc2: Coord) =>
  distance(loc1, loc2, { units: "meters" });

/** Only accepts an asset if the user is within the project-configured recording radius  */
export const distanceFixedFilter =
  () =>
  (
    asset: Asset,
    options: {
      geoListenMode: number;
      listenerPoint: Point;
      recordingRadius: number;
    }
  ) => {
    if (options.geoListenMode === GeoListenMode.DISABLED) {
      return ASSET_PRIORITIES.LOWEST;
    }
    if (!rankForGeofilteringEligibility(asset, options))
      return ASSET_PRIORITIES.NEUTRAL;

    const { locationPoint: assetLocationPoint } = asset;
    const { listenerPoint, recordingRadius } = options;

    const distance = calculateDistanceInMeters(
      listenerPoint,
      assetLocationPoint
    );

    if (distance < recordingRadius) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };

/**
 Accepts an asset if the user is within range of it based on the current dynamic distance range.
 */
export const distanceRangesFilter =
  () =>
  (
    asset: Asset,
    options: {
      getListenMode: number;
      listenerPoint: Point;
    } = {}
  ) => {
    if (options.getListenMode === GeoListenMode.DISABLED) {
      return ASSET_PRIORITIES.LOWEST;
    }
    if (
      !rankForGeofilteringEligibility(asset, {
        geoListenMode: options.getListenMode,
        listenerPoint: options.listenerPoint,
      })
    ) {
      return ASSET_PRIORITIES.NEUTRAL;
    }
    const { listenerPoint, minDist, maxDist } = options;

    if (minDist === undefined || maxDist === undefined) {
      return ASSET_PRIORITIES.NEUTRAL;
    }
    const { locationPoint } = asset;

    const distance = calculateDistanceInMeters(listenerPoint, locationPoint);

    if (distance >= minDist && distance <= maxDist) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };

// Rank the asset if it is tagged with one of the currently-enabled tag IDs
export function anyTagsFilter() {
  return (asset, { listenTagIds }) => {
    if (isEmpty(listenTagIds)) return ASSET_PRIORITIES.LOWEST;

    const { tag_ids: assetTagIds = [] } = asset;

    for (const tagId of assetTagIds) {
      if (listenTagIds.includes(tagId)) return ASSET_PRIORITIES.LOWEST; // matching only by tag should be the least-important filter
    }

    return ASSET_PRIORITIES.DISCARD;
  };
}

// keep assets that are slated to start now or in the past few minutes AND haven't been played before
export function timedAssetFilter() {
  return (asset, { elapsedSeconds = 0, timedAssetPriority = "normal" }) => {
    const { timedAssetStart, timedAssetEnd, playCount } = asset;

    if (!timedAssetStart || !timedAssetEnd) return ASSET_PRIORITIES.DISCARD;
    if (
      timedAssetStart >= elapsedSeconds ||
      timedAssetEnd <= elapsedSeconds ||
      playCount > 0
    )
      return ASSET_PRIORITIES.DISCARD;

    const priorityEnumStr = timedAssetPriority.toUpperCase(); // "highest", "lowest", "normal", etc.

    return ASSET_PRIORITIES[priorityEnumStr] || ASSET_PRIORITIES.NEUTRAL;
  };
}

// Accept an asset if the user is currently within its defined shape
export function assetShapeFilter() {
  return (asset, options = {}) => {
    const { shape } = asset;

    if (!(shape && rankForGeofilteringEligibility(asset, options)))
      return ASSET_PRIORITIES.NEUTRAL;

    const { listenerPoint } = options;

    if (booleanPointInPolygon(listenerPoint, shape)) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };
}

// Prevents assets from repeating until a certain time threshold has passed
export const timedRepeatFilter =
  () =>
  (asset, { bannedDuration = 600 }) => {
    const { lastListenTime } = asset;

    if (!lastListenTime) return ASSET_PRIORITIES.NORMAL; // e.g. asset has never been heard before

    const durationSinceLastListen = (new Date() - lastListenTime) / 1000;

    if (durationSinceLastListen <= bannedDuration) {
      return ASSET_PRIORITIES.DISCARD;
    } else {
      return ASSET_PRIORITIES.LOWEST;
    }
  };

export const dateRangeFilter =
  () =>
  (asset, { startDate, endDate }) => {
    if (startDate || endDate) {
      return (!startDate || asset.created >= startDate) &&
        (!endDate || asset.created <= endDate)
        ? ASSET_PRIORITIES.NORMAL
        : ASSET_PRIORITIES.DISCARD;
    } else {
      return ASSET_PRIORITIES.LOWEST;
    }
  };

export const roundwareDefaultFilterChain = allAssetFilter([
  anyAssetFilter([
    timedAssetFilter(), // if an asset is scheduled to play right now, or
    assetShapeFilter(), // if an asset has a shape and we AREN'T in it, reject entirely, or

    allAssetFilter([
      distanceFixedFilter(), // if it has no shape, consider a fixed distance from it, or
      distanceRangesFilter(),
      //angleFilter() // if the listener is within a user-configured distance or angle range
    ]),
  ]),

  timedRepeatFilter(), // only repeat assets if there's no other choice
  //blockedAssetsFilter(), // skip blocked assets and users
  anyTagsFilter(), // all the tags on an asset must be in our list of tags to listen for
  dateRangeFilter(),
  //trackTagsFilter(),     // if any track-level tag filters exist, apply them
  //dynamicTagFilter("_ten_most_recent_days",mostRecentFilter({ days: 10 })) // Only pass assets created within the most recent 10 days
]);
