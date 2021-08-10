import { GeoListenMode } from "./mixer";
import { Coordinates, IUiConfig } from "./types";
import { ApiClient } from "./api-client";

export class Project {
  projectId: number;
  projectName: string;
  apiClient: ApiClient;
  legalAgreement: string = "";
  recordingRadius!: number;
  maxRecordingLength?: number;
  location: Coordinates = { latitude: 1, longitude: 1 };
  mixParams: {};

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
      const data = await this.apiClient.get<{
        name: string;
        legal_agreement: string;
        recording_radius: number;
        max_recording_length: number | string;
        latitude: number;
        longitude: number;
        geo_listen_enabled: boolean;
        ordering: unknown;
      }>(path, requestData);
      //console.info({ PROJECTDATA: data });

      this.projectName = data.name;
      this.legalAgreement = data.legal_agreement;
      this.recordingRadius = data.recording_radius;
      this.maxRecordingLength = parseInt(data.max_recording_length.toString());
      this.location = { latitude: data.latitude, longitude: data.longitude };

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
