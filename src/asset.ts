import { ApiClient } from "./api-client";

/* global process */
export const PATH =
  process.env.NODE_ENV === "development"
    ? "/assets/?created__lte=2019-08-15T18:06:39"
    : "/assets/";

export class Asset {
  private _projectId: number;
  private _apiClient: ApiClient;
  constructor(projectId: number, { apiClient }: { apiClient: ApiClient }) {
    this._projectId = projectId;
    this._apiClient = apiClient;
  }

  toString(): string {
    return `Roundware Assets (#${this._projectId})`;
  }

  async connect<T>(data = {}): Promise<T> {
    const options = { ...data, project_id: this._projectId };
    return await this._apiClient.get<T>(PATH, options);
  }
}
