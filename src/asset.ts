import { ApiClient } from "./api-client";
import { IAssetData, IAssetFilters } from "./types/asset";

/* global process */
export const PATH = "/assets/";

export class Asset {
  private _projectId: number;
  private _apiClient: ApiClient;
  constructor(projectId: number, options: { apiClient: ApiClient }) {
    this._apiClient = options.apiClient;
    this._projectId = projectId;
  }

  async connect(data: IAssetFilters = {}): Promise<IAssetData[]> {
    const options = { ...data, project_id: this._projectId };
    return await this._apiClient.get<IAssetData[]>(PATH, options);
  }
}
