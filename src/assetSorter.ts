import { sortByProjectDefault } from "./sortMethods";
import { IAssetData } from "./types/asset";

function mapSortMethods(
  sortMethodNames: ("random" | "by_weight" | "by_likes" | string)[]
): ((assetData: IAssetData[]) => unknown)[] {
  return sortMethodNames.map((name) =>
    sortByProjectDefault(name as "random" | "by_weight" | "by_likes")
  );
}

export class AssetSorter {
  sortMethods: ((assetsArray: IAssetData[]) => void)[];
  constructor({
    sortMethods,
    ordering = "random",
  }: {
    sortMethods?: ("random" | "by_weight" | "by_likes" | string)[];
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
