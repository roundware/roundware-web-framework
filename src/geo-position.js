import { logger } from "./shims";

const initialGeoTimeoutSeconds = 5;

const frameworkDefaultCoords = {
  latitude: 42.3140089,
  longitude: -71.2504676
}; // Boston, MA

// for an initial rapid, low-accuracy position
const fastGeolocationPositionOptions = {
  enableHighAccuracy: false,
  timeout: initialGeoTimeoutSeconds,
  maximumAge: Infinity
};

// subsequent position monitoring should be high-accuracy
const accurateGeolocationPositionOptions = {
  enableHighAccuracy: true,
  timeout: Infinity,
  maximumAge: 0
};

/** Responsible for tracking the user's position, when geo listening is enabled and the browser is capable
 * @property {Boolean} geoListenEnabled - whether or not the geo positioning system is enabled and available
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation **/
export class GeoPosition {
  /** Create a new GeoPosition.
   * @param {Object} navigator - provides access to geolocation system
   * @param {Object} options - parameters for initializing this GeoPosition
   * @param {Boolean} [options.geoListenEnabled = false] - whether or not to attempt to use geolocation
   * @param {Boolean} [options.defaultCoords] */
  constructor(navigator,options = {}) {
    this._navigator = navigator;
    
    const { defaultCoords, geoListenEnabled } = options;
    const initialCoords = defaultCoords ? defaultCoords : frameworkDefaultCoords;

    this._initialGeolocationPromise = Promise.resolve(initialCoords);
    this.defaultCoords = initialCoords;
    this._lastCoords = initialCoords;
    this.geolocation = navigator.geolocation;
    this.geoListenEnabled = navigator.geolocation && geoListenEnabled;

    //console.info({ defaultCoords: this.defaultCoords });
  }

  cancel() {
    if (this._geoWatchID) {
      console.log('Canceling geoposition watch',this._geoWatchID);
      this.geolocation.clearWatch(this._geoWatchID);
      delete this._geoWatchID;
    }
  }

  /** @return {String} Human-readable representation of this GeoPosition **/
  toString() {
    return `GeoPosition (enabled: ${this.geoListenEnabled})`;
  }

  /** @return {Object} coordinates - last known coordinates received from the geolocation system (defaults to latitude 1, longitude 1) **/
  getLastCoords() {
    return this._lastCoords;
  }

  /** Attempts to get an initial rough geographic location for the listener, then sets up a callback
   * to update the position.
   * @param {Function} geoUpdateCallback - object that should receive geolocation coordinate updates
   * @see geoListenEnabled **/
  connect(geoUpdateCallback = () => {}) {
    const { geoListenEnabled, defaultCoords, _navigator: { geolocation } } = this;

    if (!geoListenEnabled) {
      logger.info("Geolisten disabled");
      return;
    }

    logger.log("Initializing geolocation system");

    this._initialGeolocationPromise = new Promise(resolve => {
      geolocation.getCurrentPosition(initialPosition => {
        const { coords } = initialPosition;
        this._lastCoords = coords;
        logger.info("Received initial geolocation:",coords);
        geoUpdateCallback(coords);
        resolve(coords);
      },error => {
        logger.warn(`Unable to get initial geolocation: ${error.message} (code #${error.code}), falling back to default coordinates for initial listener location`);
        resolve(defaultCoords);
      },fastGeolocationPositionOptions);
    });

    this._geoWatchID = geolocation.watchPosition(updatedPosition => {
      const { coords } = updatedPosition;
      this._lastCoords = coords;
      logger.info("Received updated geolocation:",coords);
      geoUpdateCallback(coords);
    },error => logger.warn(`Unable to watch geoposition changes: ${error.message} (code #${error.code})`),
    accurateGeolocationPositionOptions);
  }

  /** Allows you to wait on the progress of the .connect() behavior, attempting to get an initial
   * estimate of the user's position. Note that this promise will never fail - if we cannot get an
   * accurate estimate, we fall back to default coordinates (currently latitude 1, longitude 1)
   * @return {Promise} Represents the attempt to get an initial estimate of the user's position **/
  waitForInitialGeolocation() {
    return this._initialGeolocationPromise;
  }
}
