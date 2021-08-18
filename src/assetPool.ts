import { AssetSorter } from "./assetSorter";
import { roundwareDefaultFilterChain } from "./assetFilters";
import { coordsToPoints, cleanAudioURL } from "./utils";
import { Point } from "@turf/helpers";
import {
  IAssetData,
  ILookupTable,
  IMixParams,
  ITimedAssetData,
  ITrack,
} from "./types";

// add new fields to assets after they have been downloaded from the API to be used by rest of the mixing code
// also rewrite .wav as .mp3
export const assetDecorationMapper = (timedAssets: ITimedAssetData[]) => {
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
  //playingTracks: {};
  mixParams: IMixParams;
  filterChain: (asset: IAssetData, mixParams: IMixParams) => number;
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
    filterChain: (asset: IAssetData, mixParams: IMixParams) => number;
    sortMethods: unknown[];
    mixParams: IMixParams;
  }) {
    this.assets = assets;
    this.updateAssets(assets, timedAssets);

    this.assetSorter = new AssetSorter({
      sortMethods,
      ordering: mixParams.ordering,
    });
    //this.playingTracks = {};
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
      listenerPoint?: IMixParams[`listenerPoint`];
      listenTagIds?: IMixParams[`listenTagIds`];
      filterOutAssets: IAssetData[];
    }
  ): IAssetData | undefined {
    const mixParams: IMixParams = {
      ...this.mixParams,
      ...track.mixParams,
      ...stateParams,
    };
    console.log(
      `picking asset for ${track} from ${
        this.assets.length
      }, params = ${JSON.stringify(mixParams)}`
    );
    const rankedAssets = this.assets.reduce<IAssetData[]>((rankings, asset) => {
      if (filterOutAssets.includes(asset)) return rankings;
      const rank = this.filterChain(asset, mixParams);

      if (rank) {
        rankings[rank] = rankings[rank] || [];

        rankings[rank] = asset;
      }

      return rankings;
    }, []);

    const rankingGroups = Object.keys(rankedAssets).map((a) =>
      Number.parseInt(a)
    );

    if (rankingGroups === []) {
      console.warn("All assets filtered out");
      return;
    }

    const topPriorityRanking = rankingGroups.sort()[0];

    // play least-recently played assets first

    const priorityAssets: IAssetData[] =
      [rankedAssets[topPriorityRanking]] || [];

    priorityAssets.sort(
      (a: IAssetData, b: IAssetData) => b.playCount! - a.playCount!
    );

    const nextAsset: IAssetData | undefined = priorityAssets.pop();
    if (
      typeof nextAsset !== "undefined" &&
      typeof nextAsset.playCount !== "undefined"
    ) {
      nextAsset.playCount++;
    }

    return nextAsset;
  }

  sortAssets() {
    this.assetSorter.sort(this.assets);
  }

  add(asset: IAssetData) {
    this.assets.push(asset);
    this.sortAssets();
  }
}
