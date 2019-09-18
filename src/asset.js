const PATH = "/assets/";
//const PATH = "/assets/?created__lte=2019-08-15T18:06:39"; // TODO remove this

export class Asset {
  constructor(projectId,{ apiClient }) {
    this.projectId = projectId;
    this.apiClient = apiClient;
  }

  toString() {
    return `Roundware Assets (#${this.projectId})`;
  }

  connect({ ...data }) {
    const options = { ...data, project_id: this.projectId };
    return this.apiClient.get(PATH,options);
  }
}
