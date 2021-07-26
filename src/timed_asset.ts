const PATH = "/timedassets/";

export class TimedAsset {
  constructor(projectId,{ apiClient }) {
    this.projectId = projectId;
    this.apiClient = apiClient;
  }

  toString() {
    return `Roundware TimedAssets (#${this.projectId})`;
  }

  connect({ ...data }) {
    const options = { ...data, project_id: this.projectId };
    return this.apiClient.get(PATH,options);
  }
}
