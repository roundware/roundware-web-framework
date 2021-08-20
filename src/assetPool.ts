import { roundwareDefaultFilterChain } from "./assetFilters";
import { AssetSorter } from "./assetSorter";
import {
  InvalidArgumentError,
  RoundwareFrameworkError,
} from "./errors/app.errors";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { IAssetData, ILookupTable, IMixParams, ITimedAssetData } from "./types";
import { cleanAudioURL, coordsToPoints } from "./utils";

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
        latitude: asset.latitude!,
        longitude: asset.longitude!,
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
  mixParams: IMixParams;
  filterChain: (asset: IAssetData, mixParams: IMixParams) => number;
  assets!: IAssetData[];

  constructor({
    assets = [],
    timedAssets = [],
    filterChain = roundwareDefaultFilterChain,
    sortMethods = [],
    mixParams = {},
  }: {
    assets?: IAssetData[];
    timedAssets?: ITimedAssetData[];
    filterChain?: (asset: IAssetData, mixParams: IMixParams) => number;
    sortMethods?: unknown[];
    mixParams?: IMixParams;
  }) {
    if (!Array.isArray(assets))
      throw new InvalidArgumentError(
        "assets",
        "array of IAssetData",
        "instantiation assetPool"
      );
    if (!Array.isArray(timedAssets))
      throw new InvalidArgumentError(
        "timedAssets",
        "array of ITimedAssetData",
        "instantiation assetPool"
      );
    this.updateAssets(assets, timedAssets);

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
    if (Array.isArray(assets) && Array.isArray(timedAssets)) {
      if (assets.length > 0 && timedAssets.length > 0)
        this.assets = assets.map(assetDecorationMapper(timedAssets));
    } else
      throw new InvalidArgumentError(
        "assets/timedAssets",
        "array",
        "updateAssets() in AssetPool"
      );
  }

  nextForTrack(
    track: PlaylistAudiotrack,
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
        // @ts-ignore
        rankings[rank].push(asset);
      }

      return rankings;
      // @ts-ignore
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

    // @ts-ignore
    const priorityAssets: IAssetData[] = rankedAssets[topPriorityRanking] || [];

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
