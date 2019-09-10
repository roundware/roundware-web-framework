import * as sortMethods from './sortMethods';

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

function mapSortMethods(sortMethodNames) {
  return sortMethodNames.map(name => sortMethods[name]);
}

export class Playlist {
  constructor({ assets = [], filters = [], sortMethods = [] }) {
    this.assets = assets;
    this.filters = filters;
    this.sortMethods = mapSortMethods(sortMethods);
    this.computeList();
  }

  provideAsset() {
    // TODO make this into a filtered, sorted queue
    // for now use naive approach, play each asset once from a queue
    const asset = this.assets.pop();
    return Promise.resolve(asset);
  }

  computeList() {
    this.sortMethods.forEach(sortMethod => sortMethod(this.assets));
  }
}
