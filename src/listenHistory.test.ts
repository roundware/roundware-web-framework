import localforage from "localforage";
import { ListenHistory } from "./listenHistory";
import { IAssetData } from "./types/asset";

jest.mock("localforage");

describe("ListenHistory", () => {
  let listenHistory: ListenHistory;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all previous mock calls
    (localforage.getItem as jest.Mock).mockResolvedValue([]); // Ensure default mock value for getItem
    listenHistory = new ListenHistory(); // Initialize after mock setup
  });

  it("should load history from indexedDB on initialization", async () => {
    // Mocking localforage.getItem to return an array of assets
    const mockAssets: IAssetData[] = [
      {
        id: 1,
        description: "Asset 1",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "file1.mp3",
        file: null,
        volume: 1,
        submitted: true,
        created: new Date("2023-01-01"),
        updated: new Date("2023-01-02"),
        weight: 10,
        start_time: 0,
        end_time: 100,
        user: { username: "user1", email: "user1@example.com" },
        media_type: "audio",
        audio_length_in_seconds: 60,
        tag_ids: [1],
        session_id: 123,
        project_id: 456,
        language_id: 1,
        envelope_ids: [1, 2],
        description_loc_ids: [3],
        alt_text_loc_ids: [4],
        project: 1,
      },
    ];
    (localforage.getItem as jest.Mock).mockResolvedValue(mockAssets); // Mock resolved value

    // Trigger constructor logic
    listenHistory = new ListenHistory();

    // Wait for the promise resolution in constructor
    await Promise.resolve();

    // Verify that assets are loaded and sorted
    expect(localforage.getItem).toHaveBeenCalledWith("listenHistory");
    expect(listenHistory.assets).toEqual(mockAssets);
  });

  it("should handle non-array values from indexedDB (line 14)", async () => {
    // Test the false branch of line 14: when assets is not an array
    // This can happen if indexedDB contains corrupted or unexpected data
    (localforage.getItem as jest.Mock).mockResolvedValue(null);

    // Trigger constructor logic
    listenHistory = new ListenHistory();

    // Wait for the promise resolution in constructor
    await Promise.resolve();

    // When assets is not an array, the if condition on line 14 should be false
    // and this.assets should remain as empty array (initial value)
    expect(localforage.getItem).toHaveBeenCalledWith("listenHistory");
    expect(listenHistory.assets).toEqual([]);
  });

  it("should handle undefined values from indexedDB (line 14)", async () => {
    // Test the false branch of line 14: when assets is undefined
    (localforage.getItem as jest.Mock).mockResolvedValue(undefined);

    // Trigger constructor logic
    listenHistory = new ListenHistory();

    // Wait for the promise resolution in constructor
    await Promise.resolve();

    // When assets is undefined, the if condition on line 14 should be false
    // and this.assets should remain as empty array (initial value)
    expect(localforage.getItem).toHaveBeenCalledWith("listenHistory");
    expect(listenHistory.assets).toEqual([]);
  });

  it("should handle non-array object from indexedDB (line 14)", async () => {
    // Test the false branch of line 14: when assets is an object but not an array
    (localforage.getItem as jest.Mock).mockResolvedValue({ someKey: "someValue" });

    // Trigger constructor logic
    listenHistory = new ListenHistory();

    // Wait for the promise resolution in constructor
    await Promise.resolve();

    // When assets is not an array, the if condition on line 14 should be false
    // and this.assets should remain as empty array (initial value)
    expect(localforage.getItem).toHaveBeenCalledWith("listenHistory");
    expect(listenHistory.assets).toEqual([]);
  });

  it("should sort assets by addedAt in descending order (line 16)", async () => {
    // Create mock assets with different addedAt timestamps
    const now = Date.now();
    const mockAssets: (IAssetData & { addedAt?: number })[] = [
      {
        id: 1,
        description: "Asset 1 (oldest)",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "file1.mp3",
        file: null,
        volume: 1,
        submitted: true,
        created: new Date("2023-01-01"),
        updated: new Date("2023-01-02"),
        weight: 10,
        start_time: 0,
        end_time: 100,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 60,
        tag_ids: [1],
        session_id: 123,
        project_id: 456,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        project: 1,
        addedAt: now - 2000, // Oldest (2 seconds ago)
      },
      {
        id: 2,
        description: "Asset 2 (newest)",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "file2.mp3",
        file: null,
        volume: 1,
        submitted: true,
        created: new Date("2023-01-01"),
        updated: new Date("2023-01-02"),
        weight: 10,
        start_time: 0,
        end_time: 100,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 60,
        tag_ids: [1],
        session_id: 123,
        project_id: 456,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        project: 1,
        addedAt: now, // Newest (now)
      },
      {
        id: 3,
        description: "Asset 3 (middle)",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "file3.mp3",
        file: null,
        volume: 1,
        submitted: true,
        created: new Date("2023-01-01"),
        updated: new Date("2023-01-02"),
        weight: 10,
        start_time: 0,
        end_time: 100,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 60,
        tag_ids: [1],
        session_id: 123,
        project_id: 456,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        project: 1,
        addedAt: now - 1000, // Middle (1 second ago)
      },
    ];

    // Mock getItem to return assets in unsorted order (middle, oldest, newest)
    (localforage.getItem as jest.Mock).mockResolvedValue([
      mockAssets[2], // Middle first
      mockAssets[0], // Oldest second
      mockAssets[1], // Newest third
    ]);

    // Trigger constructor logic
    listenHistory = new ListenHistory();

    // Wait for the promise resolution in constructor
    await Promise.resolve();

    // Verify that assets are sorted by addedAt in descending order (newest first)
    // Line 16: (a, b) => b.addedAt! - a.addedAt! sorts descending
    expect(listenHistory.assets).toHaveLength(3);
    expect(listenHistory.assets[0].id).toBe(2); // Newest first
    expect(listenHistory.assets[0].addedAt).toBe(now);
    expect(listenHistory.assets[1].id).toBe(3); // Middle second
    expect(listenHistory.assets[1].addedAt).toBe(now - 1000);
    expect(listenHistory.assets[2].id).toBe(1); // Oldest last
    expect(listenHistory.assets[2].addedAt).toBe(now - 2000);
  });

  it("should add a new asset to history and update indexedDB", async () => {
    const newAsset: IAssetData = {
      id: 2,
      description: "Asset 2",
      latitude: 10,
      longitude: 20,
      shape: null,
      filename: "file2.mp3",
      file: null,
      volume: 1,
      submitted: true,
      created: new Date("2023-03-01"),
      updated: new Date("2023-03-05"),
      weight: 50,
      start_time: 0,
      end_time: 100,
      user: null,
      media_type: "audio",
      audio_length_in_seconds: 120,
      tag_ids: [1, 2],
      session_id: 999,
      project_id: undefined,
      language_id: 1,
      envelope_ids: [],
      description_loc_ids: [],
      alt_text_loc_ids: [],
      project: undefined,
    };

    // Mocking localforage.setItem
    (localforage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Act: Add the new asset
    listenHistory.addAsset(newAsset);

    // Expectations
    expect(listenHistory.assets).toHaveLength(1);
    expect(listenHistory.assets[0]).toMatchObject({
      id: 2,
      description: "Asset 2",
      addedAt: expect.any(Number), // Ensure addedAt is a valid timestamp
    });
    expect(localforage.setItem).toHaveBeenCalledWith(
      "listenHistory",
      listenHistory.assets
    );
  });

  it("should clear the asset history and update indexedDB", async () => {
    // Pre-fill assets
    listenHistory.assets = [
      {
        id: 1,
        description: "Asset 1",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "file1.mp3",
        file: null,
        volume: 1,
        submitted: true,
        created: new Date("2023-01-01"),
        updated: new Date("2023-01-02"),
        weight: 10,
        start_time: 0,
        end_time: 100,
        user: { username: "user1", email: "user1@example.com" },
        media_type: "audio",
        audio_length_in_seconds: 60,
        tag_ids: [1],
        session_id: 123,
        project_id: 456,
        language_id: 1,
        envelope_ids: [1, 2],
        description_loc_ids: [3],
        alt_text_loc_ids: [4],
        project: 1,
      },
    ];

    // Mocking localforage.setItem
    (localforage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Act: Clear the history
    listenHistory.clear();

    // Expectations
    expect(listenHistory.assets).toHaveLength(0);
    expect(localforage.setItem).toHaveBeenCalledWith("listenHistory", []);
  });
});
