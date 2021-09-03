import { ApiClient } from "./api-client";
import { IAssetData } from "./types/asset";
type ListenEventsTypes = "play";
const PATH = "/listenevents/";
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
      .post<{ id: number }>(PATH, {
        starttime: startTime,
        session: this._sessionId,
        asset: assetId,
      })
      .then(({ id }) => (this._startedAssets[assetId] = { startTime, id }));
  }

  /**
   *
   * Calculates duration in seconds from when started, and sends patch request to givena assetId
   * @param {number} assetId - id of the asset
   * @return {Promise} Promise of Response
   * @memberof RoundwareEvents
   */
  async logAssetEnd(assetId: IAssetData[`id`]): Promise<void> {
    if (assetId in this._startedAssets === false) return;

    const startedAsset = this._startedAssets[assetId];

    const duration_in_seconds =
      (new Date().getTime() - startedAsset.startTime.getTime()) / 1000;
    return this._apiClient.patch(PATH + startedAsset.id, {
      duration_in_seconds,
    });
  }
}
