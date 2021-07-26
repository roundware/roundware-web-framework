import { IApiClient } from "./api-client";

/* global process */
export const PATH = process.env.NODE_ENV === 'development' ? '/assets/?created__lte=2019-08-15T18:06:39' : '/assets/';

export interface IAsset {
  toString(): string;
  connect(): Promise<unknown>
}
export class Asset {

  private _projectId: number;
  private _apiClient: IApiClient;
  constructor(projectId: number, { apiClient }: { apiClient: IApiClient }) {
    this._projectId = projectId;
    this._apiClient = apiClient;
  }

  toString() {
    return `Roundware Assets (#${this._projectId})`;
  }

  async connect(data = {}) {
    const options = { ...data, project_id: this._projectId };
    return await this._apiClient.get<unknown>(PATH, options);
  }
}
