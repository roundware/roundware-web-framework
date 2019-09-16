import * as sortMethods from './sortMethods';

import {
  assetFilters
} from './assetFilters';

const mapFilterMethods = filterNamesOrFuncs => filterNamesOrFuncs.map(f => typeof f === 'function' ? f : assetFilters[f]);
const prefilterAssets = (assets,ineligibleAssets) => assets.filter(candidateAsset => !!ineligibleAssets[candidateAsset]);

function mapSortMethods(sortMethodNames) {
  return sortMethodNames.map(name => sortMethods[name]);
}

export class AssetPool {
  constructor({ assets = [], filters = [], sortMethods = [], mixParams = {} }) {
    this.assets = assets;
    this.sortMethods = mapSortMethods(sortMethods);
    this.playingTracks = {};
    this.sortAssets();

    const materializedFilters = mapFilterMethods(filters);
    this.filterChain = assetFilters.allAssetFilter(materializedFilters,{ ...mixParams });
  }

  nextForTrack(track,{ filterOutAssets, ...stateParams }) {
    const prefilteredAssets = prefilterAssets(this.assets,filterOutAssets);

    const rankedAssets = prefilteredAssets.reduce((rankings,asset) => {
      const rank = this.filterChain(asset,stateParams);

      console.info('NEXTFORTRACK',{ asset, stateParams, rank });

      if (rank) {
        rankings[rank] = rankings[rank] || [];
        rankings[rank].push(asset);
      }

      return rankings;
    },{});

    const sortedRankings = Object.keys(rankedAssets).sort();
    const topPriorityRanking = sortedRankings[0];

    if (!topPriorityRanking) {
      console.warn('All assets filtered out');
      return;
    }

    // play least-recently played assets first
    const priorityAssets = rankedAssets[topPriorityRanking].
      filter((a,b) => a.playCount <= b.playCount);

    console.info('PRIORITY ASSETS',priorityAssets);

    const nextAsset = priorityAssets.pop();

    console.info('NEXT ASSET',nextAsset);
    return nextAsset;
  }

  sortAssets() {
    this.sortMethods.forEach(sortMethod => sortMethod(this.assets));
  }
}
