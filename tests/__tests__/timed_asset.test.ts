import { TimedAsset } from "../../src/timed_asset";
import { ApiClient } from "../../src/api-client";
import { ITimedAssetData } from "../../src/types";

// Mock the ApiClient class
jest.mock("../../src/api-client");

describe("TimedAsset", () => {
  let timedAsset: TimedAsset;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient("") as jest.Mocked<ApiClient>;
    timedAsset = new TimedAsset(456, { apiClient: mockApiClient });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("toString", () => {
    it("should return a string representation of TimedAssets", () => {
      const result = timedAsset.toString();
      expect(result).toEqual("Roundware TimedAssets (#456)");
    });
  });

  describe("connect", () => {
    it("should connect to TimedAssets and return the result", async () => {
      const responseData: ITimedAssetData[] = [
        { asset_id: 1, start: 123, end: 456 },
        { asset_id: 2, start: 789, end: 987 },
      ];

      // Mock the get method of ApiClient
      mockApiClient.get.mockResolvedValue(responseData);

      const result = await timedAsset.connect({ someOption: "value" });

      expect(mockApiClient.get).toHaveBeenCalledWith("/timedassets/", {
        someOption: "value",
        project_id: 456,
      });

      expect(result).toEqual(responseData);
    });
  });
});
