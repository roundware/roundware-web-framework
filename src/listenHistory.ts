import { IAssetData } from "./types/asset";
import { getItem, setItem } from "localforage";

type IAssetHistory = IAssetData & {
  addedAt?: number;
  listenedAt?: number;
};
export class ListenHistory {
  assets: IAssetHistory[] = [];

  constructor() {
    // load earlier history from indexedDB
    getItem<IAssetData>(`listenHistory`).then((assets) => {
      if (Array.isArray(assets)) this.assets = [...assets, this.assets];
    });
  }

  addAsset(asset: IAssetData) {
    let historyItem: IAssetHistory = asset;
    historyItem.addedAt = Date.now();

    this.assets.push(historyItem);
    // add to indexedDB
    setItem(`listenHistory`, this.assets);
  }

  clear() {
    this.assets = [];
    setItem(`listenHistory`, this.assets);
  }
}
