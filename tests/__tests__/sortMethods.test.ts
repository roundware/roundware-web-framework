import { cloneDeep } from "lodash";
import {
  sortByLikes,
  sortByProjectDefault,
  sortByWeight,
  sortRandomly,
} from "../../src/sortMethods";
import { IAssetData } from "../../src/types/asset";
import { getRandomAssetData } from "../__mocks__/assetData";
describe("sortMethods", () => {
  test("sortRandomly should return a random array", () => {
    const assets = getRandomAssetData(10);
    const testAssets = cloneDeep(assets);
    sortRandomly(assets);
    expect(testAssets.map((t) => t.id)).not.toEqual(assets.map((t) => t.id));
    expect(testAssets).toEqual(expect.arrayContaining(assets));
  });

  test(`sortByWeight should sort by weight`, () => {
    const testAssets = [{ weight: 3 }, { weight: 2 }, { weight: 1 }];
    sortByWeight(testAssets as IAssetData[]);
    expect(testAssets).toEqual([{ weight: 1 }, { weight: 2 }, { weight: 3 }]);
  });

  test(`should shift undefined weights to end`, () => {
    const testAssetsWithUndefinedWeight = [
      { weight: 3 },
      { weight: undefined },
      { weight: 1 },
      { weight: undefined },
    ];
    sortByWeight(testAssetsWithUndefinedWeight as IAssetData[]);
    expect(testAssetsWithUndefinedWeight).toEqual([
      { weight: 1 },
      { weight: 3 },
      { weight: undefined },
      { weight: undefined },
    ]);
  });

  test(`should warn "not implement yet" when sortByLikes`, () => {
    console.warn = jest.fn();
    sortByLikes([]);
    expect(console.warn).toHaveBeenCalledWith(
      "sortByLikes not implemented yet"
    );
  });

  test(`should return appropriate sort function from given ordering`, () => {
    expect(sortByProjectDefault("by_weight")).toBe(sortByWeight);
    expect(sortByProjectDefault("by_likes")).toBe(sortByLikes);
    expect(sortByProjectDefault("random")).toBe(sortRandomly);
  });
});
