import { AssetSorter } from "../../src/assetSorter";
import { sortByLikes, sortByWeight, sortRandomly } from "../../src/sortMethods";
import { IAssetData } from "../../src/types/asset";

describe("assetSorter", () => {
  test(`should instantiate assetSorter`, () => {
    const assetSorter = new AssetSorter({
      sortMethods: [],
      ordering: "random",
    });
    expect(assetSorter).toBeInstanceOf(AssetSorter);
  });
  test(`should set sortMethods based given ordering string`, () => {
    const assetSorter = new AssetSorter({
      sortMethods: [],
      ordering: "random",
    });
    expect(assetSorter.sortMethods).toEqual([sortRandomly]);

    const assetSorter2 = new AssetSorter({
      sortMethods: [],
      ordering: "by_weight",
    });
    expect(assetSorter2.sortMethods).toEqual([sortByWeight]);

    const assetSorter3 = new AssetSorter({
      sortMethods: [],

      ordering: "by_likes",
    });
    expect(assetSorter3.sortMethods).toEqual([sortByLikes]);
  });

  test(`should set sortMethods based given sortMethods array`, () => {
    const assetSorter = new AssetSorter({
      sortMethods: ["random", "by_weight"],
      ordering: "random",
    });
    expect(assetSorter.sortMethods).toEqual([sortRandomly, sortByWeight]);
  });

  test(`should ignore ordering if sortMethods is given`, () => {
    const assetSorter = new AssetSorter({
      sortMethods: ["by_weight"],
      ordering: "random",
    });
    expect(assetSorter.sortMethods).toEqual([sortByWeight]);
  });

  test(`should sort given assets based on sortMethods`, () => {
    const assetSorter = new AssetSorter({
      sortMethods: ["by_weight"],
      ordering: "random",
    });
    const assets: IAssetData[] = [
      { weight: 3 },
      { weight: 2 },
      { weight: 1 },
    ] as IAssetData[];
    assetSorter.sort(assets);
    expect(assets).toEqual([{ weight: 1 }, { weight: 2 }, { weight: 3 }]);
  });

  test(`ordering should default to random`, () => {
    const assetSorter = new AssetSorter({});
    expect(assetSorter.sortMethods).toEqual([sortRandomly]);
  });
});
