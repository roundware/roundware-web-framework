import { logger } from "./shims";

var clientSystem = "Unknown";
var projectId, sessionId, geoListenEnabled;
var apiClient = {};

/** Responsible for establishing a session with the Roundware server **/
export class Session {
  /** Create a new Session
   * @param {object} navigator - provides access to the userAgent string
   * @param {Number} newProjectId - identifies the Roundware project to associate with this session
   * @param {Boolean} geoListenEnablement - whether the server should enable geo listening features
   * @param {Object} options - Various configuration parameters for this session
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
  **/
  constructor (navigator,newProjectId,geoListenEnablement,options) {
    clientSystem = navigator.userAgent;

    if (clientSystem.length > 127) {
      // on mobile browsers, this string is longer than the server wants
      clientSystem = clientSystem.slice(0,127);
    }

    projectId = newProjectId;
    geoListenEnabled = geoListenEnablement;

    apiClient = options.apiClient;
  }

  /** @returns {String} human-readable representation of this session **/
  toString() {
    return "Roundware Session #" + sessionId;
  }

  /** Make an asynchronous API call to establish a session with the Roundware server
   * @returns {Promise} represents the pending API call
   **/
  connect() {
    let requestData = {
      project_id: projectId,
      geo_listen_enabled: geoListenEnabled,
      client_system: clientSystem
    };

    return apiClient.post("/sessions/",requestData).
      then((data) => {
        sessionId = data.session_id;
        return sessionId;
      });
  }
}
