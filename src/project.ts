import { IApiClient } from "./types/api-client";
import { GeoListenMode } from "./mixer";
import { Coordinates } from "./types";

export interface UiConfig {}

export interface IProject {
  uiconfig(sessionId: string): Promise<UiConfig>;
  mixParams: any;
  toString(): string;
  connect(sessionId: string): Promise<string | undefined>;
  projectId: number;
}
export class Project implements IProject {
  projectId: number;
  projectName: string;
  apiClient: IApiClient;
  legalAgreement: unknown;
  recordingRadius: unknown;
  maxRecordingLength: unknown;
  location: Coordinates = { latitude: 1, longitude: 1 };
  mixParams: {};

  constructor(newProjectId: number, { apiClient }: { apiClient: IApiClient }) {
    this.projectId = newProjectId;
    this.projectName = "(unknown)";
    this.apiClient = apiClient;
    this.mixParams = {};
  }

  toString(): string {
    return `Roundware Project '${this.projectName}' (#${this.projectId})`;
  }

  async connect(sessionId: string): Promise<string | undefined> {
    const path = "/projects/" + this.projectId + "/";

    const requestData = { session_id: sessionId };

    try {
      const data = await this.apiClient.get<{
        name: string;
        legal_agreement: unknown;
        recording_radius: unknown;
        max_recording_length: unknown;
        latitude: number;
        longitude: number;
        geo_listen_enabled: boolean;
        ordering: unknown;
      }>(path, requestData);
      //console.info({ PROJECTDATA: data });

      this.projectName = data.name;
      this.legalAgreement = data.legal_agreement;
      this.recordingRadius = data.recording_radius;
      this.maxRecordingLength = data.max_recording_length;
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

  async uiconfig(sessionId: string): Promise<UiConfig> {
    const path = "/projects/" + this.projectId + "/uiconfig/";
    const data = { session_id: sessionId };

    return await this.apiClient.get<UiConfig>(path, data);
  }
}
