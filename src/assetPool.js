import * as sortMethods from './sortMethods';

import {
  assetFilters
} from './assetFilters';

const mapFilterMethods = filterNamesOrFuncs => filterNamesOrFuncs.map(f => typeof f === 'function' ? f : assetFilters[f]);

function mapSortMethods(sortMethodNames) {
  return sortMethodNames.map(name => sortMethods[name]);
}

export class AssetPool {
  constructor({ assets = [], filters = [], sortMethods = [], mixParams = {} }) {
    this.assets = assets.map(a => ({ playCount: 0, ...a }));
    
    this.sortMethods = mapSortMethods(sortMethods);
    this.playingTracks = {};
    this.sortAssets();

    const materializedFilters = mapFilterMethods(filters);

    this.filterChain = assetFilters.allAssetFilter(materializedFilters,{ ...mixParams });
  }

  nextForTrack(track,{ filterOutAssets = [], ...stateParams }) {
    const rankedAssets = this.assets.reduce((rankings,asset) => {
      if (filterOutAssets.includes(asset)) return rankings;

      const rank = this.filterChain(asset,stateParams);

      if (rank) {
        rankings[rank] = rankings[rank] || [];
        rankings[rank].push(asset);
      }

      return rankings;
    },{});

    const rankingGroups = Object.keys(rankedAssets);

    if (rankingGroups === []) {
      console.warn('All assets filtered out');
      return;
    }

    const topPriorityRanking = rankingGroups.sort()[0];

    // play least-recently played assets first
    const priorityAssets = rankedAssets[topPriorityRanking];
    priorityAssets.sort((a,b) => b.playCount - a.playCount);

    const nextAsset = priorityAssets.pop();
    nextAsset.playCount++;

    return nextAsset;
  }

  sortAssets() {
    this.sortMethods.forEach(sortMethod => sortMethod(this.assets));
  }
}
