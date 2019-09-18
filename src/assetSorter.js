import * as sortMethodCollection from './sortMethods';
import { isEmpty } from './utils';

function mapSortMethods(sortMethodNames) {
  return sortMethodNames.map(name => sortMethodCollection[name]);
}


export class AssetSorter {
  constructor({ sortMethods = [], ordering = 'random' }) {
    if (isEmpty(sortMethods)) {
      this.sortMethods = [sortMethodCollection.sortByProjectDefault(ordering)];
    } else {
      this.sortMethods = mapSortMethods(sortMethods);
    }

    console.info({ ordering, sortMethods, thisSortMethods: this.sortMethods });
  }

  sort(assets) {
    this.sortMethods.forEach(sortMethod => sortMethod(assets));
  }
}

