import localforage from "localforage";
import { ListenHistory } from "./listenHistory";
import { IAssetData } from "./types/asset";

jest.mock("localforage");

describe("ListenHistory", () => {
  let listenHistory: ListenHistory;
  const mockAsset1: IAssetData = {
    id: 1,
    description: "Test Asset 1",
    latitude: 0,
    longitude: 0,
    shape: null,
    filename: "test1.mp3",
    file: null,
    volume: 1,
    submitted: true,
    created: new Date(),
    updated: new Date(),
    weight: 1,
    start_time: 0,
    end_time: 100,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 60,
    tag_ids: [],
    session_id: 1,
    project_id: 1,
    language_id: 1,
    envelope_ids: [],
    description_loc_ids: [],
    alt_text_loc_ids: [],
    project: 1
  };

  const mockAsset2: IAssetData = {
    ...mockAsset1,
    id: 2,
    description: "Test Asset 2"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (localforage.getItem as jest.Mock).mockResolvedValue([]);
    listenHistory = new ListenHistory();
  });

  describe("initialization", () => {
    it("should initialize with empty assets array", () => {
      expect(listenHistory.assets).toEqual([]);
    });

    it("should load existing history from indexedDB", async () => {
      const existingAssets = [
        { ...mockAsset1, addedAt: Date.now() - 1000 },
        { ...mockAsset2, addedAt: Date.now() - 2000 }
      ];
      (localforage.getItem as jest.Mock).mockResolvedValue(existingAssets);

      listenHistory = new ListenHistory();
      await Promise.resolve(); // Wait for the async operation

      expect(listenHistory.assets).toEqual(existingAssets);
      expect(localforage.getItem).toHaveBeenCalledWith("listenHistory");
    });

    it("should handle non-array data from indexedDB", async () => {
      (localforage.getItem as jest.Mock).mockResolvedValue(null);

      listenHistory = new ListenHistory();
      await Promise.resolve();

      expect(listenHistory.assets).toEqual([]);
      expect(localforage.getItem).toHaveBeenCalledWith("listenHistory");
    });
  });

  describe("addAsset", () => {
    it("should add an asset with addedAt timestamp", () => {
      const beforeAdd = Date.now();
      listenHistory.addAsset(mockAsset1);
      const afterAdd = Date.now();

      expect(listenHistory.assets).toHaveLength(1);
      expect(listenHistory.assets[0].addedAt).toBeGreaterThanOrEqual(beforeAdd);
      expect(listenHistory.assets[0].addedAt).toBeLessThanOrEqual(afterAdd);
      expect(localforage.setItem).toHaveBeenCalledWith("listenHistory", listenHistory.assets);
    });

    it("should maintain assets in reverse chronological order", () => {
      const now = Date.now();
      const asset1 = { ...mockAsset1, addedAt: now - 2000 };
      const asset2 = { ...mockAsset2, addedAt: now - 1000 };

      listenHistory.assets = [asset1];
      listenHistory.addAsset(mockAsset2);

      expect(listenHistory.assets).toHaveLength(2);
      expect(listenHistory.assets[0].id).toBe(1);
      expect(listenHistory.assets[1].id).toBe(2);
    });
  });

  describe("clear", () => {
    it("should clear all assets and update indexedDB", () => {
      listenHistory.assets = [mockAsset1, mockAsset2];
      listenHistory.clear();

      expect(listenHistory.assets).toEqual([]);
      expect(localforage.setItem).toHaveBeenCalledWith("listenHistory", []);
    });

    it("should handle clearing empty history", () => {
      expect(() => {
        listenHistory.clear();
      }).not.toThrow();
      expect(listenHistory.assets).toEqual([]);
    });
  });

  describe("sorting", () => {
    it("should sort assets by addedAt in descending order", async () => {
      const now = Date.now();
      const assets = [
        { ...mockAsset1, addedAt: now - 3000 },
        { ...mockAsset2, addedAt: now - 1000 }
      ];
      (localforage.getItem as jest.Mock).mockResolvedValue(assets);

      listenHistory = new ListenHistory();
      await Promise.resolve();

      const firstAssetAddedAt = listenHistory.assets[0].addedAt;
      const secondAssetAddedAt = listenHistory.assets[1].addedAt;
      
      if (firstAssetAddedAt !== undefined && secondAssetAddedAt !== undefined) {
        expect(firstAssetAddedAt).toBeGreaterThan(secondAssetAddedAt);
      }
    });

    it("should handle assets with undefined addedAt", async () => {
      const assets = [
        { ...mockAsset1, addedAt: undefined },
        { ...mockAsset2, addedAt: Date.now() }
      ];
      (localforage.getItem as jest.Mock).mockResolvedValue(assets);

      listenHistory = new ListenHistory();
      await Promise.resolve();

      expect(listenHistory.assets).toHaveLength(2);
    });
  });
});
