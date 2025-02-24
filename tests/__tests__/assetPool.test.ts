import AssetPool, { assetDecorationMapper } from "../../src/assetPool";
import { ITimedAssetData } from "../../src/types/index";
import { getRandomAssetData } from "../__mocks__/assetData";

import { AssetSorter } from "../../src/assetSorter";
import { silenceAudioBase64 } from "../../src/playlistAudioTrack";
import { InvalidArgumentError } from "../../src/errors/app.errors";
jest.mock(`../../src/assetSorter`);
const mockAssetSorter = AssetSorter as jest.MockedClass<typeof AssetSorter>;

describe("AssetPool", () => {
  // instantiation;
  test("should instantiate asset pool", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(10),
    });

    expect(mockAssetSorter).toHaveBeenCalledTimes(1);
    console.log(mockAssetSorter.mock.calls);

    expect(assetPool).toBeInstanceOf(AssetPool);
    silenceAudioBase64;
  });

  test("should throw error if arguments of updateAssets() is not array", () => {
    const assetPool = new AssetPool({
      assets: getRandomAssetData(10),
      timedAssets: [],
    });

    expect(() => {
      // @ts-expect-error
      assetPool.updateAssets(1, 2);
    }).toThrowError(InvalidArgumentError);
  });

  test("should decorate assets", () => {
    const testAssetData = getRandomAssetData(10);
    const timedAssets: ITimedAssetData[] = [
      {
        asset_id: testAssetData[0].id,

        start: 23,
        end: 10,
      },
    ];
    const decoratedAssets = testAssetData.map(
      assetDecorationMapper(timedAssets)
    );

    expect(decoratedAssets[0].timedAssetStart).toBe(23);

    expect(decoratedAssets[0].timedAssetEnd).toBe(10);
  });
});
