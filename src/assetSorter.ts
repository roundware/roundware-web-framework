import * as sortMethodCollection from "./sortMethods";
import { IAssetData } from "./types";
import { isEmpty } from "./utils";

function mapSortMethods(sortMethodNames: string[]): unknown[] {
  // @ts-ignore
  return sortMethodNames.map((name) => sortMethodCollection[name]);
}

export interface IAssetSorter {
  sort(assets: IAssetData[]): void;
  sortMethods: unknown[];
}

export class AssetSorter implements IAssetSorter {
  sortMethods: ((assetsArray: any) => void)[];

  constructor({
    sortMethods = [],
    ordering = "random",
  }: {
    sortMethods: any[];
    ordering: string;
  }) {
    if (isEmpty(sortMethods)) {
      this.sortMethods = [sortMethodCollection.sortByProjectDefault(ordering)];
    } else {
      // @ts-ignore
      this.sortMethods = mapSortMethods(sortMethods);
    }

    //console.info({ ordering, sortMethods, thisSortMethods: this.sortMethods });
  }

  sort(assets: IAssetData[]): void {
    this.sortMethods.forEach((sortMethod) => sortMethod(assets));
  }
}
