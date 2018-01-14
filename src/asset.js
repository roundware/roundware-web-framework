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

  connect(data={}) {
    var path = "/assets/";
    // add project_id to any incoming filter data
    data['project_id'] = projectId;

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        return data;
      });
  }
}
