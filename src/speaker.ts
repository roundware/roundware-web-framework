import { IApiClient } from "./api-client";

const PATH = "/speakers/";

export interface ISpeaker {
  toString(): string;
  connect(): Promise<unknown>
}
export class Speaker {

  private _projectId: string;
  private _apiClient: IApiClient;

  constructor(projectId: string, { apiClient }: { apiClient: IApiClient }) {
    this._projectId = projectId;
    this._apiClient = apiClient;
  }

  toString() {
    return `Roundware Speaker (#${this._projectId})`;
  }

  async connect({ ...data }) {
    return await this._apiClient.get<unknown>(PATH, { ...data, project_id: this._projectId });
  }
}
