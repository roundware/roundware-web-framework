import { IApiClient } from "./types/api-client";
import { IAsset } from "./types/asset";

/* global process */
export const PATH =
  process.env.NODE_ENV === "development"
    ? "/assets/?created__lte=2019-08-15T18:06:39"
    : "/assets/";

export class Asset implements IAsset {
  private _projectId: number;
  private _apiClient: IApiClient;
  constructor(projectId: number, { apiClient }: { apiClient: IApiClient }) {
    this._projectId = projectId;
    this._apiClient = apiClient;
  }

  toString() {
    return `Roundware Assets (#${this._projectId})`;
  }

  async connect<T>(data = {}) {
    const options = { ...data, project_id: this._projectId };
    return await this._apiClient.get<T>(PATH, options);
  }
}
