import * as turf from '@turf/turf'; // TODO try to use smaller packages since turf is so modular

export const ASSET_PRIORITIES = Object.freeze({
  DISCARD: -1,
  NEUTRAL:  0,
  LOWEST: 1,
  NORMAL: 100,
  HIGHEST: 999
});

/** 
"Regarding filters, here is a vaguely prioritized list (names taken from Swift version):

1. DistanceFixedFilter
2. DistanceRangesFilter
3. AllTagsFilter
4. AnyTagsFilter
5. TimedAssetFilter
6. AssetShapeFilter
7. TimedRepeatFilter
8. TrackTagsFilter
9. BlockedAssetsFilter
10. AngleFilter
11. DynamicTagFilter

The first four are the crucial ones; basically filtering by location and by tag. The others are important, but not as critical to the core functionality."
*/

/*
// Accept an asset if one of the following conditions is true
AnyAssetFilters([
  // if an asset is scheduled to play right now
  TimedAssetFilter(),
  // If an asset has a shape and we AREN'T in it, reject entirely.
  AssetShapeFilter(),
  // if it has no shape, consider a fixed distance from it
  DistanceFixedFilter(),
  // or a user-specified distance range
  AllAssetFilters([DistanceRangesFilter(), AngleFilter()]),
]),
  // only repeat assets if there's no other choice
  TimedRepeatFilter(),
  // skip blocked assets and users
  BlockedAssetsFilter(),
  // all the tags on an asset must be in our list of tags to listen for
  AnyTagsFilter(),
  // if any track-level tag filters exist, apply them
  TrackTagsFilter(),
  DynamicTagFilter("_ten_most_recent_days", MostRecentFilter(days: 10))

  sortBy: [
        SortRandomly(),
        SortByLikes(),
    ])
*/

// @see https://stackoverflow.com/a/24403771/308448
const isEmpty = array => !array || array.length < 1;

/** Filter composed of multiple inner filters that accepts assets which pass every inner filter. */
function allAssetFilter(filters = [],{ ...mixParams }) {
  if (isEmpty(filters)) return ASSET_PRIORITIES.LOWEST;
  
  return asset => {
    const ranks = {};

    for (let i = 0;i < filters.length;i++) {
      let filter = filters[i];
      let rank = filter(asset,{ ...mixParams });

      if (rank === ASSET_PRIORITIES.DISCARD) return rank; // can skip remaining filters

      ranks[rank] = 1;
    }

    // return highest-priority (lowest integer) ranking for the asset
  return Object.keys(ranks).sort((a,b) => a - b);
  };
}

/** Only accepts an asset if the user is within the project-configured recording radius  */
function distanceFixedFilter(asset,{ listenerLocation, recordingRadius = Infinity, geoListenEnabled = false }) {
  if (!geoListenEnabled) return ASSET_PRIORITIES.NEUTRAL;
  
  const { location: assetLocation } = asset;
  if (!assetLocation) return ASSET_PRIORITIES.NETURAL;

  const distanceInMeters = turf.distance(listenerLocation,assetLocation,{ units: 'kilometers' }) / 1000.;

  if (distanceInMeters < recordingRadius) {
    return ASSET_PRIORITIES.NORMAL;
  } else {
    return ASSET_PRIORITIES.DISCARD;
  }
}

function distanceRangesFilter() {
  console.warn('Have not implemented distanceRangesFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
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

export const assetFilters = {
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
  dynamicTagFilter
};
