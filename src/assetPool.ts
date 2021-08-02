import { AssetSorter } from "./assetSorter";
import { roundwareDefaultFilterChain } from "./assetFilters";
import { coordsToPoints, cleanAudioURL } from "./utils";
import {
  IAssetData,
  ILookupTable,
  IMixParams,
  ITimedAssetData,
  ITrack,
} from "./types";

// add new fields to assets after they have been downloaded from the API to be used by rest of the mixing code
// also rewrite .wav as .mp3
const assetDecorationMapper = (timedAssets: ITimedAssetData[]) => {
  const timedAssetLookup = timedAssets.reduce(
    (lookupTable: ILookupTable, timedAsset: ITimedAssetData) => ({
      ...lookupTable,
      [timedAsset.asset_id]: timedAsset,
    }),
    {}
  );

  return (asset: IAssetData) => {
    const {
      start_time: activeRegionLowerBound = 0,
      end_time: activeRegionUpperBound = 0,
      file: assetUrl,
    } = asset;

    const activeRegionLength = activeRegionUpperBound - activeRegionLowerBound;

    // per Halsey we should always use mp3s; also we avoid specifying http/https to avoid mixed-content warnings
    if (!assetUrl) throw new Error(`assetUrl was undefined!`);
    const mp3Url = cleanAudioURL(assetUrl);

    const decoratedAsset: IAssetData = {
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

export class AssetPool {
  assetSorter: AssetSorter;
  playingTracks: {};
  mixParams: {};
  filterChain: CallableFunction;
  assets: IAssetData[];

  constructor({
    assets = [],
    timedAssets = [],
    filterChain = roundwareDefaultFilterChain,
    sortMethods = [],
    mixParams = {},
  }: {
    assets: IAssetData[];
    timedAssets: ITimedAssetData[];
    filterChain: CallableFunction;
    sortMethods: unknown[];
    mixParams: IMixParams;
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

  updateAssets(assets: IAssetData[] = [], timedAssets: ITimedAssetData[] = []) {
    this.assets = assets.map(assetDecorationMapper(timedAssets));
  }

  nextForTrack(
    track: ITrack,
    {
      elapsedSeconds: number,
      filterOutAssets = [],
      ...stateParams
    }: {
      elapsedSeconds: number;
      filterOutAssets: IAssetData[];
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
      (rankings: IAssetData, asset: IAssetData) => {
        if (filterOutAssets.includes(asset)) return rankings;
        const rank: IAssetData[] = this.filterChain(asset, mixParams);

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
    // @ts-ignore not sure why sort is used on type object
    priorityAssets.sort(
      (a: IAssetData, b: IAssetData) => b.playCount! - a.playCount!
    );

    // @ts-ignore
    const nextAsset = priorityAssets.pop();
    if (nextAsset) nextAsset.playCount++;

    return nextAsset as IAssetData;
  }

  sortAssets() {
    this.assetSorter.sort(this.assets);
  }

  add(asset: IAssetData) {
    this.assets.push(asset);
    this.sortAssets();
  }
}
