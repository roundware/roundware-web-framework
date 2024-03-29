import { ApiClient } from "./api-client";
import { GeoPosition } from "./geo-position";
import { Roundware } from "./roundware";
import { Coordinates, IAudioData } from "./types";
import { join } from "lodash";
export class Envelope {
  _envelopeId: string;
  _sessionId: number | string;
  _apiClient: ApiClient;
  _geoPosition: GeoPosition;
  _roundware: Roundware;
  _assetId: string | undefined;
  /** Create an Envelope
   * @param {number} sessionId - identifies the session associated with this asset
   * @param {ApiClient} apiClient - the API client object to use for server API calls
   * @param {geoPosition} geoPosition -
   * @param  {Roundware} roundware - roundware object
   **/

  constructor(
    sessionId: number | string,
    apiClient: ApiClient,
    geoPosition: GeoPosition,
    roundware: Roundware
  ) {
    this._envelopeId = "(unknown)";
    this._sessionId = sessionId;
    this._apiClient = apiClient;
    this._geoPosition = geoPosition;
    this._roundware = roundware;
  }

  /** @returns {String} human-readable representation of this asset **/
  toString(): string {
    return `Envelope ${this._assetId}`;
  }

  /** Create a new Envelope in the server to which we can attach audio recordings as assets
   * @returns {Promise} represents the pending API call **/
  async connect(): Promise<void> {
    let data = {
      session_id: this._sessionId,
    };

    return this._apiClient
      .post<{ id: string }>("/envelopes/", data)
      .then((data) => {
        this._envelopeId = data.id;
      });
  }

  /** Sends an audio file to the server
   * @param {blob} audioData
   * @param {string} fileName - name of the file
   * @return {Promise} - represents the API call */
  async upload(
    audioData: IAudioData,
    fileName: string,
    data: {
      latitude?: number;
      longitude?: number;
      tag_ids?: number[];
      media_type?: string;
    } = {}
  ): Promise<{
    detail: string;
    envelope_ids: number[];
  }> {
    if (!this._envelopeId) {
      return Promise.reject(
        "cannot upload audio without first connecting this envelope to the server"
      );
    }

    let formData = new FormData();
    let coordinates: Partial<Coordinates> = {};
    if (!data.latitude && !data.longitude) {
      coordinates = this._geoPosition.getLastCoords();
    } else {
      coordinates = {
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }

    formData.append("session_id", this._sessionId.toString());
    formData.append("file", audioData);
    formData.append("latitude", coordinates.latitude!.toString());
    formData.append("longitude", coordinates.longitude!.toString());

    if (Array.isArray(data.tag_ids)) {
      formData.append("tag_ids", JSON.stringify(data.tag_ids).slice(1, -1));
    } else if (data.tag_ids)
      formData.append("tag_ids", JSON.stringify(data.tag_ids));
    if (data.media_type) {
      formData.append("media_type", data.media_type);
    }

    let path = `/envelopes/${this._envelopeId}/`;

    console.info(`Uploading ${fileName} to envelope ${path}`);

    let options = {
      contentType: "multipart/form-data",
    };

    const res = await this._apiClient.patch<{
      detail: string;
      envelope_ids: number[];
    }>(path, formData, options);

    if (res.detail) {
      throw new Error(res.detail);
    } else {
      // Update the asset pool to include the newly uploaded asset
      await this._roundware.updateAssetPool();

      // get the posted asset;
      const asset = this._roundware.assetData?.find((a) =>
        a.envelope_ids.some((e) => res.envelope_ids.includes(e))
      );

      if (asset) {
        this._roundware.events?.logEvent(`upload_asset`, {
          data: `asset_id:${asset.id}`,
        });
      }

      return res;
    }
  }
}
