const PATH = "/speakers/";

export class Speaker {
  constructor(projectId,{ apiClient }) {
    this.projectId = projectId;
    this.apiClient = apiClient;
  }

  toString() {
    return `Roundware Speaker (#${this.projectId})`;
  }

  connect({ ...data }) {
    return this.apiClient.get(PATH,{ ...data, project_id: this.projectId });
  }
}
