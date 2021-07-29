import { ISession } from "./types";
import { IApiClient } from "./types/api-client";

let clientSystem: string = "Unknown";
let projectId: number | undefined, sessionId: string, geoListenEnabled: boolean;
let apiClient: IApiClient;

/** Responsible for establishing a session with the Roundware server **/

export class Session implements ISession {
  sessionId: number | undefined;

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
      apiClient: IApiClient;
    }
  ) {
    clientSystem = navigator.userAgent;

    if (clientSystem.length > 127) {
      // on mobile browsers, this string is longer than the server wants
      clientSystem = clientSystem.slice(0, 127);
    }

    projectId = newProjectId;
    geoListenEnabled = geoListenEnablement;

    apiClient = options.apiClient;
  }

  /** @returns {String} human-readable representation of this session **/
  toString(): string {
    return "Roundware Session #" + sessionId;
  }

  /** Make an asynchronous API call to establish a session with the Roundware server
   * @return {Promise} represents the pending API call
   **/
  async connect() {
    const requestData = {
      project_id: projectId,
      geo_listen_enabled: geoListenEnabled,
      client_system: clientSystem,
    };

    const data = await apiClient.post<{ id: number }>(
      "/sessions/",
      requestData
    );
    this.sessionId = data.id;

    return this.sessionId;
  }
}
