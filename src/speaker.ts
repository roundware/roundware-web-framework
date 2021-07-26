import { IApiClient } from "./api-client";

const PATH = "/speakers/";

export interface SpeakerData {

}
export interface ISpeaker {
  toString(): string;
  connect(data: object): Promise<SpeakerData>
}
export class Speaker implements ISpeaker{

  private _projectId: number;
  private _apiClient: IApiClient;

  constructor(projectId: number, { apiClient }: { apiClient: IApiClient }) {
    this._projectId = projectId;
    this._apiClient = apiClient;
  }

  toString() {
    return `Roundware Speaker (#${this._projectId})`;
  }

  async connect({ ...data }) {
    return await this._apiClient.get<SpeakerData>(PATH, { ...data, project_id: this._projectId });
  }
}
