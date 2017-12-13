import { logger } from "./shims";

const defaultHeartbeatIntervalSeconds = 60;

/** Establishes an audio stream with the Roundware server, and notifies Roundware of events like tag
 * and geoposition updates 
 * @todo skip/ - causes currently playing asset to fade out and next available asset in playlist to begin playing thereafter
 * @todo playasset/ - causes currently playing asset to fade out and asset specified by asset_id param is played thereafter
 * @todo replayasset/ - causes currently playing asset to fade out and start playing again
 * @todo pause/ - causes currently playing asset to fade out and prevents any further assets from being added to the stream (though the playlist continues to be updated per PATCH calls)
 * @todo resume/ - un-does pause by allowing assets to be added to stream again from the playlist
 * **/
export class Stream {
  /** Create a new Stream 
   * @param {Object} options - Various configuration parameters for this stream
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
   * @param {Number} [options.heartbeatIntervalSeconds = 60"] how frequently to send a stream heartbeat
   **/
  constructor(options) {
    this._apiClient = options.apiClient;
    this._streamId = "(unknown)";
    this._heartbeatInterval = (options.heartbeatIntervalSeconds || defaultHeartbeatIntervalSeconds) * 1000;
  }

  /** @returns {String] human-readable description of this stream **/
  toString() {
    return `Roundware Stream #${this._streamId} (${this._streamApiPath})`;
  }

  /** Request a streaming audio URL from Roundware server and establish a regular heartbeat. The heartbeat is used to keep a stream alive 
   * during a session. Streams take a lot of resources on the server, so we put the auto-kill mechanism in place to not have useless 
   * streams taking resources, but needed a method to keep them alive when we know they are still wanted. After we initially connect to Roundware,
   * subsequent calls are forwarded to the Roundware server as "resume playing" API messages.
   * @param {Number} sessionId - Identifies the current session, must have been previously established by an instance of the Session class
   * @param {Promise}  initialGeoLocation - we will wait on this promise to resolve with initial coordinates before attempting to establish a stream
   * @param {Stream~firstPlayCallback} firstPlayCallback - invoked the first time we connect to roundware and retrieve a stream URL
   * @returns {Promise} represents the pending API call 
   * @see pause()
   * **/
  play(sessionId,initialLocation,firstPlayCallback = (streamAudioUrl) => {}) {
    if (this._streamApiPath) {
      let resumePlayingPath = `${this._streamApiPath}resume/`;
      return this._apiClient.post(resumePlayingPath);
    }
    
    this._sessionId = sessionId;

    // Object.assign(createStreamData,initialLocation,{ session_id: this._sessionId });

    let createStreamData = new FormData();

    createStreamData.append('session_id',this._sessionId);
    createStreamData.append('latitude',initialLocation.latitude); // marker.position.lat());
    createStreamData.append('longitude',initialLocation.longitude); //marker.position.lng());
    console.log(createStreamData.get('session_id'));

    let streamConnectionPromise = this._apiClient.post("/streams/",createStreamData,{
      cache: true, // to avoid CORS problems TODO remove this
      processData: false,
      contentType: 'multipart/form-data'
    });

    streamConnectionPromise.then((streamData) => {
      this._streamAudioUrl = streamData.stream_url;
      this._streamId = streamData.stream_id;
      this._streamApiPath = `/streams/${this._streamId}/`;

      this._heartbeatUrl = `/streams/${this._streamId}/heartbeat/`;

      let heartbeatData = {
        session_id: this._sessionId
      };

      firstPlayCallback(this._streamAudioUrl);

      setInterval(() => {
        this._apiClient.post(this._heartbeatUrl,heartbeatData);
      },this._heartbeatInterval);
    });

    return streamConnectionPromise;
  }

  /** Tells Roundware server to pause the audio stream - you should always call this when pausing
   * local playback, to avoid wasting server resources **/
  pause() {
    if (this._streamAudioUrl) {
      let pausePlayingPath = `${this._streamApiPath}pause/`;
      this._apiClient.post(pausePlayingPath);
    }
  }

  /** Sends data to the Roundware server. If the Stream has not been established, does nothing. Can use a list of tag_ids or a position (lat/lon) to filter the assets available to the stream. 
   * Typically for a normal geo-listen project, the position PATCH calls are triggered automatically by the client’s GPS/location system: every time a new position is registered by the client, 
   * a PATCH call is sent to let the server know and the server acts accordingly by adjusting the underlying music mix as well as modifying the playlist of available assets to be played. 
   * @param {Object} data [{}] 
   * **/
  update(data = {}) {
    if (this._streamApiPath) {
      let updateStreamData = new FormData();

      updateStreamData.append('session_id',this._sessionId);
      updateStreamData.append('latitude',data.latitude);
      updateStreamData.append('longitude',data.longitude);
      updateStreamData.append('tag_ids',data.tagIds);

      data.session_id = this._sessionId;
      return this._apiClient.patch(this._streamApiPath,updateStreamData,{
        cache: true, // to avoid CORS problems TODO remove this
        processData: false,
        contentType: 'multipart/form-data'
      });
    }
  }

  /** Tells Roundware server to kill the audio stream **/
  kill() {
    if (this._streamAudioUrl) {
      let killPlayingPath = `${this._streamApiPath}kill/`;
      this._apiClient.post(killPlayingPath);
    }
  }
}

/**
 * This callback is invoked by play() the first time we connect to Roundware and get an audio stream URL
 * @callback Streamam~firstPlayCallback
 * @param {string} streamAudioUrl - the URL of the stream, ready to connect to an audio source for playback
 */
