/* jshint esversion: 6 */

import logger from "./logger";

var clientSystem = "Unknown";
var projectId, sessionId, geoListenEnabled;
var apiClient = {};

export class Session {
  constructor (newProjectId,geoListenEnablement,options) {
    projectId = newProjectId;
    geoListenEnabled = geoListenEnablement;

    apiClient = options.apiClient;

    clientSystem = navigator.userAgent;

    if (clientSystem.length > 127) {
      // on mobile browsers, this string is longer than the server wants
      clientSystem = clientSystem.slice(0,127);
    }
  }

  toString() {
    return "Roundware Session #" + sessionId;
  }

  connect() {
    var data = {
      project_id: projectId,
      geo_listen_enabled: geoListenEnabled,
      client_system: clientSystem
    };

    return apiClient.post("/sessions/",data).
      then(function connectionSuccess(data) {
        sessionId = data.session_id;
        return sessionId;
      });
  }
}
