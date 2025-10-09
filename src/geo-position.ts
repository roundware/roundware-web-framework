import { GeoEmaSmoother } from "./geo_smoothing";
import { GeoListenMode } from "./mixer";
import { logger } from "./shims";
import { Coordinates, GeoPositionOptions } from "./types";

const initialGeoTimeoutSeconds = 6;
// default; can be overridden by options on Roundware instantiation
const geoUpdateThrottleMs = 0;

const frameworkDefaultCoords: Coordinates = {
  latitude: 42.3140089,
  longitude: -71.2504676,
}; // Boston, MA

// for an initial rapid, low-accuracy position
const fastGeolocationPositionOptions = {
  enableHighAccuracy: false,
  timeout: initialGeoTimeoutSeconds * 1000,
  maximumAge: Infinity,
};

// subsequent position monitoring should be high-accuracy
const accurateGeolocationPositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
};

/** Responsible for tracking the user's position, when geo listening is enabled and the browser is capable
 * @property {Boolean} isEnabled - whether or not the geo positioning system is enabled and available
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation **/

export class GeoPosition {
  /** Create a new GeoPosition.
   * @param {Window[`navigator`]} navigator - provides access to geolocation system
   * @param {Object} options - parameters for initializing this GeoPosition
   * @param {Boolean} [options.geoListenMode = GeoListenMode.DISABLED] - whether or not to attempt to use geolocation
   * @param {Boolean} [options.defaultCoords] */

  private _navigator: Window[`navigator`];
  private _initialGeolocationPromise: Promise<Coordinates>;
  private defaultCoords: Coordinates;
  private _lastCoords: Coordinates;
  private _lastUpdateTime: number | null = null;
  geolocation: Geolocation;
  isEnabled: boolean;
  updateCallback: CallableFunction;
  private _geoWatchID?: number | null;
  private _geoPositionStatus: true | number = 3;
  private _smoother?: GeoEmaSmoother;

  constructor(navigator: Window[`navigator`], options: GeoPositionOptions) {
    this._navigator = navigator;

    const { defaultCoords, geoListenMode } = options;
    const initialCoords = defaultCoords
      ? defaultCoords
      : frameworkDefaultCoords;

    this._initialGeolocationPromise = Promise.resolve(initialCoords);
    this.defaultCoords = initialCoords;
    this._lastCoords = initialCoords;
    this._lastUpdateTime = null;
    this.geolocation = navigator.geolocation;
    this.isEnabled =
      navigator.geolocation && geoListenMode === GeoListenMode.AUTOMATIC;
    this.updateCallback = () => {};
    this._geoWatchID = null;

    // Setup optional smoother
    const {
      geoSmoothingEnabled = false,
      geoSmoothingAlpha = 0.15,
      geoSmoothingMinAccuracyMeters = 20,
      geoSmoothingMinEmitDeltaMeters = 0,
      geoSmoothingResetJumpMeters = 50,
    } = options;
    if (geoSmoothingEnabled) {
      this._smoother = new GeoEmaSmoother({
        enabled: geoSmoothingEnabled,
        alpha: geoSmoothingAlpha,
        minAccuracyMeters: geoSmoothingMinAccuracyMeters,
        minEmitDeltaMeters: geoSmoothingMinEmitDeltaMeters,
        resetJumpMeters: geoSmoothingResetJumpMeters,
      });
    }

    //console.info({ defaultCoords: this.defaultCoords });
  }

  disable(): void {
    this.isEnabled = false;
    if (this._geoWatchID) {
      console.log("Canceling geoposition watch", this._geoWatchID);
      this.geolocation.clearWatch(this._geoWatchID);
      delete this._geoWatchID;
    }
  }

  /** @return {String} Human-readable representation of this GeoPosition **/
  toString(): string {
    return `GeoPosition (enabled: ${this.isEnabled})`;
  }

  /** @return {Object} coordinates - last known coordinates received from the geolocation system (defaults to latitude 1, longitude 1) **/
  getLastCoords(): Coordinates {
    return this._lastCoords;
  }
  /**
   * @param  {CallableFunction} geoUpdateCallback
   */
  connect(geoUpdateCallback: CallableFunction) {
    this.updateCallback = geoUpdateCallback;
    // Ensure that geolocation is started if it was enabled from instantiation.
    if (this.isEnabled) {
      this.enable();
    }
  }

  /** Attempts to get an initial rough geographic location for the listener, then sets up a callback
   * to update the position.
   * @param {Function} geoUpdateCallback - object that should receive geolocation coordinate updates
   * @see isEnabled **/
  enable(): void {
    if (this.isEnabled && this._geoWatchID) {
      return;
    }

    const {
      defaultCoords,
      _navigator: { geolocation },
    } = this;

    console.log("Initializing geolocation system");
    this.isEnabled = true;
    this._initialGeolocationPromise = new Promise((resolve, reject) => {
      geolocation.getCurrentPosition(
        (initialPosition) => {
          const { coords } = initialPosition;
          this._geoPositionStatus = true;
          this._lastCoords = coords;
          console.info("Received initial geolocation:", coords);
          this.updateCallback(coords);
          resolve(coords);
        },
        (error) => {
          this._geoPositionStatus = error.code;
          logger.warn(
            `Unable to get initial geolocation: ${error.message} (code #${error.code}), falling back to default coordinates for initial listener location`
          );
          reject(error);
        },
        fastGeolocationPositionOptions
      );

      /**
       * Promise never rejected if we deny on Firefox.
       * @see https://stackoverflow.com/questions/5947637/function-fail-never-called-if-user-declines-to-share-geolocation-in-firefox
       * */

      setTimeout(() => {
        if (this._geoPositionStatus === true) resolve(this._lastCoords);
        else
          reject({
            code: this._geoPositionStatus,
          });
      }, fastGeolocationPositionOptions.timeout + 1000);
    });

    console.log(
      "🚨 FRAMEWORK: About to call watchPosition with options:",
      accurateGeolocationPositionOptions
    );

    this._geoWatchID = geolocation.watchPosition(
      (updatedPosition) => {
        const { coords } = updatedPosition;
        const now = Date.now();
        const timeSinceLastUpdate = this._lastUpdateTime
          ? now - this._lastUpdateTime
          : 0;

        console.log(
          `🚨 LOCATION UPDATE: ${timeSinceLastUpdate}ms since last update`
        );

        // Only process updates every 3 seconds
        if (timeSinceLastUpdate < geoUpdateThrottleMs && this._lastUpdateTime) {
          console.log(`🚨 THROTTLED: Ignoring update (too soon)`);
          return;
        }

        console.log(
          `🚨 COORDS: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(
            6
          )}`
        );

        // Optionally smooth before forwarding; always emit as simple Coordinates
        let coordsToSend: Coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        if (this._smoother) {
          const smoothed = this._smoother.update(updatedPosition);
          if (smoothed) {
            coordsToSend = {
              latitude: smoothed.latitude,
              longitude: smoothed.longitude,
            };
          } else {
            // rejected by smoothing (poor accuracy or within deadband)
            return;
          }
        }

        this._lastUpdateTime = now;
        this._lastCoords = coordsToSend;
        this._geoPositionStatus = true;
        logger.info("Received updated geolocation:", coordsToSend);
        this.updateCallback(coordsToSend);
      },
      (error) => {
        logger.warn(
          `Unable to watch geoposition changes: ${error.message} (code #${error.code})`
        );
        this._geoPositionStatus = error.code;
      },
      accurateGeolocationPositionOptions
    );
  }

  /** Allows you to wait on the progress of the .connect() behavior, attempting to get an initial
   * estimate of the user's position. Note that this promise will never fail - if we cannot get an
   * accurate estimate, we fall back to default coordinates (currently latitude 1, longitude 1)
   * @return {Promise} Represents the attempt to get an initial estimate of the user's position **/
  async waitForInitialGeolocation(): Promise<Coordinates> {
    return await this._initialGeolocationPromise;
  }
}
