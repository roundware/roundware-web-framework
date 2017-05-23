import { logger } from "./shims";

var apiClient, sessionId, streamId, streamApiUrl, streamAudioUrl, coords, heartbeatInterval;
const defaultHeartbeatIntervalSeconds = 60;

/** Establishes an audio stream with the Roundware server, and notifies Roundware of events like tag
 * and geoposition updates **/
export class Stream {
  /** Create a new Stream 
   * @param {Object} options - Various configuration parameters for this stream
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
   * @param {Number} [options.heartbeatIntervalSeconds = 60"] how frequently to send a stream heartbeat
  **/
  constructor(options) {
    apiClient = options.apiClient;
    heartbeatInterval = (options.heartbeatIntervalSeconds || defaultHeartbeatIntervalSeconds) * 1000;
  }

  /** @returns {String] human-readable description of this stream **/
  toString() {
    return `Roundware Stream #${streamId} (${streamApiUrl})`;
  }

  /** Notifies Roundware server of the listener's new coordinates 
   * @param {Object} coords - Describes current position (typically produced by an instance of the Geolocation class)
   * @param {Number} coords.latitude
   * @param {Number} coords.longitude
   * @see Geolocation **/
  //updateGeoposition(_coords) {
    //coords = _coords;
    //this.update(coords);
  //}
    
  /** Request a streaming audio URL from Roundware server
   * @param {Number} _sessionId - Identifies the current session, must have been previously established by an instance of the Session class
   * @param {Promise}  initialGeoLocation - we will wait on this promise to resolve with initial coordinates before attempting to establish a stream
   * @returns {Promise} represents the pending API call **/
  connect(_sessionId,initialGeoLocation) {
    sessionId = _sessionId;

    return initialGeoLocation.then((coords) => { 
      let createStreamData = {};
      Object.assign(createStreamData,coords,{ session_id: sessionId });

      // Now we ask the server to create a new audio stream for us
      let audioStreamPromise = apiClient.post("/streams/",createStreamData,{
        crossDomain: true,
        cache: true // to avoid CORS problems
      });

      return audioStreamPromise;
    }).then(function streamsSuccess(streamData) {
        streamAudioUrl = streamData.stream_url;
        streamId = streamData.stream_id;
        streamApiUrl = `/streams/${streamId}/`;

        let heartbeatUrl = `/streams/${streamId}/heartbeat/`;
        let heartbeatData = {
          session_id: sessionId
        };

        setInterval(function sendHeartbeat() {
          apiClient.post(heartbeatUrl,heartbeatData);
        },heartbeatInterval);

        // return the audio URL back to the caller so this promise can be chained in the Roundware class
        return streamAudioUrl;
    });
  }

  /** Sends data to the Roundware server. If the Stream has not been established, does nothing.
   * @param {Object} data [{}] **/
  update(data = {}) {
    if (streamApiUrl) {
      data.session_id = sessionId;
      apiClient.patch(streamApiUrl,data);
    }
  }
}
