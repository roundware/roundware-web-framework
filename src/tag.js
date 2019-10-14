const PATH = "/tags/";

export class Tag {
  constructor(projectId,{ apiClient }) {
    this.projectId = projectId;
    this.apiClient = apiClient;
  }

  toString() {
    return `Roundware Tags (#${this.projectId})`;
  }

  connect({ ...data }) {
    return this.apiClient.get(PATH,{ ...data, project_id: this.projectId });
  }
}
