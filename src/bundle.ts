import { ApiClient } from "./api-client";
import { GeoPosition } from "./geo-position";
import { Roundware } from "./roundware";
import { Coordinates, IAudioData } from "./types";
import { IAssetData } from "./types/asset";

export interface UploadOptions {
  latitude?: number;
  longitude?: number;
  tag_ids?: number[];
  media_type?: string;
  /** Optional contact details the contributor gives, kept with this
   *  contribution and seen only by the project's team (server docs/023). */
  contributor_name?: string;
  contributor_email?: string;
}

/**
 * A participant's contribution: one main asset and whatever is attached to it
 * — a recording with a photo and some text, say.
 *
 * The first upload becomes the bundle's main asset; every later upload is
 * posted with `parent_asset_id` pointing at it. Nothing is created on the
 * server until the first upload, so an abandoned bundle leaves nothing behind.
 *
 * This replaced `Envelope`, which first POSTed an empty envelope to group
 * assets under. The server now links assets directly (roundware-server-v3
 * docs/014-asset-bundles.md).
 *
 * Later uploads may be started before the first has finished — the web app
 * uploads a recording, then its photos and text in parallel. They wait for
 * the main asset to exist rather than racing it, so they always attach to it.
 */
export class AssetBundle {
  _sessionId: number | string;
  _apiClient: ApiClient;
  _geoPosition: GeoPosition;
  _roundware: Roundware;
  /** Resolves to the main asset once the first upload completes. */
  _primary: Promise<IAssetData> | null = null;

  constructor(
    sessionId: number | string,
    apiClient: ApiClient,
    geoPosition: GeoPosition,
    roundware: Roundware
  ) {
    this._sessionId = sessionId;
    this._apiClient = apiClient;
    this._geoPosition = geoPosition;
    this._roundware = roundware;
  }

  /** @returns human-readable representation of this bundle */
  toString(): string {
    return `AssetBundle (session ${this._sessionId})`;
  }

  /** The main asset, once the first upload has completed; null before then. */
  async primaryAsset(): Promise<IAssetData | null> {
    return this._primary ? this._primary : null;
  }

  /**
   * Upload a file as part of this bundle.
   *
   * The first call's asset is the bundle's main asset. Each later call waits
   * for it and attaches to it. If the main upload fails, later uploads fail
   * with the same error rather than silently becoming separate contributions.
   */
  async upload(
    audioData: IAudioData,
    fileName: string,
    data: UploadOptions = {}
  ): Promise<IAssetData> {
    if (this._primary === null) {
      this._primary = this._post(audioData, fileName, data, null);
      return this._primary;
    }
    const primary = await this._primary;
    return this._post(audioData, fileName, data, primary.id);
  }

  private async _post(
    audioData: IAudioData,
    fileName: string,
    data: UploadOptions,
    parentAssetId: number | null
  ): Promise<IAssetData> {
    const formData = new FormData();
    let coordinates: Partial<Coordinates> = {};
    if (!data.latitude && !data.longitude) {
      coordinates = this._geoPosition.getLastCoords();
    } else {
      coordinates = {
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }

    formData.append("project_id", this._roundware["_projectId"].toString());
    formData.append("session_id", this._sessionId.toString());
    if (parentAssetId !== null) {
      formData.append("parent_asset_id", parentAssetId.toString());
    }
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
    if (data.contributor_name) {
      formData.append("contributor_name", data.contributor_name);
    }
    if (data.contributor_email) {
      formData.append("contributor_email", data.contributor_email);
    }

    console.info(
      parentAssetId === null
        ? `Uploading ${fileName} as a new contribution`
        : `Uploading ${fileName} attached to asset ${parentAssetId}`
    );

    const asset = await this._apiClient.post<IAssetData>("/assets/", formData, {
      contentType: "multipart/form-data",
    });

    // Update the asset pool to include the newly uploaded asset
    await this._roundware.updateAssetPool();

    this._roundware.events?.logEvent(`upload_asset`, {
      data: `asset_id:${asset.id}`,
    });

    return asset;
  }
}
