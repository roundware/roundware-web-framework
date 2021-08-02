import { ITimedAssetData } from "./types";
import { ApiClient } from "./api-client";

const PATH = "/timedassets/";

export class TimedAsset {
  private _projectId: number;
  private _apiClient: ApiClient;

  constructor(projectId: number, { apiClient }: { apiClient: ApiClient }) {
    this._projectId = projectId;
    this._apiClient = apiClient;
  }

  toString(): string {
    return `Roundware TimedAssets (#${this._projectId})`;
  }
  /**
   * @param  {object} {...data}
   * @returns Promise<ITimedAssetData[]>
   */
  async connect({ ...data }: object | undefined): Promise<ITimedAssetData[]> {
    const options = { ...data, project_id: this._projectId };
    return await this._apiClient.get<ITimedAssetData[]>(PATH, options);
  }
}
