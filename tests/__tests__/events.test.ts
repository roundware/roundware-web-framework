import { ApiClient } from "../../src/api-client";
import { RoundwareEvents } from "../../src/events";
import { EventType } from "../../src/types/events";

jest.mock("../../src/api-client");

const settle = () => new Promise((r) => setTimeout(r, 0));

describe("RoundwareEvents", () => {
  let events: RoundwareEvents;
  let api: jest.Mocked<ApiClient>;
  let at: { latitude?: number; longitude?: number } | undefined;

  beforeEach(() => {
    api = new ApiClient("") as jest.Mocked<ApiClient>;
    api.post.mockResolvedValue({ id: 456 });
    api.patch.mockResolvedValue({});
    at = { latitude: 42.36, longitude: -71.06 };
    events = new RoundwareEvents(123, api, () => at);
  });

  afterEach(() => jest.clearAllMocks());

  describe("listening history", () => {
    it("records a contribution heard, from when and where", async () => {
      const startTime = new Date();
      await events.logAssetStart(1, startTime);
      expect(api.post).toHaveBeenCalledWith("/listenevents/", {
        started_at: startTime.toISOString(),
        session_id: 123,
        asset_id: 1,
        latitude: 42.36,
        longitude: -71.06,
      });
    });

    it("records how long, once it stops", async () => {
      await events.logAssetStart(1);
      await events.logAssetEnd(1);
      expect(api.patch).toHaveBeenCalledWith(
        "/listenevents/456/",
        expect.objectContaining({ duration_sec: expect.any(Number) })
      );
    });

    it("a stop before the start's row exists still records it", async () => {
      let resolve: (v: { id: number }) => void = () => {};
      api.post.mockReturnValue(new Promise((r) => (resolve = r)) as any);
      await events.logAssetStart(1);
      const ending = events.logAssetEnd(1);
      resolve({ id: 789 });
      await ending;
      expect(api.patch).toHaveBeenCalledWith("/listenevents/789/", expect.anything());
    });

    it("nothing to stop, nothing sent; and only once", async () => {
      await events.logAssetEnd(1);
      expect(api.patch).not.toHaveBeenCalled();
      await events.logAssetStart(1);
      await events.logAssetEnd(1);
      await events.logAssetEnd(1);
      expect(api.patch).toHaveBeenCalledTimes(1);
    });

    it("records speakers heard too", async () => {
      events.logSpeakerStart(7);
      expect(api.post).toHaveBeenCalledWith(
        "/listenevents/",
        expect.objectContaining({ speaker_id: 7, latitude: 42.36 })
      );
      await settle();
      await events.logSpeakerEnd(7);
      expect(api.patch).toHaveBeenCalledWith("/listenevents/456/", expect.anything());
    });

    it("no location when the listener's isn't known", async () => {
      at = undefined;
      await events.logAssetStart(1);
      expect(api.post.mock.calls[0][1]).not.toHaveProperty("latitude");
    });
  });

  describe("logEvent", () => {
    it("says where the listener was", async () => {
      await events.logEvent("play_stream" as EventType);
      expect(api.post).toHaveBeenCalledWith("/events/", {
        session_id: 123,
        event_type: "play_stream",
        client_time: expect.any(String),
        latitude: 42.36,
        longitude: -71.06,
      });
    });

    it("an event's own location wins (location_update)", async () => {
      await events.logEvent("location_update" as EventType, { latitude: 1, longitude: 2 });
      expect(api.post).toHaveBeenCalledWith(
        "/events/",
        expect.objectContaining({ latitude: 1, longitude: 2 })
      );
    });
  });
});
