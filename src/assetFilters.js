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

// a "pre-filter" used by geo-enabled filters to make sure if we are missing data, or geoListenEnabled is false, 
// we always return a neutral ranking
const rankForGeofilteringEligibility = (asset,{ listenerPoint, geoListenEnabled = false }) => {
  if (!geoListenEnabled || !listenerPoint || !asset) return ASSET_PRIORITIES.NEUTRAL;

  const { location: assetLocation } = asset;
  if (!assetLocation) return ASSET_PRIORITIES.NETURAL;
};

// Converts between turf units (kilometers) and web geolocation units (meters);
const calculateDistanceInMeters = (loc1,loc2) => turf.distance(loc1,loc2,{ units: 'kilometers' }) / 1000.;

/** Only accepts an asset if the user is within the project-configured recording radius  */
function distanceFixedFilter() {
  const filter = (asset,{ listenerPoint, recordingRadius = Infinity }) => {
    const { location: assetLocation } = asset;
    const distance = calculateDistanceInMeters(listenerPoint,assetLocation);

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
  const filter = (asset,{ listenerPoint, minDist = 0, maxDist = Infinity }) => {
    const { location: assetLocation } = asset;
    const distance = calculateDistanceInMeters(listenerPoint,assetLocation);

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
  
// TODO: implement allTagsFilter per below Swift code
//function allTagsFilter() {
  //console.warn('Have not implemented allTagsFilter yet');
  //return () => ASSET_PRIORITIES.NEUTRAL;
  //// List of tag_ids to listen for.
  //guard let listenTagIDs = RWFramework.sharedInstance.getSubmittableListenTagIDsSet()
      //else { return .lowest }

  //let matches = asset.tags.allSatisfy { assetTag in
      //listenTagIDs.contains(assetTag)
  //}

  //return matches ? .lowest : .discard
//}

// Rank the asset if it is tagged with one of the currently-enabled tag IDs
function anyTagsFilter() {
  return (asset,{ listenTagIds }) => {
    if (isEmpty(listenTagIds)) return ASSET_PRIORITIES.LOWEST;

    const { tags: assetTagIds = [] } = asset;

    for (let tagId of assetTagIds) {
      if (listenTagIds.includes(tagId)) return ASSET_PRIORITIES.LOWEST; // matching only by tag should be the least-important filter
    }

    return ASSET_PRIORITIES.DISCARD;
  };
}

// if an asset is scheduled to play right now
function timedAssetFilter() {
  console.warn('Have not implemented timedAssetFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
  //func keep(_ asset: Asset, playlist: Playlist, track: AudioTrack) -> AssetPriority {
    //if timedAssets == nil {
        //timedAssets = []
        //// load the timed assets
        //RWFramework.sharedInstance.apiGetTimedAssets([
            //"project_id": String(playlist.project.id)
        //]).then { data in
            //self.timedAssets = data
        //}
        //return .neutral
    //} else if timedAssets!.isEmpty {
        //return .discard
    //}
    
    //// keep assets that are slated to start now or in the past few minutes
    ////      AND haven't been played before
    //// Units: seconds
    //let now = Date().timeIntervalSince(playlist.startTime)
    //if (timedAssets!.contains { it in
        //it.asset_id == asset.id &&
            //it.start <= now &&
            //it.end >= now &&
            //// it hasn't been played before.
            //playlist.userAssetData[it.asset_id] == nil
    //}) {
        //// Prioritize timed assets only if the project is configured to.
        //if playlist.project.timed_asset_priority {
            //return .highest
        //} else {
            //return .normal
        //}
    //}
    
    //return .discard
}
  
// Accept an asset if the user is currently within its defined shape
function assetShapeFilter() {
  const filter = (asset,{ listenerPoint }) => {
    const { shape } = asset;

    if (!shape) return ASSET_PRIORITIES.NEUTRAL;

    if (turf.booleanPointInPolygon(listenerPoint,shape)) {
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

// Prevents assets from repeating until a certain time threshold has passed.
function timedRepeatFilter() {
  console.warn('Have not implemented timedRepeatFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;

  //if let listenDate = playlist.lastListenDate(for: asset) {
    //let timeout = track.bannedDuration
    //if Date().timeIntervalSince(listenDate) > timeout {
      //return .lowest
    //} else {
      //return .discard
    //}
  //} else {
    //return .normal
  //}
}
  
function trackTagsFilter() {
  console.warn('Have not implemented trackTagsFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
  //func keep(_ asset: Asset, playlist: Playlist, track: AudioTrack) -> AssetPriority {
    //guard let trackTags = track.tags,
          //trackTags.count != 0
        //else { return .lowest }
    
    //let matches = asset.tags.contains { assetTag in
        //trackTags.contains(assetTag)
    //}
    
    //return matches ? .lowest : .discard
  //}
}

// Skips assets that the user has blocked, or assets published by someone that the user has blocked
function blockedAssetsFilter() {
  console.warn('Have not implemented blockedAssetsFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
  //guard let blocked = self.blockedAssets
  //else { return .neutral }

  //if blocked.contains(asset.id) {
    //return .discard
  //} else {
    //return .normal
  //}
}
  
// Accept an asset if it's within the current angle range.
function angleFilter() {
  console.warn('Have not implemented angleFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
  //func keep(_ asset: Asset, playlist: Playlist, track: AudioTrack) -> AssetPriority {
    //guard playlist.project.geo_listen_enabled,
          //let opts = playlist.currentParams,
          //let loc = asset.location,
          //let heading = opts.heading,
          //let angularWidth = opts.angularWidth
        //else { return .neutral }

    //// We can keep any asset if our angular width covers all space.
    //if angularWidth > 359.0 {
        //return .normal
    //}

    //let angle = opts.location.bearingToLocationDegrees(loc)
    //let lower = heading - angularWidth
    //let upper = heading + angularWidth

    //if lower < 0 {
        //// wedge spans from just above zero to below it.
        //// Check between lower...360 and 0...upper
        //if ((360 + lower)...360).contains(angle)
            //|| (0...upper).contains(angle) {
            //return .normal
        //}
    //} else if upper >= 360 {
        //// wedge spans from just below 360 to above it.
        //// Check between lower...360 and 0...upper
        //if (lower...360).contains(angle)
            //|| (0...(upper - 360)).contains(angle) {
            //return .normal
        //}
    //} else if angle >= lower && angle <= upper {
        //return .normal
    //}

    //return .discard
}
  
// Accept assets that pass an inner filter if the tag with a given filter key is enabled
function dynamicTagFilter() {
  console.warn('Have not implemented dynamicTagFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;

  /// Mapping of dynamic filter name to tag id
  //private static let tags = try! JSON(
    //data: UserDefaults.standard.data(forKey: "tags")!
  //).array!.reduce(into: [String: [Int]]()) { acc, t in
      //let key = t["filter"].string!
      //acc[key] = (acc[key] ?? []) + [t["id"].int!]
  //}

  //private let key: String
  //private let filter: AssetFilter

  //init(_ key: String, _ filter: AssetFilter) {
    //self.key = key
    //self.filter = filter
  //}

  //func keep(_ asset: Asset, playlist: Playlist, track: AudioTrack) -> AssetPriority {
    //// see if there are any tags using this filter
    //if let tagIds = DynamicTagFilter.tags[self.key],
      //// grab the list of enabled tags
      //let enabledTagIds = RWFramework.sharedInstance.getSubmittableListenTagIDsSet(),
      //// if any filter tags are enabled, apply the filter
      //tagIds.contains(where: { enabledTagIds.contains($0) }) {
        //return self.filter.keep(asset, playlist: playlist, track: track)
      //} else {
        //return .neutral
      //}
  //}
}

/**
 Only pass assets created within the most recent given time range.  `MostRecentFilter(days: 7)` accepts assets published within the last week.
 */
function mostRecentFilter() {
  console.warn('Have not implemented mostRecentFilter yet');
  return () => ASSET_PRIORITIES.NEUTRAL;
  ///// Oldest age of assets to accept.
  //private let maxAge: TimeInterval

  //init(days: Int) {
    //self.maxAge = TimeInterval(days * 24 * 60 * 60)
  //}

  //func keep(_ asset: Asset, playlist: Playlist, track: AudioTrack) -> AssetPriority {
    //let timeSinceCreated = Date().timeIntervalSince(asset.createdDate)
    //if timeSinceCreated > maxAge {
      //return .discard
    //} else {
      //return .normal
    //}
  //}
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

export {
  roundwareDefaultFilterChain,
  allAssetFilter,
  distanceFixedFilter,
  distanceRangesFilter,
  //allTagsFilter,
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
