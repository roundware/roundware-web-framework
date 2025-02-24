import { ApiClient } from "./api-client";

/** Responsible for establishing a session with the Roundware server **/

export class Session {
  sessionId: number | null = null;
  clientSystem: string = "Unknown";
  projectId: number | undefined;
  geoListenEnabled: boolean;
  apiClient: ApiClient;
  /** Create a new Session
   * @param {object} navigator - provides access to the userAgent string
   * @param {Number} newProjectId - identifies the Roundware project to associate with this session
   * @param {Boolean} geoListenEnablement - whether the server should enable geo listening features
   * @param {Object} options - Various configuration parameters for this session
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
   **/
  constructor(
    navigator: Window[`navigator`],
    newProjectId: number,
    geoListenEnablement: boolean,
    options: {
      apiClient: ApiClient;
    }
  ) {
    this.clientSystem = navigator.userAgent;

    if (this.clientSystem.length > 127) {
      // on mobile browsers, this string is longer than the server wants
      this.clientSystem = this.clientSystem.slice(0, 127);
    }

    this.projectId = newProjectId;
    this.geoListenEnabled = geoListenEnablement;

    this.apiClient = options.apiClient;
  }

  /** @returns {String} human-readable representation of this session **/
  toString(): string {
    return "Roundware Session #" + (this.sessionId || "not yet established");
  }

  /** Make an asynchronous API call to establish a session with the Roundware server
   * @return {Promise} sessionId
   **/
  async connect(): Promise<number> {
    const requestData = {
      project_id: this.projectId,
      geo_listen_enabled: this.geoListenEnabled,
      client_system: this.clientSystem,
    };

    const data = await this.apiClient.post<{ id: number }>(
      "/sessions/",
      requestData
    );
    this.sessionId = data.id;

    return this.sessionId;
  }
}
