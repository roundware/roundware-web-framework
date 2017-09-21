import { Project } from "./project";
import { Session } from "./session";
import { GeoPosition } from "./geo-position";
import { Stream } from "./stream";
import { logger } from "./shims";
import { ApiClient } from "./api-client";
import { User } from "./user";
import { Envelope } from "./envelope";

/** This class is the primary integration point between Roundware's server and your application 
    NOTE that we depend on jQuery being injected, because we use its $.ajax function. As browsers
    evolve and the whatwg-fetch polyfill evolves, we may be able to switch over to using window.fetch

   @example
   var roundwareServerUrl = "http://localhost:8888/api/2";
   var roundwareProjectId = 1;

   var roundware = new Roundware(window,{
     serverUrl: roundwareServerUrl,
     projectId: roundwareProjectId
   });

   function ready() {
     console.info("Connected to Roundware Server. Ready to play.");
     // this is a good place to initialize audio player controls, etc.
   }

   // Generally we throw user-friendly messages and log a more technical message
   function handleError(userErrMsg) {
     console.error("Roundware Error: " + userErrMsg);
   }

  roundware.connect().
    then(ready).
    catch(handleError);

  function startListening(streamURL) {
    console.info("Loading " + streamURL);
    // good place to connect your audio player to the audio stream
  }

  roundware.play(startListening).catch(handleError);
**/
class Roundware {
  /** Initialize a new Roundware instance
   * @param {Object} window - representing the context in which we are executing - provides references to window.navigator, window.console, etc.
   * @param {Object} options - Collection of parameters for configuring this Roundware instance
   * @param {String} options.serverUrl - identifies the Roundware server
   * @param {Number} options.projectId - identifies the Roundware project to connect
   * @param {Boolean} options.geoListenEnabled - whether or not to attempt to initialize geolocation-based listening
   * @throws Will throw an error if serveUrl or projectId are missing **/
  constructor(window,options = {}) {
    this._serverUrl = options.serverUrl;
    this._projectId = options.projectId;

    if (this._serverUrl === undefined) {
      throw "Roundware objects must be initialized with a serverUrl";
    }

    if (this._projectId === undefined) {
      throw "Roundware objects must be initialized with a projectId";
    }

    this._apiClient = new ApiClient(window,this._serverUrl);
    options.apiClient = this._apiClient;

    let navigator = window.navigator;

    this._user        = options.user        || new User(options);
    this._geoPosition = options.geoPosition || new GeoPosition(navigator,options);
    this._session     = options.session     || new Session(navigator,this._projectId,this._geoPosition.geoListenEnabled,options);
    this._project     = options.project     || new Project(this._projectId,options);
    this._stream      = options.stream      || new Stream(options);
  }

  /** Initiate a connection to Roundware
   *  @return {Promise} - Can be resolved in order to get the audio stream URL, or rejected to get an error message; see example above **/
  connect() {
    let that = this;

    this._geoPosition.connect(function(newCoords) { 
      // want to start this process as soon as possible, as it can take a few seconds
      that._stream.update(newCoords);
    });

    logger.info("Initializing Roundware for project ID #" + this._projectId);

    return this._user.connect().
      then(this._session.connect).
      then(this._project.connect).
      then((sessionId) => this._sessionId = sessionId);
  }

  /** Create or resume the audio stream o
   * @see Stream.play **/
  play(firstPlayCallback = () => {}) {
    return this._geoPosition.waitForInitialGeolocation().then((initialCoordinates) => {
      return this._stream.play(this._sessionId,initialCoordinates,firstPlayCallback);
    });
  }

  /** Tell Roundware server to pause the audio stream. You should always call this when the local audio player has been paused.
   * @see Stream.pause **/
  pause() {
    this._stream.pause();
  }

  /** Update the Roundware stream with new tag IDs 
   * @param {string} tagIdStr - comma-separated list of tag IDs to send to the streams API **/
  tags(tagIdStr) {
    this._stream.update({ tag_ids: tagIdStr });
  }

  /** Attach new assets to the project
   * @param {Object} audioData - the binary data from a recording to be saved as an asset
   * @param {string} fileName - name of the file
   * @return {promise} - represents the API calls to save an asset; can be tested to find out whether upload was successful
   * @see Envelope.upload */
  saveAsset(audioData,fileName) {
    if (!this._sessionId) {
      return Promise.reject("can't save assets without first connecting to the server");
    }

    let envelope = new Envelope(this._sessionId,this._apiClient,this._geoPosition);

    return envelope.connect().
      then(function() {
        envelope.upload(audioData,fileName);
      });
  }
}

// Slight hack here to export Roundware module to browser properly; see https://github.com/webpack/webpack/issues/3929
module.exports = Roundware;
