//var projectId, apiClient;
//var projectName = "(unknown)";
//var pubDate, audioFormat, recordingRadius, location, geoListenEnabled;

export class Project {
  constructor(newProjectId,{ apiClient }) {
    this.projectId = newProjectId;
    this.projectName = "(unknown)";
    this.apiClient = apiClient;
    this.mixParams = {};
  }

  toString() {
    return `Roundware Project '${this.projectName}' (#${this.projectId})`;
  }

  async connect(sessionId) {
    const path = "/projects/" + this.projectId + "/";

    const requestData = { session_id: sessionId };

    try {
      const data = await this.apiClient.get(path,requestData);
      //console.info({ PROJECTDATA: data });

      this.projectName         = data.name;
      this.legalAgreement      = data.legal_agreement;
      this.recordingRadius     = data.recording_radius;
      this.maxRecordingLength  = data.max_recording_length;
      this.location            = { latitude: data.latitude,
                                   longitude: data.longitude };

      this.mixParams = {
        geoListenEnabled: data.geo_listen_enabled,
        recordingRadius: data.recording_radius,
        ordering: data.ordering,
        ...this.mixParams,
      };

      return sessionId;
    } catch(err) {
      console.error("Unable to get Project details",err);
    }
  }

  uiconfig(sessionId) {
    const path = "/projects/" + this.projectId + "/uiconfig/";
    const data = { session_id: sessionId };

    return this.apiClient.get(path,data);
  }
}
