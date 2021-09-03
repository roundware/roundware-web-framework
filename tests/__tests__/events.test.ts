import { ApiClient } from "../../src/api-client";
import { RoundwareEvents } from "../../src/events";
import { getResponse } from "../fetch.setup";
import { MOCK_ASSET_DATA } from "../__mocks__/mock_api_responses";
import config from "../__mocks__/roundware.config";
describe("Events", () => {
  const apiClient = new ApiClient(config.baseServerUrl);
  it("should create and event logger instance", () => {
    const roundwareEvents = new RoundwareEvents(config.sessionId, apiClient);
    expect(roundwareEvents).toBeInstanceOf(RoundwareEvents);
  });

  const roundwareEvents = new RoundwareEvents(config.sessionId, apiClient);

  const mockAsset = MOCK_ASSET_DATA[0];

  it("should post event to roundware server", async () => {
    // @ts-ignore
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      return Promise.resolve(getResponse(input));
    });

    const mockStartTime = new Date();
    await roundwareEvents.logAssetStart(MOCK_ASSET_DATA[0], mockStartTime);
    expect(global.fetch).toBeCalledTimes(1);
    // @ts-ignore
    expect(global.fetch.mock.calls[0][0]).toBe(
      config.baseServerUrl + `/listenevents`
    );
    // @ts-ignore
    expect(global.fetch.mock.calls[0][1].body).toBe(
      JSON.stringify({
        duration_in_seconds: mockAsset.audio_length_in_seconds, // asset audio duration
        start_time: mockStartTime, // when asset starts playing
        session_id: config.sessionId,
        asset_id: mockAsset.id,
      })
    );
  });

  it("should use default date when not passed", async () => {
    // @ts-ignore
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit) => {
      return Promise.resolve(getResponse(input));
    });

    const mockDate = new Date(1466424490000);
    // @ts-ignore
    const spy = jest.spyOn(global, "Date").mockImplementation(() => mockDate);

    await roundwareEvents.logAssetStart(MOCK_ASSET_DATA[0]);
    expect(global.fetch).toBeCalledTimes(1);
    expect(global.Date).toBeCalledTimes(1);
    // @ts-ignore
    expect(global.fetch.mock.calls[0][0]).toBe(
      config.baseServerUrl + `/listenevents`
    );
    // @ts-ignore
    expect(global.fetch.mock.calls[0][1].body).toBe(
      JSON.stringify({
        duration_in_seconds: mockAsset.audio_length_in_seconds, // asset audio duration
        start_time: mockDate, // when asset starts playing
        session_id: config.sessionId,
        asset_id: mockAsset.id,
      })
    );
  });
});
