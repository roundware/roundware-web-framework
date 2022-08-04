import distance from "@turf/distance";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { Coord } from "@turf/helpers";
import { isEmpty } from "./utils";
import { GeoListenMode } from "./mixer";
import { GeoListenModeType, IMixParams } from "./types";
import { IDecoratedAsset } from "./types/asset";
import {
  InvalidArgumentError,
  RoundwareFrameworkError,
} from "./errors/app.errors";

export interface IAssetPriorities {
  readonly DISCARD: false;
  readonly NEUTRAL: number;
  readonly LOWEST: number;
  readonly NORMAL: number;
  readonly HIGHEST: number;
  readonly [key: string]: false | number;
}
export type AssetPriorityType = false | 0 | 1 | 100 | 999 | number;
export const ASSET_PRIORITIES: IAssetPriorities = Object.freeze({
  // don't select this
  DISCARD: false,
  // don't know what to do, allow other filters to take decision if possible
  NEUTRAL: 0,
  // should be selected immediately
  LOWEST: 1,
  //  normal
  NORMAL: 100,
  // should be selected if no other choice
  HIGHEST: 999,
});

const alwaysLowest = (): IAssetPriorities[`LOWEST`] => ASSET_PRIORITIES.LOWEST;

/**
 *Accept an asset if any one of the provided filters passes, returns the first non-discarded and non-neutral rank
 *
 * @export
 * @param {(Array<(asset: IDecoratedAsset, param?: IMixParams | any) => number>)} [filters=[]]
 * @param {IMixParams} [mixParams]
 * @return {*}
 */
export const anyAssetFilter = (
  filters: ((asset: IDecoratedAsset, param: IMixParams) => AssetPriorityType)[]
) => {
  if (isEmpty(filters)) return alwaysLowest;

  return (asset: IDecoratedAsset, { ...stateParams }) => {
    for (const filter of filters) {
      let rank = filter(asset, { ...stateParams });
      if (
        rank !== ASSET_PRIORITIES.DISCARD &&
        rank !== ASSET_PRIORITIES.NEUTRAL
      ) {
        return rank;
      }
    }
    return ASSET_PRIORITIES.DISCARD;
  };
};

/** Filter composed of multiple inner filters that accepts assets which pass every inner filter. */
export function allAssetFilter(
  filters: ((asset: IDecoratedAsset, param: IMixParams) => AssetPriorityType)[],
  mixParams?: IMixParams
): (asset: IDecoratedAsset, stateParams: IMixParams) => AssetPriorityType {
  if (isEmpty(filters)) return alwaysLowest;

  return (asset: IDecoratedAsset, { ...stateParams }): AssetPriorityType => {
    const ranks: number[] = [];

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
export const rankForGeofilteringEligibility = (
  asset: IDecoratedAsset | undefined,
  {
    listenerPoint,
    geoListenMode,
  }: Pick<IMixParams, "listenerPoint" | "geoListenMode">
): boolean => {
  return !!(
    geoListenMode !== GeoListenMode.DISABLED &&
    listenerPoint &&
    asset &&
    asset.locationPoint
  );
};

export const calculateDistanceInMeters = (loc1: Coord, loc2: Coord) =>
  distance(loc1, loc2, { units: "meters" });

/** Only accepts an asset if the user is within the project-configured recording radius  */
export const distanceFixedFilter =
  () =>
  (
    asset: IDecoratedAsset,
    options: Pick<
      IMixParams,
      "geoListenMode" | "listenerPoint" | "recordingRadius"
    >
  ): AssetPriorityType => {
    if (!rankForGeofilteringEligibility(asset, options))
      return ASSET_PRIORITIES.NEUTRAL;

    const { locationPoint: assetLocationPoint } = asset;
    const { listenerPoint, recordingRadius } = options;

    if (!recordingRadius) return ASSET_PRIORITIES.NEUTRAL;
    const distance = calculateDistanceInMeters(
      listenerPoint!,
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
    asset: IDecoratedAsset,
    options: Pick<
      IMixParams,
      "getListenMode" | "listenerPoint" | "minDist" | "maxDist"
    >
  ): number | false => {
    if (!rankForGeofilteringEligibility(asset, options)) {
      return ASSET_PRIORITIES.NEUTRAL;
    }
    const { listenerPoint, minDist = 0, maxDist } = options;

    if (minDist == undefined || maxDist == undefined) {
      return ASSET_PRIORITIES.NEUTRAL;
    }
    const { locationPoint } = asset;

    const distance = calculateDistanceInMeters(listenerPoint!, locationPoint);
    if (distance >= minDist && distance <= maxDist) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };

// Rank the asset if it is tagged with one of the currently-enabled tag IDs
export function anyTagsFilter() {
  return (asset: IDecoratedAsset, mixParams: IMixParams): number | false => {
    const { listenTagIds } = mixParams;

    if (!listenTagIds || isEmpty(listenTagIds)) return ASSET_PRIORITIES.NEUTRAL;

    const { tag_ids: assetTagIds } = asset;

    if (assetTagIds.some((t) => listenTagIds.includes(t))) {
      return ASSET_PRIORITIES.LOWEST;
    }
    return ASSET_PRIORITIES.DISCARD;
  };
}

// keep assets that are slated to start now or in the past few minutes AND haven't been played before
export const timedAssetFilter = () => {
  return (
    asset: IDecoratedAsset,
    { elapsedSeconds = 0, timedAssetPriority = "normal" }
  ): number | false => {
    const { timedAssetStart, timedAssetEnd, playCount = 0 } = asset;

    if (!timedAssetStart || !timedAssetEnd) return ASSET_PRIORITIES.NEUTRAL;
    if (
      timedAssetStart > elapsedSeconds ||
      elapsedSeconds >= timedAssetEnd ||
      playCount > 0
    ) {
      return ASSET_PRIORITIES.DISCARD;
    }

    const priorityEnumStr = timedAssetPriority.toUpperCase(); // "highest", "lowest", "normal", etc.

    if (priorityEnumStr in ASSET_PRIORITIES)
      return ASSET_PRIORITIES[priorityEnumStr];
    return ASSET_PRIORITIES.NEUTRAL;
  };
};

// Accept an asset if the user is currently within its defined shape
export const assetShapeFilter = () => {
  return (
    asset: IDecoratedAsset,
    options: Pick<IMixParams, "listenerPoint" | "geoListenMode">
  ): number | false => {
    const { shape } = asset;

    if (!(shape && rankForGeofilteringEligibility(asset, options)))
      return ASSET_PRIORITIES.NEUTRAL;

    const { listenerPoint } = options;

    if (booleanPointInPolygon(listenerPoint!, shape)) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };
};

// Prevents assets from repeating until a certain time threshold has passed
export const timedRepeatFilter =
  () =>
  (
    asset: IDecoratedAsset,
    { bannedDuration = 600, repeatRecordings }: IMixParams
  ): number | false => {
    let { lastListenTime, playCount = 0 } = asset;

    // repeat recordings check
    if (playCount > 0 && !repeatRecordings) {
      return ASSET_PRIORITIES.DISCARD;
    }
    if (!lastListenTime || asset?.status === "paused")
      return ASSET_PRIORITIES.NORMAL; // e.g. asset has never been heard before

    const durationSinceLastListen =
      (new Date().getTime() - new Date(lastListenTime).getTime()) / 1000;

    if (durationSinceLastListen < bannedDuration) {
      return ASSET_PRIORITIES.DISCARD;
    } else {
      return ASSET_PRIORITIES.LOWEST;
    }
  };

export const dateRangeFilter =
  () =>
  (
    asset: IDecoratedAsset,
    { startDate, endDate }: { startDate?: Date; endDate?: Date }
  ): number | false => {
    if (!startDate || !endDate) return ASSET_PRIORITIES.LOWEST;

    if (!asset.created) return ASSET_PRIORITIES.LOWEST;
    if (!(asset.created instanceof Date))
      asset.created = new Date(asset.created);

    if (asset.created.getTime() <= startDate.getTime())
      return ASSET_PRIORITIES.DISCARD;

    if (asset.created.getTime() >= endDate.getTime())
      return ASSET_PRIORITIES.DISCARD;

    return ASSET_PRIORITIES.NORMAL;
  };

export const pausedAssetFilter =
  () =>
  (asset: IDecoratedAsset, mixParams?: IMixParams): number | false => {
    if (asset.status === "paused") {
      asset.status = "resumed";
      return ASSET_PRIORITIES.LOWEST;
    }
    return ASSET_PRIORITIES.NORMAL;
  };
export const roundwareDefaultFilterChain: (
  asset: IDecoratedAsset,
  mixParams: IMixParams
) => AssetPriorityType = allAssetFilter([
  anyAssetFilter([
    timedAssetFilter(), // if an asset is scheduled to play right now, or

    assetShapeFilter(), // if an asset has a shape and we AREN'T in it, reject entirely, or
    allAssetFilter([
      distanceFixedFilter(), // if it has no shape, consider a fixed distance from it, or

      distanceRangesFilter(),
      // if the listener is within a user-configured distance or angle range
    ]),
  ]),

  timedRepeatFilter(), // only repeat assets if there's no other choice
  //blockedAssetsFilter(), // skip blocked assets and users
  anyTagsFilter(), // all the tags on an asset must be in our list of tags to listen for

  dateRangeFilter(),

  pausedAssetFilter(), // if any asset was paused due to out of range it will be returned first
  //trackTagsFilter(),     // if any track-level tag filters exist, apply them
  //dynamicTagFilter("_ten_most_recent_days",mostRecentFilter({ days: 10 })) // Only pass assets created within the most recent 10 days
]);
