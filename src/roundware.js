import { Project } from "./project";
import { Session } from "./session";
import { Speaker } from "./speaker";
import { GeoPosition } from "./geo-position";
import { Stream } from "./stream";
import { Asset } from "./asset";
import { logger } from "./shims";
import { ApiClient } from "./api-client";
import { User } from "./user";
import { Envelope } from "./envelope";
import { Mixer } from "./mixer";
import { Audiotrack } from "./audiotrack";

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
export default class Roundware {
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
    this._speakerFilters = options.speakerFilters;
    this._assetFilters = options.assetFilters;

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
    this._speaker     = options.speaker     || new Speaker(this._projectId,options);
    this._asset       = options.asset       || new Asset(this._projectId,options);
    this._audiotrack  = options.audiotrack  || new Audiotrack(this._projectId,options);
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

    // TODO refactor the calls after session connection into independent sets of promises, since some of these requests can run in in parallel; then we can just wait on a single Promise.all() call
    return this._user.connect().
      then(this._session.connect).
      then(sessionId => this._project.connect(sessionId)).
      then(sessionId => this._sessionId = sessionId).
      then(this._project.uiconfig).
      then(uiConfig => this._uiConfig = uiConfig).
      then(() => this._speaker.connect(this._speakerFilters)).
      then(speakerData => this._speakerData = speakerData).
      then(() => this._asset.connect(this._assetFilters)).
      then(assetData => this._assetData = assetData).
      then(() => this._audiotrack.connect()).
      then(audioTracksData => this._audioTracksData = audioTracksData);
  }

  get currentLocation() {
    throw 'need to implement';
  }

  activateMixer(options = {}) {
    const mixParams = { 
      ...this._project.data,
      currentLocation: this.currentLocation
    };

    console.info('MIXPARAMS',mixParams);

    this._mixer = new Mixer({ 
      client: this, 
      mixParams, 
      ...options 
    });

    return this._mixer;
  }

  
  /** Create or resume the audio stream
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

  /** Tell Roundware server to kill the audio stream.
   * @see Stream.kill **/
  kill() {
    this._stream.kill();
  }

  /** Tell Roundware server to replay the current asset.
   * @see Stream.replay **/
  replay() {
    this._stream.replay();
  }

  /** Tell Roundware server to skip the current asset.
   * @see Stream.skip **/
  skip() {
    this._stream.skip();
  }

  /** Update the Roundware stream with new tag IDs
   * @param {string} tagIdStr - comma-separated list of tag IDs to send to the streams API **/
  tags(tagIdStr) {
    this._stream.update({ tag_ids: tagIdStr });
  }

  /** Update the Roundware stream with new tag IDs and or geo-position
   * @param {object} data - containing keys latitude, longitude and tagIds **/
  update(data = {}) {
    // Object.keys(data).map(e => console.log(`key=${e}  value=${data[e]}`));
    this._stream.update(data);
  }

  speakers() {
    return this._speakerData || [];
  }

  assets() {
    return this._assetData || [];
  }

  audiotracks() {
    return this._audioTracksData || [];
  }

  /** Attach new assets to the project
   * @param {Object} audioData - the binary data from a recording to be saved as an asset
   * @param {string} fileName - name of the file
   * @return {promise} - represents the API calls to save an asset; can be tested to find out whether upload was successful
   * @see Envelope.upload */
  saveAsset(audioData,fileName,data) {
    if (!this._sessionId) {
      return Promise.reject("can't save assets without first connecting to the server");
    }

    let envelope = new Envelope(this._sessionId,this._apiClient,this._geoPosition);

    return envelope.connect().
      then(function() {
        envelope.upload(audioData,fileName,data);
      });
  }
}
