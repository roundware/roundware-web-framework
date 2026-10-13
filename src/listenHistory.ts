import { IAssetData } from "./types/asset";
import localforage from "localforage";

type IAssetHistory = IAssetData & {
  addedAt?: number;
  listenedAt?: number;
};
export class ListenHistory {
  assets: IAssetHistory[] = [];
  /** Each project its own history: projects served from one address (a
   *  local build, a preview) used to share one. */
  private key: string;

  constructor(projectId?: number) {
    this.key = projectId ? `listenHistory:${projectId}` : `listenHistory`;
    // load earlier history from indexedDB
    localforage.getItem<IAssetHistory[]>(this.key).then((assets) => {
      if (Array.isArray(assets))
        this.assets = [...assets, ...this.assets].sort(
          (a, b) => b.addedAt! - a.addedAt!
        );
    });
  }

  addAsset(asset: IAssetData) {
    // A copy, stamped: writing the time onto the pool's own asset changed
    // every earlier entry for it too, and stored entries come back as
    // separate copies anyway.
    const historyItem: IAssetHistory = { ...asset, addedAt: Date.now() };

    this.assets.push(historyItem);
    // add to indexedDB
    localforage.setItem(this.key, this.assets);
  }

  clear() {
    this.assets = [];
    localforage.setItem(this.key, this.assets);
  }
}
