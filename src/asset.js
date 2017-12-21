import { logger } from "./shims";

var projectId, apiClient;

export class Asset {
  constructor(newProjectId,options) {
    projectId = newProjectId;
    apiClient = options.apiClient;
  }

  toString() {
    return `Roundware Assets '${projectName}' (#${projectId})`;
  }

  connect(sessionId) {
    var path = "/assets/";

    // TODO: add other available filtering params
    var data = {
      project_id: projectId,
      submitted: true,
      media_type: 'audio'
    };

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        return data;
      });
  }
}
