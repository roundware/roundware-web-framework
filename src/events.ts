import { ApiClient } from "./api-client";
import { IAssetData } from "./types/asset";
import { EventPayload, EventType } from "./types/events";
const LISTEN_EVENTS = "/listenevents/";
const EVENTS_PATH = `/events/`;
/**
 *
 * Post events to roundware server
 * @export
 * @class RoundwareEvents
 */
export class RoundwareEvents {
  _sessionId: number;
  _apiClient: ApiClient;
  _startedAssets: {
    [id: number]: { startTime: Date; id: number };
  } = {};

  /**
   * Creates an instance of RoundwareEvents.
   * @param {number} sessionId
   * @param {ApiClient} apiClient
   * @memberof RoundwareEvents
   */
  constructor(sessionId: number, apiClient: ApiClient) {
    this._sessionId = sessionId;
    this._apiClient = apiClient;
  }

  /**
   *
   * When any asset starts playing
   * @param {number} assetId -
   * @param {Date} [startTime = new Date()] (Optional) time when asset started playing, default to current time
   * @return {Promise} Promise of Response
   * @memberof RoundwareEvents
   */
  async logAssetStart(
    assetId: IAssetData[`id`],
    startTime: Date = new Date()
  ): Promise<void> {
    this._apiClient
      .post<{ id: number }>(LISTEN_EVENTS, {
        started_at: startTime.toISOString(),
        session_id: this._sessionId,
        asset_id: assetId,
      })
      .then(({ id }) => (this._startedAssets[assetId] = { startTime, id }));
  }

  /**
   *
   * Calculates duration in seconds from when started, and sends patch request to given assetId
   * @param {number} assetId - id of the asset
   * @return {Promise} Promise of Response
   * @memberof RoundwareEvents
   */
  async logAssetEnd(assetId: IAssetData[`id`]): Promise<void> {
    if (assetId in this._startedAssets === false) return;

    const startedAsset = this._startedAssets[assetId];

    const duration_sec =
      (new Date().getTime() - startedAsset.startTime.getTime()) / 1000;
    return this._apiClient.patch(LISTEN_EVENTS + startedAsset.id + "/", {
      duration_sec,
    });
  }

  async logEvent(eventType: EventType, payload?: EventPayload) {
    console.info(`event: ${eventType}`, payload);
    return this._apiClient.post<EventPayload>(EVENTS_PATH, {
      session_id: this._sessionId,
      event_type: eventType,
      client_time: new Date().toISOString(),
      ...payload,
    });
  }
}
