import { logger } from "./shims";

var projectId, apiClient;
var projectName = "(unknown)";
var pubDate, audioFormat;

export class Project {
  constructor(newProjectId,options) {
    projectId = newProjectId;
    apiClient = options.apiClient;
  }

  toString() {
    return `Roundware Project '${projectName}' (#${projectId})`;
  }

  connect(sessionId) {
    var path = "/projects/" + projectId;

    var data = {
      session_id: sessionId
    };

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        projectName = data.name;
        pubDate = data.pub_date;
        audioFormat = data.audio_format;
        return sessionId;
      });
  }

  uiconfig(sessionId) {
    var path = "/projects/" + projectId + "/uiconfig/";

    var data = {
      session_id: sessionId
    };

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        // let this._uiConfig = data;
        return data;
      });
  }
}
