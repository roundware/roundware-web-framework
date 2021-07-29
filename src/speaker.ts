import { IApiClient } from "./types/api-client";
import { ISpeaker, ISpeakerData } from "./types/speaker";

const PATH = "/speakers/";

export class Speaker implements ISpeaker {
  private _projectId: number;
  private _apiClient: IApiClient;

  constructor(projectId: number, { apiClient }: { apiClient: IApiClient }) {
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
