import { IApiClient } from "./types/api-client";
import { IRoundware } from "./types/roundware";
import { IEnvelope } from "./types/envelope";
import { Coordinates, GeoPositionType } from "./types";

export class Envelope implements IEnvelope {
  _envelopeId: string;
  _sessionId: number;
  _apiClient: IApiClient;
  _geoPosition: GeoPositionType;
  _roundware: IRoundware;
  _assetId: string | undefined;
  /** Create an Envelope
   * @param {number} sessionId - identifies the session associated with this asset
   * @param {ApiClient} apiClient - the API client object to use for server API calls
   * @param {geoPosition} geoPosition -
   **/
  constructor(
    sessionId: number,
    apiClient: IApiClient,
    geoPosition: GeoPositionType,
    roundware: IRoundware
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
  async connect() {
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
    audioData: Blob,
    fileName: string,
    data: {
      latitude?: number;
      longitude?: number;
      tag_ids?: string;
      media_type?: string;
    } = {}
  ) {
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
    console.log(coordinates);

    formData.append("session_id", this._sessionId.toString());
    formData.append("file", audioData);
    formData.append("latitude", coordinates.latitude!.toString());
    formData.append("longitude", coordinates.longitude!.toString());

    if (data.tag_ids) {
      formData.append("tag_ids", data.tag_ids);
    }
    if (data.media_type) {
      formData.append("media_type", data.media_type);
    }

    let path = `/envelopes/${this._envelopeId}/`;

    console.info(`Uploading ${fileName} to envelope ${path}`);

    let options = {
      contentType: "multipart/form-data",
    };

    const res = await this._apiClient.patch<{ detail: string }>(
      path,
      formData,
      options
    );
    console.info("UPLOADDATA", res);
    if (res.detail) {
      throw new Error(res.detail);
    } else {
      // Update the asset pool to include the newly uploaded asset
      await this._roundware.updateAssetPool();
      return res;
    }
  }
}
