import { AssetSorter } from "./assetSorter";
import { roundwareDefaultFilterChain } from "./assetFilters";
import { coordsToPoints, cleanAudioURL } from "./utils";
import { AssetT, LookupTableT, MixParams, TimedAssetT, TrackT } from "./types";
import { IAssetPool } from "./types/assetPool";

// add new fields to assets after they have been downloaded from the API to be used by rest of the mixing code
// also rewrite .wav as .mp3
const assetDecorationMapper = (timedAssets: TimedAssetT[]) => {
  const timedAssetLookup = timedAssets.reduce(
    (lookupTable: LookupTableT, timedAsset: TimedAssetT) => ({
      ...lookupTable,
      [timedAsset.asset_id]: timedAsset,
    }),
    {}
  );

  return (asset: AssetT) => {
    const {
      start_time: activeRegionLowerBound = 0,
      end_time: activeRegionUpperBound = 0,
      file: assetUrl,
    } = asset;

    const activeRegionLength = activeRegionUpperBound - activeRegionLowerBound;

    // per Halsey we should always use mp3s; also we avoid specifying http/https to avoid mixed-content warnings
    if (!assetUrl) throw new Error(`assetUrl was undefined!`);
    const mp3Url = cleanAudioURL(assetUrl);

    const decoratedAsset: AssetT = {
      locationPoint: coordsToPoints({
        latitude: asset.latitude || 1,
        longitude: asset.longitude || 1,
      }),
      playCount: 0,
      activeRegionLength,
      activeRegionUpperBound,
      activeRegionLowerBound,
      ...asset,
      created: asset.created ? new Date(asset.created) : undefined,
      file: mp3Url,
    };

    const timedAsset = timedAssetLookup[asset.id!];

    if (timedAsset) {
      decoratedAsset.timedAssetStart = timedAsset.start;
      decoratedAsset.timedAssetEnd = timedAsset.end;
    }

    return decoratedAsset;
  };
};

export class AssetPool implements IAssetPool {
  assetSorter: AssetSorter;
  playingTracks: {};
  mixParams: {};
  filterChain: CallableFunction;
  assets: AssetT[];

  constructor({
    assets = [],
    timedAssets = [],
    filterChain = roundwareDefaultFilterChain,
    sortMethods = [],
    mixParams = {},
  }: {
    assets: AssetT[];
    timedAssets: TimedAssetT[];
    filterChain: CallableFunction;
    sortMethods: unknown[];
    mixParams: MixParams;
  }) {
    this.assets = assets;
    this.updateAssets(assets, timedAssets);

    if (typeof mixParams.ordering !== "string")
      throw new Error(`Please pass ordering in mixParams`);
    this.assetSorter = new AssetSorter({
      sortMethods,
      ordering: mixParams.ordering,
    });
    this.playingTracks = {};
    this.mixParams = mixParams;
    this.filterChain = filterChain;
    this.sortAssets();
  }

  updateAssets(assets: AssetT[] = [], timedAssets: TimedAssetT[] = []) {
    this.assets = assets.map(assetDecorationMapper(timedAssets));
  }

  nextForTrack(
    track: TrackT,
    {
      filterOutAssets = [],
      ...stateParams
    }: {
      filterOutAssets: AssetT[];
    }
  ) {
    const mixParams = {
      ...this.mixParams,
      ...track.mixParams,
      ...stateParams,
    };
    console.log(
      `picking asset for ${track} from ${
        this.assets.length
      }, params = ${JSON.stringify(mixParams)}`
    );
    const rankedAssets = this.assets.reduce(
      (rankings: AssetT, asset: AssetT) => {
        if (filterOutAssets.includes(asset)) return rankings;
        const rank: AssetT[] = this.filterChain(asset, mixParams);

        if (rank) {
          // @ts-ignore
          rankings[rank] = rankings[rank] || [];
          // @ts-ignore
          rankings[rank].push(asset);
        }

        return rankings;
      },
      {}
    );

    const rankingGroups = Object.keys(rankedAssets).map((a) =>
      Number.parseInt(a)
    );

    if (rankingGroups === []) {
      console.warn("All assets filtered out");
      return;
    }

    const topPriorityRanking = rankingGroups.sort()[0];

    // play least-recently played assets first

    // @ts-ignore
    const priorityAssets = rankedAssets[topPriorityRanking] || [];
    priorityAssets.sort((a: AssetT, b: AssetT) => b.playCount! - a.playCount!);

    const nextAsset = priorityAssets.pop();
    if (nextAsset) nextAsset.playCount++;

    return nextAsset as AssetT;
  }

  sortAssets() {
    this.assetSorter.sort(this.assets);
  }

  add(asset: AssetT) {
    this.assets.push(asset);
    this.sortAssets();
  }
}
