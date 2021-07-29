import { IProject, Project } from "./project";
import { ISession, Session } from "./session";
import { Speaker } from "./speaker";
import { ISpeaker, ISpeakerFilters } from "./types/speaker";
import { GeoPosition, IGeoPosition } from "./geo-position";
import { Asset } from "./asset";
import { IAsset, IAssetFilters } from "./types/asset";
import { ITimedAsset, ITimedAssetData, TimedAsset } from "./timed_asset";
import { logger } from "./shims";
import { ApiClient } from "./api-client";
import { User } from "./user";
import { IUser } from "./types/user";
import { Envelope } from "./envelope";
import { IEnvelope } from "./types/envelope";
import { Mixer, GeoListenMode } from "./mixer";
import { Audiotrack } from "./audiotrack";
import { IAudioTrack } from "./types/audioTrack";
import { ASSET_PRIORITIES } from "./assetFilters";
import { IApiClient } from "./types/api-client";
import {
  IAssetData,
  Coordinates,
  IInitialParams,
  IUiConfig,
  TimedAssetT,
  IAudioData,
} from "./types";
import {
  IOptions,
  IRoundware,
  IRoundwareConstructorOptions,
} from "./types/roundware";
import { IMixer } from "./types/mixer";
import { ISpeakerData } from "./types/speaker";
import { IAudioTrackData } from "./types/audioTrack";
import { IAssetPool } from "./types/assetPool";

export * from "./assetFilters";
export { GeoListenMode } from "./mixer";

/** This class is the primary integration point between Roundware's server and your application

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

export class Roundware implements IRoundware {
  readonly windowScope: Window;
  private _serverUrl: string;
  private _projectId: number;
  private _speakerFilters: ISpeakerFilters = {};
  private _assetFilters: IAssetFilters;
  private _listenerLocation: Coordinates;
  private _initialOptions: IOptions;
  private _assetUpdateInterval: number;
  private _apiClient: IApiClient;

  private _user: IUser;
  private _geoPosition: IGeoPosition;
  private _session: ISession;
  private _project: IProject;
  private _speaker: ISpeaker;
  private _asset: IAsset;
  private _timed_asset: ITimedAsset;
  private _audiotrack: IAudioTrack;

  private _initialParams: IInitialParams = {};
  private _mixer: IMixer;
  private _onUpdateLocation: CallableFunction = () => {};
  private _onUpdateAssets: CallableFunction = () => {};
  private _assetData: IAssetData[] = [];
  private _onPlayAssets: CallableFunction = () => {};
  private _sessionId: number | string | undefined;
  uiConfig: IUiConfig = {};
  private _speakerData: ISpeakerData[] = [];
  private _audioTracksData: IAudioTrackData[] = [];
  private _lastAssetUpdate: Date | undefined;
  private _timedAssetData: ITimedAssetData[] = [];
  private _assetDataTimer: NodeJS.Timeout | undefined;

  /** Initialize a new Roundware instance
   * @param {Object} windowScope - representing the context in which we are executing - provides references to window.navigator, window.console, etc.
   * @param {Object} options - Collection of parameters for configuring this Roundware instance
   * @param {String} options.serverUrl - identifies the Roundware server
   * @param {Number} options.projectId - identifies the Roundware project to connect
   * @param {Boolean} options.geoListenMode - whether or not to attempt to initialize geolocation-based listening
   * @throws Will throw an error if serveUrl or projectId are missing
    TODO need to provide a more modern/ES6-aware architecture here vs burdening the constructor with all of these details **/

  constructor(
    windowScope: Window,
    {
      serverUrl,
      projectId,
      speakerFilters,
      assetFilters,
      listenerLocation,
      user,
      geoPosition,
      session,
      project,
      speaker,
      asset,
      timedAsset,
      audiotrack,
      assetUpdateInterval,
      prefetchSpeakerAudio,
      ...options
    }: IRoundwareConstructorOptions
  ) {
    this.windowScope = windowScope;
    this._serverUrl = serverUrl;
    this._projectId = projectId;
    if (speakerFilters) this._speakerFilters = speakerFilters;
    this._assetFilters = assetFilters;
    this._listenerLocation = listenerLocation;
    this._initialOptions = options;
    // By default, update the asset pool every 5 minutes.
    this._assetUpdateInterval = assetUpdateInterval || 300000;

    if (this._serverUrl === undefined) {
      throw "Roundware objects must be initialized with a serverUrl";
    }

    if (this._projectId === undefined) {
      throw "Roundware objects must be initialized with a projectId";
    }

    this._apiClient = new ApiClient(window, this._serverUrl);
    options.apiClient = this._apiClient;

    let navigator = window.navigator;

    // TODO need to reorganize/refactor these classes
    this._user = user || new User(options);
    this._geoPosition =
      geoPosition ||
      new GeoPosition(navigator, {
        geoListenMode: options.geoListenMode,
        defaultCoords: listenerLocation,
      });
    this._session =
      session ||
      new Session(
        navigator,
        this._projectId,
        this._geoPosition.isEnabled,
        options
      );
    this._project = project || new Project(this._projectId, options);
    this._speaker = speaker || new Speaker(this._projectId, options);
    this._asset = asset || new Asset(this._projectId, options);
    this._timed_asset = timedAsset || new TimedAsset(this._projectId, options);
    this._audiotrack = audiotrack || new Audiotrack(this._projectId, options);
    this.uiConfig = {};

    const mixParams: object = {
      ...this.mixParams,
      ...this._initialParams,
    };

    this._mixer = new Mixer({
      client: this,
      windowScope: this.windowScope,
      listenerLocation: this._listenerLocation,
      prefetchSpeakerAudio: prefetchSpeakerAudio || false,
      mixParams,
    });
  }

  updateLocation(listenerLocation: Coordinates): void {
    this._listenerLocation = listenerLocation;

    this._mixer.updateParams({ listenerLocation });
    if (this._onUpdateLocation) this._onUpdateLocation(listenerLocation);
  }

  set onUpdateLocation(callback: CallableFunction) {
    this._onUpdateLocation = callback;

    const lastCoords = this._geoPosition.getLastCoords();
    callback(lastCoords);
  }

  set onUpdateAssets(callback: CallableFunction) {
    this._onUpdateAssets = callback;

    if (this._assetData) {
      callback(this.assets());
    }
  }

  set onPlayAssets(callback: CallableFunction) {
    this._onPlayAssets = callback;
    callback(this.currentlyPlayingAssets);
  }

  _triggerOnPlayAssets() {
    if (this._onPlayAssets) {
      this._onPlayAssets(this.currentlyPlayingAssets);
    }
  }

  get currentlyPlayingAssets() {
    return this._mixer.playlist && this._mixer.playlist.currentlyPlayingAssets;
  }

  enableGeolocation(mode: number) {
    if (mode === GeoListenMode.AUTOMATIC) {
      this._geoPosition.enable();
    } else {
      this._geoPosition.disable();
    }
    this._mixer.updateParams({ geoListenMode: mode });
  }

  disableGeolocation() {
    this._geoPosition.disable();
    this._mixer.updateParams({ geoListenMode: GeoListenMode.DISABLED });
  }

  /** Initiate a connection to Roundware
   *  @return {Promise} - Can be resolved in order to get the audio stream URL, or rejected to get an error message; see example above **/
  async connect(): Promise<{ uiConfig: IUiConfig }> {
    // want to start this process as soon as possible, as it can take a few seconds
    this._geoPosition.connect((newLocation: Coordinates) =>
      this.updateLocation(newLocation)
    );

    logger.info(`Initializing Roundware for project ID ${this._projectId}`);

    try {
      await this._user.connect();
      const sessionId = await this._session.connect();
      this._sessionId = sessionId;

      const promises = [
        this._project.connect(sessionId),
        this._project
          .uiconfig(sessionId)
          .then((uiConfig) => (this.uiConfig = uiConfig)),
        this._speaker
          .connect(this._speakerFilters)
          .then((speakerData) => (this._speakerData = speakerData)),
        this._audiotrack
          .connect()
          .then((audioTracksData) => (this._audioTracksData = audioTracksData)),
      ];

      await Promise.all(promises);
      console.info("Roundware connected");
      return { uiConfig: this.uiConfig };
    } catch {
      throw "Sorry, we were unable to connect to Roundware. Please try again.";
    }
  }

  get mixParams() {
    return (this._project || {}).mixParams;
  }

  /// Requests list of assets from the server given some filters.
  async getAssets(options: object) {
    // If the caller just wants all assets, pass back the preloaded list.
    if (!options && this._assetData) {
      return this._assetData;
    } else {
      return await this._apiClient.get<unknown[]>(`/assets/`, {
        project_id: this._projectId,
        // Override default filters with unknown passed in options.
        ...this._assetFilters,
        ...(options || {}),
      });
    }
  }

  get assetPool(): IAssetPool | undefined {
    return this._mixer.playlist && this._mixer.playlist.assetPool;
  }

  /// Returns a reduced asset list by filtering the overall pool.
  /// Example: `getAssetsFromPool(allAssetFilter([distanceRangesFilter(), anyTagsFilter()]))`
  async getAssetsFromPool(
    assetFilter: CallableFunction,
    extraParams = {}
  ): Promise<IAssetData[]> {
    const pool = await this.loadAssetPool();
    const mixParams = { ...this.mixParams, ...extraParams };
    return pool.filter(
      (a) => assetFilter(a, mixParams) != ASSET_PRIORITIES.DISCARD
    );
  }

  async updateAssetPool() {
    let filters = this._assetFilters;
    let existingAssets: IAssetData[] = [];
    if (this._lastAssetUpdate) {
      filters = {
        ...filters,
        created__gte: this._lastAssetUpdate.toISOString(),
      };
      existingAssets = this.assets();
    }
    this._assetData = existingAssets.concat(
      await this._asset.connect<IAssetData>(filters)
    );
    this._lastAssetUpdate = new Date();

    // Update the mixer's asset pool, if any.
    const pool = this.assetPool;
    if (pool && this._timedAssetData) {
      pool.updateAssets(this._assetData, this._timedAssetData);
    }

    if (this._onUpdateAssets) {
      this._onUpdateAssets(this._assetData);
    }
  }

  async loadAssetPool(): Promise<IAssetData[]> {
    // Options passed here should only need to go into the assets/ call.
    if (!this._assetData) {
      await this.updateAssetPool();
      // Setup periodic retrieval of newly uploaded assets.
      this._assetDataTimer = setInterval(
        () => this.updateAssetPool(),
        this._assetUpdateInterval
      );
    }
    if (!this._timedAssetData) {
      this._timedAssetData = await this._timed_asset.connect();
    }
    return this._assetData;
  }

  async activateMixer(activationParams = {}) {
    // Make sure the asset pool is loaded.
    await this.loadAssetPool();

    this._mixer.updateParams(activationParams);

    return this._mixer;
  }

  /** Create or resume the audio stream
   * @see Stream.play **/
  play(firstPlayCallback: (value: Coordinates) => any = () => {}) {
    return this._geoPosition
      .waitForInitialGeolocation()
      .then(firstPlayCallback);
  }

  /** Tell Roundware server to pause the audio stream. You should always call this when the local audio player has been paused.
   * @see Stream.pause **/
  pause() {
    if (this._mixer.playlist) {
      this._mixer.playlist.pause();
    }
  }

  /** Tell Roundware server to kill the audio stream.
   * @see Stream.kill **/
  kill() {
    if (this._assetDataTimer) {
      clearInterval(this._assetDataTimer);
    }
  }

  /** Tell Roundware server to replay the current asset.
   * @see Stream.replay **/
  replay() {}

  /** Tell Roundware server to skip the current asset.
   * @see Stream.skip **/
  skip() {
    if (this._mixer.playlist) {
      this._mixer.playlist.skip();
    }
  }

  /** Update the Roundware stream with new tag IDs
   * @param {string} tagIdStr - comma-separated list of tag IDs to send to the streams API **/
  tags() {}

  /** Update the Roundware stream with new tag IDs and or geo-position
   * @param {object} data - containing keys latitude, longitude and tagIds **/
  update(data: {
    latitude: number;
    longitude: number;
    tagIds: string[] | number[];
  }) {
    if (this._mixer.playlist) {
      this._mixer.playlist.updateParams(data);
    }
    // Object.keys(data).map(e => console.log(`key=${e}  value=${data[e]}`));
  }

  speakers(): ISpeakerData[] {
    return this._speakerData || [];
  }

  assets(): IAssetData[] {
    return this._assetData || [];
  }

  timedAssets(): ITimedAssetData[] | [] {
    return this._timedAssetData || [];
  }

  audiotracks(): IAudioTrackData[] | [] {
    return this._audioTracksData || [];
  }

  /** Attach new assets to the project
   * @param {Object} audioData - the binary data from a recording to be saved as an asset
   * @param {string} fileName - name of the file
   * @return {promise} - represents the API calls to save an asset; can be tested to find out whether upload was successful
   * @see Envelope.upload */
  async saveAsset(audioData: IAudioData, fileName: string, data: object) {
    const envelope = await this.makeEnvelope();
    return envelope.upload(audioData, fileName, data);
  }

  /** Explicitly make a new envelope that you can attach multiple assets to by
   calling the `Envelope.upload` method. This is the main way to add text,
   photo, and video assets to an envelope. */
  async makeEnvelope(): Promise<IEnvelope> {
    if (!this._sessionId) {
      throw new Error(
        "can't save assets without first connecting to the server"
      );
    }

    let envelope = new Envelope(
      this._sessionId,
      this._apiClient,
      this._geoPosition,
      this
    );

    await envelope.connect();
    return envelope;
  }

  findTagDescription(tagId: string, tagType = "listen") {
    const tagGroups = this.uiConfig[tagType];
    for (const group of tagGroups) {
      for (const item of group.display_items) {
        if (item.tag_id == tagId) {
          return item.tag_display_text;
        }
      }
    }
    return undefined;
  }

  async vote(assetId: string, voteType: string, value: unknown) {
    return this._apiClient.post(`/assets/${assetId}/votes/`, {
      session_id: this._sessionId,
      vote_type: voteType,
      value,
    });
  }

  /// @return Detailed information about a particular asset.
  async getAsset(id: string): Promise<IAssetData> {
    // Check for this asset in any already loaded asset pool.
    if (this._assetData) {
      for (const asset of this._assetData) {
        if (asset.id === id) {
          return asset;
        }
      }
    }
    // Otherwise, ask the server for the asset details.
    return this._apiClient.get<IAssetData>(`/assets/${id}/`, {
      session_id: this._sessionId,
    });
  }

  /// @return Details about a particular envelope (which may contain multiple assets).
  async getEnvelope(id: string | number): Promise<unknown> {
    return this._apiClient.get<unknown>(`/envelopes/${id}`, {
      session_id: this._sessionId,
    });
  }
}
