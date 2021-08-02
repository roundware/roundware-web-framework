import { ApiClient } from "./api-client";
import { ISpeakerData } from "./types/speaker";

const PATH = "/speakers/";

export class Speaker {
  private _projectId: number;
  private _apiClient: ApiClient;

  constructor(projectId: number, { apiClient }: { apiClient: ApiClient }) {
    this._projectId = projectId;
    this._apiClient = apiClient;
  }

  toString() {
    return `Roundware Speaker (#${this._projectId})`;
  }

  async connect({ ...data }): Promise<ISpeakerData[]> {
    return await this._apiClient.get<ISpeakerData[]>(PATH, {
      ...data,
      project_id: this._projectId,
    });
  }
}
