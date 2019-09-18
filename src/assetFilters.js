import * as turf from '@turf/turf'; // TODO try to use smaller packages since turf is so modular
import { isEmpty } from './utils';

export const ASSET_PRIORITIES = Object.freeze({
  DISCARD: false,
  NEUTRAL:  0,
  LOWEST: 1,
  NORMAL: 100,
  HIGHEST: 999
});

const alwaysLowest = () => ASSET_PRIORITIES.LOWEST;

// Accept an asset if any one of the provided filters passes, returns the first non-discarded rank
function anyAssetFilter(filters = [],{ ...mixParams }) {
  if (isEmpty(filters)) return alwaysLowest;

  return (asset,{ ...stateParams }) => {
    for (let filter of filters) {
      let rank = filter(asset,{ ...mixParams, ...stateParams });
      if (rank !== ASSET_PRIORITIES.DISCARD) return rank;
    }

    return ASSET_PRIORITIES.DISCARD;
  };
}

/** Filter composed of multiple inner filters that accepts assets which pass every inner filter. */
function allAssetFilter(filters = [],{ ...mixParams }) {
  if (isEmpty(filters)) return alwaysLowest;
  
  return (asset,{ ...stateParams }) => {
    const ranks = {};

    for (let filter of filters) {
      let rank = filter(asset,{ ...mixParams, ...stateParams });

      if (rank === ASSET_PRIORITIES.DISCARD) return rank; // can skip remaining filters

      ranks[rank] = 1;
    }

    // return highest-priority (lowest integer) ranking for the asset
    const sortedRanks = Object.keys(ranks).sort((a,b) => a - b);
    return sortedRanks[0];
  };
}

const rankForGeofilteringEligibility = (asset,{ listenerLocation, geoListenEnabled = false }) => {
  if (!geoListenEnabled || !listenerLocation || !asset) return ASSET_PRIORITIES.NEUTRAL;

  const { location: assetLocation } = asset;
  if (!assetLocation) return ASSET_PRIORITIES.NETURAL;
};

const calculateDistanceInMeters = (loc1,loc2) => turf.distance(loc1,loc2,{ units: 'kilometers' }) / 1000.;

/** Only accepts an asset if the user is within the project-configured recording radius  */
function distanceFixedFilter() {
  const filter = (asset,{ listenerLocation, recordingRadius = Infinity }) => {
    const { location: assetLocation } = asset;
    const distance = calculateDistanceInMeters(listenerLocation,assetLocation);

    if (distance < recordingRadius) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };

  return allAssetFilter([
    rankForGeofilteringEligibility,
    filter
  ]);
}

/**
 Accepts an asset if the user is within range of it based on the current dynamic distance range.
 */
function distanceRangesFilter() {
  const filter = (asset,{ listenerLocation, minDist = 0, maxDist = Infinity }) => {
    const { location: assetLocation } = asset;
    const distance = calculateDistanceInMeters(listenerLocation,assetLocation);

    if (distance >= minDist && distance <= maxDist) {
      return ASSET_PRIORITIES.NORMAL;
    } else {
      return ASSET_PRIORITIES.DISCARD;
    }
  };

  return allAssetFilter([
    rankForGeofilteringEligibility,
    filter
  ]);
}
  
function allTagsFilter() {
  console.warn('Have not implemented allTagsFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}

function anyTagsFilter() {
  console.warn('Have not implemented anyTagsFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}

/** TODO implement all remaining filters */
 
// if an asset is scheduled to play right now
function timedAssetFilter() {
  console.warn('Have not implemented timedAssetFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}
  
function assetShapeFilter() {
  console.warn('Have not implemented assetShapeFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}

function timedRepeatFilter() {
  console.warn('Have not implemented timedRepeatFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}
  
function trackTagsFilter() {
  console.warn('Have not implemented trackTagsFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}

function blockedAssetsFilter() {
  console.warn('Have not implemented blockedAssetsFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}
  
function angleFilter() {
  console.warn('Have not implemented angleFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}
  
function dynamicTagFilter() {
  console.warn('Have not implemented dynamicTagFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}

const roundwareDefaultFilterChain = allAssetFilter([
  anyAssetFilter([
    timedAssetFilter(),                                     // if an asset is scheduled to play right now, or
    assetShapeFilter(),                                     // if an asset has a shape and we AREN'T in it, reject entirely, or
    distanceFixedFilter(),                                  // if it has no shape, consider a fixed distance from it, or
    allAssetFilter([distanceRangesFilter(),angleFilter()]) // if the listener is within a user-configured distance or angle range
  ]),

  timedRepeatFilter(),   // only repeat assets if there's no other choice
  blockedAssetsFilter(), // skip blocked assets and users
  anyTagsFilter(),       // all the tags on an asset must be in our list of tags to listen for
  trackTagsFilter(),     // if any track-level tag filters exist, apply them
  dynamicTagFilter("_ten_most_recent_days",mostRecentFilter({ days: 10 })) // Only pass assets created within the most recent 10 days
]);

/**
 Only pass assets created within the most recent given time range.  `MostRecentFilter(days: 7)` accepts assets published within the last week.
 */
function mostRecentFilter() {
  console.warn('Have not implemented mostRecentFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
}

export {
  roundwareDefaultFilterChain,
  allAssetFilter,
  distanceFixedFilter,
  distanceRangesFilter,
  allTagsFilter,
  anyTagsFilter,
  timedAssetFilter,
  assetShapeFilter,
  timedRepeatFilter,
  trackTagsFilter,
  blockedAssetsFilter,
  angleFilter,
  dynamicTagFilter,
  mostRecentFilter
};
