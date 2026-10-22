import { union } from "lodash";
import { AssetPriorityType, roundwareDefaultFilterChain } from "./assetFilters";
import { AssetSorter } from "./assetSorter";
import { InvalidArgumentError } from "./errors/app.errors";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { ILookupTable, IMixParams, ITimedAssetData } from "./types";
import { IAssetData, IDecoratedAsset } from "./types/asset";
import { cleanAudioURL, coordsToPoints } from "./utils";

/** What a refresh may change on an asset already in the pool: where it is
 *  (a moving asset moves), and what a team member can edit. Not the pool's
 *  own playback state (playCount, lastListenTime, status). */
const REFRESHED_FIELDS = [
  "latitude",
  "longitude",
  "locationPoint",
  "shape",
  "updated_at",
  "moving",
  "path",
  "volume",
  "weight",
  "description",
  "tag_ids",
  "submitted",
] as const;

export class AssetPool {
  assetSorter: AssetSorter;
  playingTracks: {};
  mixParams: IMixParams;
  filterChain: (
    asset: IDecoratedAsset,
    mixParams: IMixParams
  ) => AssetPriorityType;
  assets: IDecoratedAsset[] = [];

  constructor({
    assets = [],
    timedAssets = [],
    filterChain = roundwareDefaultFilterChain,
    sortMethods = [],
    mixParams = {},
  }: {
    assets?: IAssetData[];
    timedAssets?: ITimedAssetData[];
    filterChain?: (
      asset: IDecoratedAsset,
      mixParams: IMixParams
    ) => AssetPriorityType;
    sortMethods?: string[];
    mixParams?: IMixParams;
  }) {
    this.assetSorter = new AssetSorter({
      sortMethods,
      ...mixParams,
    });
    this.playingTracks = {};
    this.mixParams = mixParams;
    this.filterChain = filterChain;
    this.updateAssets(assets, timedAssets);
    this.sortAssets();
  }

  updateAssets(assets: IAssetData[] = [], timedAssets: ITimedAssetData[] = []) {
    if (!Array.isArray(assets) || !Array.isArray(timedAssets)) {
      throw new InvalidArgumentError(
        "assets/timedAssets",
        "array",
        "updateAssets() in AssetPool"
      );
    }

    // Only audio can be played. Photos and text arrive here too (they are
    // assets like any other, often attached to a recording, docs/014 in
    // roundware-server-v3); now that they carry files, decorating them would
    // queue a .jpg or .txt for playback. No media_type means audio (v2 data).
    let newAssets = assets
      .filter((a) => (a.media_type ?? "audio") === "audio")
      .map(assetDecorationMapper(timedAssets));
    // New assets are added. One already in the pool keeps its playback state
    // (play count, last listen, paused) but takes the server's latest values:
    // a moving asset's position (server docs/030), and edits.
    newAssets.forEach((asset) => {
      const existing = this.assets.find((a) => a.id === asset.id);
      if (!existing) {
        this.add(asset);
        return;
      }
      for (const key of REFRESHED_FIELDS) {
        if (key in asset) (existing as any)[key] = (asset as any)[key];
      }
    });
  }

  nextForTrack(
    track: PlaylistAudiotrack,
    {
      elapsedSeconds,
      filterOutAssets = [],
      listenTagIds = [],
      ...stateParams
    }: {
      elapsedSeconds: number;
      listenerPoint?: IMixParams[`listenerPoint`];
      listenTagIds?: IMixParams[`listenTagIds`];
      filterOutAssets: IAssetData[];
    }
  ): IDecoratedAsset | undefined {
    const mixParams: IMixParams = {
      ...this.mixParams,
      ...track.mixParams,
      ...stateParams,
      listenTagIds: union(
        this.mixParams.listenTagIds,
        track.mixParams?.listenTagIds,
        listenTagIds
      ),
      ...track.trackOptions,
    };

    interface IRankedAssets {
      [rank: number]: IDecoratedAsset[];
    }
    const rankedAssets = this.assets.reduce(
      (rankings: IRankedAssets, asset) => {
        if (filterOutAssets.includes(asset)) return rankings;

        const rank = this.filterChain(asset, mixParams);

        if (rank !== false) {
          rankings[rank] = rankings[rank] || [];
          rankings[rank].push(asset);
        }
        return rankings;
      },
      {}
    );

    const rankingGroups = Object.keys(rankedAssets).map((a) =>
      Number.parseInt(a)
    );

    if (Array.isArray(rankingGroups) && rankingGroups.length < 1) {
      console.warn("All assets filtered out");
      return;
    }

    const topPriorityRanking = rankingGroups.sort()[0];

    // play least-recently played assets first

    const priorityAssets: IDecoratedAsset[] =
      rankedAssets[topPriorityRanking] || [];

    // this.assetSorter.sort(priorityAssets);
    priorityAssets.sort((a, b) => b.playCount - a.playCount);

    const nextAsset = priorityAssets.pop();
    // if new asset is not an asset which was paused previously
    // then release all the paused assets
    if (!mixParams.keepPausedAssets) {
      if (nextAsset?.status !== "resumed") {
        this.assets.forEach((a) => {
          if (a.status === "paused" && a.pausedFromTrackId === track.trackId) {
            track.pausedAssetId = null;
            a.status = undefined;
            a.playCount++;
          }
        });
      }
    }
    return nextAsset;
  }

  sortAssets() {
    this.assetSorter.sort(this.assets);
  }

  add(asset: IDecoratedAsset) {
    this.assets.push(asset);
    this.sortAssets();
  }
}

export default AssetPool;

// add new fields to assets after they have been downloaded from the API to be used by rest of the mixing code
// also rewrite .wav as .mp3
export function assetDecorationMapper(timedAssets: ITimedAssetData[]) {
  const timedAssetLookup = timedAssets.reduce(
    (lookupTable: ILookupTable, timedAsset: ITimedAssetData) => ({
      ...lookupTable,
      [timedAsset.asset_id]: timedAsset,
    }),
    {}
  );

  return (asset: IAssetData): IDecoratedAsset => {
    const {
      start_time: activeRegionLowerBound = 0,
      end_time: activeRegionUpperBound = 0,
      file: assetUrl,
    } = asset;

    const activeRegionLength = activeRegionUpperBound - activeRegionLowerBound;

    // per Halsey we should always use mp3s; also we avoid specifying http/https to avoid mixed-content warnings
    if (!assetUrl) {
      console.warn(`asset ${asset.id} has no file URL, skipping`);
      return { ...asset, playCount: 0 } as unknown as IDecoratedAsset;
    }
    const mp3Url = cleanAudioURL(assetUrl);

    const decoratedAsset: IDecoratedAsset = {
      locationPoint: coordsToPoints({
        latitude: asset.latitude!,
        longitude: asset.longitude!,
      }),
      playCount: 0,
      activeRegionLength,
      activeRegionUpperBound,
      activeRegionLowerBound,
      ...asset,
      created_at: asset.created_at ? new Date(asset.created_at) : new Date(),
      file: mp3Url,
    };

    const timedAsset = timedAssetLookup[asset.id!];

    if (timedAsset) {
      decoratedAsset.timedAssetStart = timedAsset.start_sec!;
      decoratedAsset.timedAssetEnd = timedAsset.end_sec!;
    }

    return decoratedAsset;
  };
}
