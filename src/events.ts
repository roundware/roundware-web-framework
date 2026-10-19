import { ApiClient } from "./api-client";
import { IAssetData } from "./types/asset";
import { EventPayload, EventType } from "./types/events";
// Listening history (server /listeninghistoryitems/); v2 called these listen
// events, at /listenevents/, which the v3 server no longer answers.
const LISTEN_EVENTS = "/listeninghistoryitems/";
const EVENTS_PATH = `/events/`;
/**
 *
 * Post events to roundware server
 * @export
 * @class RoundwareEvents
 */
/** Where the listener is: the device's location in walking mode, the map's
 *  chosen point otherwise. */
export type WhereIsListener = () => { latitude?: number; longitude?: number } | undefined;

export class RoundwareEvents {
  _sessionId: number;
  _apiClient: ApiClient;
  private _whereIsListener: WhereIsListener;
  /** What's being heard: its listening history row, once the server has
   *  made it. Keyed "asset:<id>" or "speaker:<id>". */
  private _heard: Record<string, Promise<{ id: number; startTime: Date } | null>> = {};

  /**
   * Creates an instance of RoundwareEvents.
   * @param {number} sessionId
   * @param {ApiClient} apiClient
   * @param {WhereIsListener} whereIsListener - every event and listening
   *   record says where the listener was (session maps; server docs/010)
   * @memberof RoundwareEvents
   */
  constructor(sessionId: number, apiClient: ApiClient, whereIsListener: WhereIsListener = () => undefined) {
    this._sessionId = sessionId;
    this._apiClient = apiClient;
    this._whereIsListener = whereIsListener;
  }

  /** The listener's location as a payload, when it's known. */
  private where(): { latitude?: number; longitude?: number } {
    const at = this._whereIsListener();
    const ok = (n: unknown) => typeof n === "number" && Number.isFinite(n);
    return at && ok(at.latitude) && ok(at.longitude)
      ? { latitude: at.latitude, longitude: at.longitude }
      : {};
  }

  /** Start a listening history row: heard from now, here. */
  private startHearing(key: string, heard: { asset_id: number } | { speaker_id: number }, startTime: Date) {
    if (key in this._heard) return; // already being heard
    this._heard[key] = this._apiClient
      .post<{ id: number }>(LISTEN_EVENTS, {
        started_at: startTime.toISOString(),
        session_id: this._sessionId,
        ...heard,
        ...this.where(),
      })
      .then(({ id }) => ({ id, startTime }))
      .catch(() => null);
  }

  /** It's no longer heard: how long it was. Waits for the row if the start
   *  is still on its way, so a short listen isn't lost. */
  private async stopHearing(key: string): Promise<void> {
    const started = this._heard[key];
    if (!started) return;
    delete this._heard[key];
    const row = await started;
    if (!row) return;
    const duration_sec = (Date.now() - row.startTime.getTime()) / 1000;
    await this._apiClient.patch(LISTEN_EVENTS + row.id + "/", { duration_sec });
  }

  /**
   * When any asset starts playing
   * @param {number} assetId -
   * @param {Date} [startTime = new Date()] (Optional) time when asset started playing, default to current time
   * @memberof RoundwareEvents
   */
  async logAssetStart(assetId: IAssetData[`id`], startTime: Date = new Date()): Promise<void> {
    this.startHearing(`asset:${assetId}`, { asset_id: assetId }, startTime);
  }

  /**
   * Records how long the asset was heard (its listening history row's duration).
   * @param {number} assetId - id of the asset
   * @memberof RoundwareEvents
   */
  async logAssetEnd(assetId: IAssetData[`id`]): Promise<void> {
    return this.stopHearing(`asset:${assetId}`);
  }

  /** A speaker starts being heard (server docs/010: listening history). */
  logSpeakerStart(speakerId: number, startTime: Date = new Date()): void {
    this.startHearing(`speaker:${speakerId}`, { speaker_id: speakerId }, startTime);
  }

  /** A speaker is no longer heard. */
  logSpeakerEnd(speakerId: number): Promise<void> {
    return this.stopHearing(`speaker:${speakerId}`);
  }

  async logEvent(eventType: EventType, payload?: EventPayload) {
    console.info(`event: ${eventType}`, payload);
    return this._apiClient.post<EventPayload>(EVENTS_PATH, {
      session_id: this._sessionId,
      event_type: eventType,
      client_time: new Date().toISOString(),
      // Where the listener was, unless the event says (location_update).
      ...this.where(),
      ...payload,
    });
  }
}
