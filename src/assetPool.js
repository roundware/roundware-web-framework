import { AssetSorter } from "./assetSorter";
import { roundwareDefaultFilterChain } from "./assetFilters";
import { coordsToPoints, cleanAudioURL } from "./utils";

// add new fields to assets after they have been downloaded from the API to be used by rest of the mixing code
// also rewrite .wav as .mp3
const assetDecorationMapper = (timedAssets) => {
  const timedAssetLookup = timedAssets.reduce(
    (lookupTable, timedAsset) => ({
      ...lookupTable,
      [timedAsset.asset_id]: timedAsset,
    }),
    {}
  );

  return (asset) => {
    const {
      start_time: activeRegionLowerBound = 0,
      end_time: activeRegionUpperBound = 0,
      file: assetUrl,
    } = asset;

    const activeRegionLength = activeRegionUpperBound - activeRegionLowerBound;

    // per Halsey we should always use mp3s; also we avoid specifying http/https to avoid mixed-content warnings
    const mp3Url = cleanAudioURL(assetUrl);

    const decoratedAsset = {
      locationPoint: coordsToPoints(asset),
      playCount: 0,
      activeRegionLength,
      activeRegionUpperBound,
      activeRegionLowerBound,
      ...asset,
      file: mp3Url,
    };

    const timedAsset = timedAssetLookup[asset.id];

    if (timedAsset) {
      decoratedAsset.timedAssetStart = timedAsset.start;
      decoratedAsset.timedAssetEnd = timedAsset.end;
    }

    return decoratedAsset;
  };
};

export class AssetPool {
  constructor({
    assets = [],
    timedAssets = [],
    filterChain = roundwareDefaultFilterChain,
    sortMethods = [],
    mixParams = {},
  }) {
    this.assets = assets.map(assetDecorationMapper(timedAssets));
    this.assetSorter = new AssetSorter({ sortMethods, ...mixParams });
    this.playingTracks = {};
    this.mixParams = mixParams;
    this.filterChain = filterChain;
    this.sortAssets();
  }

  nextForTrack(track, { filterOutAssets = [], ...stateParams }) {
    const mixParams = {
      ...track.mixParams,
      ...stateParams,
      ...this.mixParams,
    };
    console.log(
      `picking asset for ${track} from ${
        this.assets.length
      }, params = ${JSON.stringify(mixParams)}`
    );
    const rankedAssets = this.assets.reduce((rankings, asset) => {
      if (filterOutAssets.includes(asset)) return rankings;
      const rank = this.filterChain(asset, mixParams);

      if (rank) {
        rankings[rank] = rankings[rank] || [];
        rankings[rank].push(asset);
      }

      return rankings;
    }, {});

    const rankingGroups = Object.keys(rankedAssets).map((a) =>
      Number.parseInt(a)
    );

    if (rankingGroups === []) {
      console.warn("All assets filtered out");
      return;
    }

    const topPriorityRanking = rankingGroups.sort()[0];

    // play least-recently played assets first
    const priorityAssets = rankedAssets[topPriorityRanking] || [];
    priorityAssets.sort((a, b) => b.playCount - a.playCount);

    const nextAsset = priorityAssets.pop();
    if (nextAsset) nextAsset.playCount++;

    return nextAsset;
  }

  sortAssets() {
    this.assetSorter.sort(this.assets);
  }
}
