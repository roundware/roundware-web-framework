import { logger, defaultNavigator } from "./shims";

const initialGeoTimeoutSeconds = 1;

const defaultCoords = {
  latitude: 1,
  longitude: 1
};

// for an initial rapid, low-accuracy position
const fastGeolocationPositionOptions = { 
  enableHighAccuracy: false,
  timeout: initialGeoTimeoutSeconds
};

// subsequent position monitoring should be high-accuracy
const accurateGeolocationPositionOptions = { 
  enableHighAccuracy: true
};

/** Responsible for tracking the user's position, when geo listening is enabled and the browser is capable
 * @property {Boolean} geoListenEnabled - whether or not the geo positioning system is enabled and available
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation **/
export class GeoPosition {
  /** Create a new GeoPosition.
   * @param {Object} options - parameters for initializing this GeoPosition
   * @param {Boolean} [options.geoListenEnabled = false] - whether or not to attempt to use geolocation **/
  constructor(options = {}) {
    this.navigator = options.navigator || defaultNavigator;

    if (this.navigator.geolocation && options.geoListenEnabled) {
      this.geoListenEnabled = true;
    } else {
      this.geoListenEnabled = false;
    }
  }

  /** @return {String} Human-readable representation of this GeoPosition **/
  toString() { 
    return `GeoPosition (enabled: ${this.geoListenEnabled})`;
  }

  /** Attempts to get an initial rough geographic location for the listener, then sets up a callback
   * to update the position.
   * @param {Function} geoUpdateCallback - object that should receive geolocation updates
   * @return {Promise} represents the pending initial geolocation effort
   * @see geoListenEnabled **/
  connect(geoUpdateCallback = () => {}) {
    if (!this.geoListenEnabled) {
      logger.info("Geolocation disabled");
      return initialGeoLocation;
    }

    logger.info("Initializing geolocation system");

    let initialGeolocationPromise = new Promise((resolve,reject) => {
      this.navigator.geolocation.getCurrentPosition((initialPosition) => {
        let coords = initialPosition.coords;
        logger.info("Received initial geolocation",coords);

        geoUpdateCallback(coords);

        let geoWatchId = this.navigator.geolocation.watchPosition((updatedPosition) => {
          let newCoords = updatedPosition.coords;
          geoUpdateCallback(newCoords);
        },(error) => {
          logger.warn(`Unable to watch position: ${error.message} (code #${error.code})`);
        },accurateGeolocationPositionOptions);

        logger.info(`Monitoring geoposition updates (watch ID ${geoWatchId})`);
        resolve();
      },function initialGeoError(error) {
        logger.warn(`Unable to get initial geolocation: ${error.message} (code #${error.code})`);
        reject();
      },fastGeolocationPositionOptions);
    });

    return initialGeolocationPromise;
  }
}
