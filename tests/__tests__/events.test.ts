// Import necessary dependencies and the RoundwareEvents class

import { ApiClient } from "../../src/api-client";
import { RoundwareEvents } from "../../src/events";
import { EventType, EventPayload } from "../../src/types/events";

// Mock the ApiClient class
jest.mock("../../src/api-client");

describe("RoundwareEvents", () => {
  let roundwareEvents: RoundwareEvents;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient("") as jest.Mocked<ApiClient>;
    roundwareEvents = new RoundwareEvents(123, mockApiClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("logAssetStart", () => {
    it("should log asset start and update _startedAssets", async () => {
      const assetId = 1;
      const startTime = new Date();

      // Mock the post method of ApiClient
      mockApiClient.post.mockResolvedValue({ id: 456 });

      await roundwareEvents.logAssetStart(assetId, startTime);

      expect(mockApiClient.post).toHaveBeenCalledWith("/listenevents/", {
        starttime: startTime,
        session: 123,
        asset: assetId,
      });

      expect(roundwareEvents["_startedAssets"]).toHaveProperty(
        assetId.toString(),
        expect.objectContaining({ startTime, id: 456 })
      );
    });

    it("should log asset start with default startTime if not provided", async () => {
      const assetId = 1;

      // Mock the post method of ApiClient
      mockApiClient.post.mockResolvedValue({ id: 456 });

      await roundwareEvents.logAssetStart(assetId);

      expect(mockApiClient.post).toHaveBeenCalledWith("/listenevents/", {
        starttime: expect.any(Date),
        session: 123,
        asset: assetId,
      });

      expect(roundwareEvents["_startedAssets"]).toHaveProperty(
        assetId.toString(),
        expect.objectContaining({ startTime: expect.any(Date), id: 456 })
      );
    });
  });

  describe("logAssetEnd", () => {
    it("should log asset end if assetId exists in _startedAssets", async () => {
      const assetId = 1;
      const startTime = new Date();
      roundwareEvents["_startedAssets"][assetId] = { startTime, id: 789 };

      // Mock the patch method of ApiClient
      mockApiClient.patch.mockResolvedValue({});

      await roundwareEvents.logAssetEnd(assetId);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        "/listenevents/789",
        expect.objectContaining({
          duration_in_seconds: expect.any(Number),
        })
      );
    });

    it("should not log asset end if assetId does not exist in _startedAssets", async () => {
      const assetId = 1;

      // Mock the patch method of ApiClient
      mockApiClient.patch.mockResolvedValue({});

      await roundwareEvents.logAssetEnd(assetId);

      expect(mockApiClient.patch).not.toHaveBeenCalled();
    });
  });

  describe("logEvent", () => {
    it("should log an event using the post method of ApiClient", async () => {
      const eventType: EventType = "start_session";
      const payload: EventPayload = {
        latitude: 40.7128,
        longitude: -74.006,
      };

      // Mock the post method of ApiClient
      mockApiClient.post.mockResolvedValue(payload);

      await roundwareEvents.logEvent(eventType, payload);

      expect(mockApiClient.post).toHaveBeenCalledWith("/events/", {
        session_id: 123,
        event_type: eventType,
        client_time: expect.any(String),
        ...payload,
      });
    });
  });
});
