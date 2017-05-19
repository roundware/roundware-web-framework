import logger from "./logger";

var apiClient, sessionId, streamId, streamApiUrl, streamAudioUrl, coords, heartbeatUrl, heartbeatInterval;
const defaultHeartbeatInterval = 5000; // 5 seconds, TODO make this larger once we are stable

export class Stream {
  constructor(options) {
    apiClient = options.apiClient;
    heartbeatInterval = options.heartbeatInterval || defaultHeartbeatInterval;
  }

  toString() {
    return `Roundware Stream #${streamId} (${streamUrl})`;
  }

  updateGeoposition(_coords) {
    coords = _coords;
    this.update(coords);
  }
    
  update(data) {
    if (streamApiUrl && data) {
      data.session_id = sessionId;
      apiClient.patch(streamApiUrl,data);
    }
  }

  activateHeartbeat() {
    setInterval(() => {
      var heartbeatData = {
        session_id: sessionId,
      };

      console.info("Activating heartbeat for " + defaultHeartbeatInterval);
      apiClient.post(heartbeatUrl,heartbeatData);
    },defaultHeartbeatInterval);
  }

  connect(_sessionId,initialGeoLocation) {
    sessionId = _sessionId;

    return initialGeoLocation.then((data,geoMonitor) => { 
      data.session_id = sessionId;

      // make sure we update our local state with the first position
      this.updateGeoposition(data);

      // then register our interest in further position updates
      geoMonitor.progress((data) => this.updateGeoposition(data));

      return apiClient.post("/streams/",data,{
        crossDomain: true,
        cache: true // to avoid CORS problems
      });
    }).then(function streamsSuccess(data) {
        streamAudioUrl = data.stream_url;
        streamId = data.stream_id;
        streamApiUrl = `/streams/${streamId}/`;
        heartbeatUrl = `/streams/${streamId}/heartbeat/`;
        return streamAudioUrl;
    }).done(() => this.activateHeartbeat());
  }
}
