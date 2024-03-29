import { GeoListenMode } from "./mixer";
import { Coordinates, IUiConfig } from "./types";
import { ApiClient } from "./api-client";
import { IProjectData } from "./types/project";

export class Project {
  projectId: number;
  projectName: string;
  apiClient: ApiClient;
  legalAgreement: string = "";
  recordingRadius!: number;
  maxRecordingLength?: number;
  location: Coordinates = { latitude: 1, longitude: 1 };
  outOfRangeDistance?: number;
  mixParams: {};
  listenEnabled?: boolean;
  speakerEnabled?: boolean;
  data?: IProjectData;
  constructor(newProjectId: number, { apiClient }: { apiClient: ApiClient }) {
    this.projectId = newProjectId;
    this.projectName = "(unknown)";
    this.apiClient = apiClient;
    this.mixParams = {};
  }

  toString(): string {
    return `Roundware Project '${this.projectName}' (#${this.projectId})`;
  }
  /**
   * @param  {number} sessionId
   * @returns {Promise} sessionId | undefined
   */
  async connect(sessionId: number): Promise<number | undefined> {
    const path = "/projects/" + this.projectId + "/";

    const requestData = { session_id: sessionId };

    try {
      const data = await this.apiClient.get<IProjectData>(path, requestData);
      //console.info({ PROJECTDATA: data });
      this.data = data;
      this.projectName = data.name;
      this.legalAgreement = data.legal_agreement;
      this.recordingRadius = data.recording_radius;
      this.maxRecordingLength = parseInt(data.max_recording_length.toString());
      this.location = { latitude: data.latitude, longitude: data.longitude };
      this.outOfRangeDistance = data.out_of_range_distance;
      this.mixParams = {
        geoListenMode: data.geo_listen_enabled
          ? GeoListenMode.MANUAL
          : GeoListenMode.DISABLED,
        recordingRadius: data.recording_radius,
        ordering: data.ordering,
        ...this.mixParams,
      };

      return sessionId;
    } catch (err) {
      console.error("Unable to get Project details", err);
    }
  }
  /**
   * @param  {number} sessionId
   * @returns Promise<IUiConfig>
   */
  async uiconfig(sessionId: number): Promise<IUiConfig> {
    const path = "/projects/" + this.projectId + "/uiconfig/";
    const data = { session_id: sessionId };

    return await this.apiClient.get<IUiConfig>(path, data);
  }
}
