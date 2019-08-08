var projectId, apiClient;

export class Speaker {
  constructor(newProjectId,options) {
    projectId = newProjectId;
    apiClient = options.apiClient;
  }

  toString() {
    return `Roundware Speaker (#${projectId})`;
  }

  connect(data={}) {
    var path = "/speakers/";
    // add project_id to any incoming filter data
    data['project_id'] = projectId;

    return apiClient.get(path,data).
      then(function connectionSuccess(data) {
        return data;
      });
  }
}
