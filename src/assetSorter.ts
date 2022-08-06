import { sortByProjectDefault } from "./sortMethods";
import { IAssetData } from "./types/asset";

function mapSortMethods(
  sortMethodNames: ("random" | "by_weight" | "by_likes")[]
): ((assetData: IAssetData[]) => unknown)[] {
  return sortMethodNames.map((name) => sortByProjectDefault(name));
}

export class AssetSorter {
  sortMethods: ((assetsArray: IAssetData[]) => void)[];
  constructor({
    sortMethods,
    ordering = "random",
  }: {
    sortMethods?: ("random" | "by_weight" | "by_likes")[];
    ordering?: "random" | "by_weight" | "by_likes";
  }) {
    if (!sortMethods?.length) {
      this.sortMethods = [sortByProjectDefault(ordering)];
    } else {
      this.sortMethods = mapSortMethods(sortMethods);
    }
  }

  sort(assets: IAssetData[]): void {
    this.sortMethods.forEach((sortMethod) => sortMethod(assets));
  }
}
