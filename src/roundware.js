import { Project } from "./project";
import { Session } from "./session";
import { Speaker } from "./speaker";
import { GeoPosition } from "./geo-position";
import { Stream } from "./stream";
import { Asset } from "./asset";
import { TimedAsset } from "./timed_asset";
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
   * @param {Object} windowScope - representing the context in which we are executing - provides references to window.navigator, window.console, etc.
   * @param {Object} options - Collection of parameters for configuring this Roundware instance
   * @param {String} options.serverUrl - identifies the Roundware server
   * @param {Number} options.projectId - identifies the Roundware project to connect
   * @param {Boolean} options.geoListenEnabled - whether or not to attempt to initialize geolocation-based listening
   * @throws Will throw an error if serveUrl or projectId are missing
    TODO need to provide a more modern/ES6-aware architecture here vs burdening the constructor with all of these details **/
  constructor(windowScope,{ serverUrl, projectId, speakerFilters, assetFilters, listenerLocation, user, geoPosition, session, project, stream, speaker, asset, timedAsset, audiotrack, ...options }) {
    this.windowScope = windowScope;
    this._serverUrl = serverUrl;
    this._projectId = projectId;
    this._speakerFilters = speakerFilters;
    this._assetFilters = assetFilters;
    this._listenerLocation = listenerLocation;

    if (this._serverUrl === undefined) {
      throw "Roundware objects must be initialized with a serverUrl";
    }

    if (this._projectId === undefined) {
      throw "Roundware objects must be initialized with a projectId";
    }

    this._apiClient = new ApiClient(window,this._serverUrl);
    options.apiClient = this._apiClient;

    let navigator = window.navigator;

    // TODO need to reorganize/refactor these classes
    this._user        = user        || new User(options);
    this._geoPosition = geoPosition || new GeoPosition(navigator,options);
    this._session     = session     || new Session(navigator,this._projectId,this._geoPosition.geoListenEnabled,options);
    this._project     = project     || new Project(this._projectId,options);
    this._stream      = stream      || new Stream(options);
    this._speaker     = speaker     || new Speaker(this._projectId,options);
    this._asset       = asset       || new Asset(this._projectId,options);
    this._timed_asset = timedAsset  || new TimedAsset(this._projectId,options);
    this._audiotrack  = audiotrack  || new Audiotrack(this._projectId,options);
  }

  updateLocation(newLocation) {
    this._listenerLocation = newLocation;
    console.log('Position change',newLocation);

    if (this._stream) this._stream.update(newLocation);
    if (this._mixer) this._mixer.updateListenerLocation(newLocation);
  }

  /** Initiate a connection to Roundware
   *  @return {Promise} - Can be resolved in order to get the audio stream URL, or rejected to get an error message; see example above **/
  async connect() {
    // want to start this process as soon as possible, as it can take a few seconds
    this._geoPosition.connect(newLocation => this.updateLocation(newLocation));

    logger.info(`Initializing Roundware for project ID ${this._projectId}`);

    try {
      await this._user.connect();
      const sessionId = await this._session.connect();
      this._sessionId = sessionId;

      const promises = [
        this._project.connect(sessionId),
        this._project.uiconfig(sessionId).then(uiConfig => this._uiConfig = uiConfig),
        this._speaker.connect(this._speakerFilters).then(speakerData => this._speakerData = speakerData),
        this._asset.connect(this._assetFilters).then(assetData => this._assetData = assetData),
        this._timed_asset.connect().then(data => this._timedAssetData = data),
        this._audiotrack.connect().then(audioTracksData => this._audioTracksData = audioTracksData)
      ];

      await Promise.all(promises);
      console.info('Roundware connected');
    } catch(err) {
      console.error("Unable to connect to Roundware",err);
      throw "Sorry, we were unable to connect to Roundware. Please try again.";
    }
  }

  get mixParams() {
    return (this._project || {}).mixParams;
  }

  activateMixer({ audioContext }) {
    const mixParams = {
      ...this.mixParams,
      geoListenEnabled: this._geoPosition.geoListenEnabled
    };

    this._mixer = new Mixer({ 
      client: this,
      windowScope: this.windowScope,
      listenerLocation: this._listenerLocation,
      mixParams, 
      audioContext
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

  timedAssets() {
    return this._timedAssetData || [];
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
