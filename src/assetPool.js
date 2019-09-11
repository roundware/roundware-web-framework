import * as sortMethods from './sortMethods';

import {
  assetFilters
} from './assetFilters';

function mapFilterMethods(filterNamesOrFuncs) {
  return filterNamesOrFuncs.map(f => typeof f === 'function' ? f : assetFilters[f]);
}

function prefilterAssets(assets,ineligibleAssets) {
  return assets.filter(candidateAsset => !!ineligibleAssets[candidateAsset]);
}

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
    this.filterChain = assetFilters.AllAssetFilter(materializedFilters,{ ...mixParams });
  }

  nextForTrack(track,{ filterOutAssets }) {
    const prefilteredAssets = prefilterAssets(this.assets,filterOutAssets);

    const rankedAssets = prefilteredAssets.reduce((rankings,asset) => {
      const rank = this.filterChain(asset);

      console.info('ASSET',asset,'RANK',rank);

      rankings[rank] = rankings[rank] || [];
      rankings[rank].push(asset);

      return rankings;
    },{});

    const sortedRankings = Object.keys(rankedAssets).sort();
    const topPriorityRanking = sortedRankings[0];

    // play less played assets first
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
