import { logger } from "./shims";

var projectId, apiClient;

export class Speaker {
  constructor(newProjectId,options) {
    projectId = newProjectId;
    apiClient = options.apiClient;
  }

  toString() {
    return `Roundware Speaker '${projectName}' (#${projectId})`;
  }

  connect(sessionId) {
    var path = "/speakers/";

    var data = {
      project_id: projectId,
      activeyn: true
    };

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        return data;
      });
  }
}
