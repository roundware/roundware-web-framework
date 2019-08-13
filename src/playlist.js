const DEFAULT_FILTERS = [];
const DEFAULT_SORT_METHODS = [];
const DEFAULTS = {
  filters: DEFAULT_FILTERS,
  sortMethods: DEFAULT_SORT_METHODS
};


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

export class Playlist {
  constructor({ assets, filters, sortMethods } = DEFAULTS) {
    this.assets = assets;
    this.filters = filters;
    this.sortMethods = sortMethods;
  }

  onNextAsset() {
    // STOPPED HERE -- start making this into a filtered, sorted queue
    return Promise.resolve(this.assets[0]);
  }
}
