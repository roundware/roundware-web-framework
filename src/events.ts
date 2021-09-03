import { ApiClient } from "./api-client";
import { IAssetData } from "./types/asset";
type ListenEventsTypes = "play";
/**
 *
 * Post events to roundware server
 * @export
 * @class RoundwareEvents
 */
export class RoundwareEvents {
  _sessionId: number;
  _apiClient: ApiClient;

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
   * @param {IAssetData} asset -
   * @param {Date} [startTime = new Date()] (Optional) time when asset started playing, default to current time
   * @return {Promise} Promise of Response
   * @memberof RoundwareEvents
   */
  async logAssetStart(
    asset: IAssetData,
    startTime: Date = new Date()
  ): Promise<void> {
    return this._apiClient.post(`/listenevents`, {
      duration_in_seconds: asset.audio_length_in_seconds,
      start_time: startTime,
      session_id: this._sessionId,
      asset_id: asset.id,
    });
  }
}
