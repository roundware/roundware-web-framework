import { ApiClient } from "./api-client";
import { GeoPosition } from "./geo-position";
import { Roundware } from "./roundware";
import { Coordinates, IAudioData } from "./types";
import { IAssetData } from "./types/asset";

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

  /** Sends an audio file to the server via POST /assets/ (v3 API).
   *
   * v2 uploaded via PATCH /envelopes/{id}/, but v3 creates assets directly
   * via POST /assets/ with the envelope_id in the form data.
   *
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
  ): Promise<IAssetData> {
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

    // v3: POST /assets/ requires project_id and envelope_id
    formData.append("project_id", this._roundware["_projectId"].toString());
    formData.append("session_id", this._sessionId.toString());
    formData.append("envelope_id", this._envelopeId.toString());
    formData.append("file", audioData);
    formData.append("latitude", coordinates.latitude!.toString());
    formData.append("longitude", coordinates.longitude!.toString());

    if (Array.isArray(data.tag_ids)) {
      // v3 expects comma-separated string: "1,2,3"
      formData.append("tag_ids", data.tag_ids.join(","));
    } else if (data.tag_ids) {
      formData.append("tag_ids", JSON.stringify(data.tag_ids));
    }
    if (data.media_type) {
      formData.append("media_type", data.media_type);
    }

    console.info(
      `Uploading ${fileName} to envelope ${this._envelopeId} via POST /assets/`
    );

    let options = {
      contentType: "multipart/form-data",
    };

    // v3: Upload goes to POST /assets/ instead of PATCH /envelopes/{id}/
    const asset = await this._apiClient.post<IAssetData>(
      "/assets/",
      formData,
      options
    );

    // Update the asset pool to include the newly uploaded asset
    await this._roundware.updateAssetPool();

    this._roundware.events?.logEvent(`upload_asset`, {
      data: `asset_id:${asset.id}`,
    });

    return asset;
  }
}
