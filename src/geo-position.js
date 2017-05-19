// @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation

import logger from "./logger";

var jQuery         = require('jQuery'); // HACK not sure why ES6 "include" doesn't work
var geoListenEnabled = false;

const oneSecond = 10000;
const tenSeconds = 10000;
const defaultCoords = {
  latitude: 1,
  longitude: 1
};

// first we get a fast, low-accuracy position
const fastGeolocationPositionOptions = { 
  enableHighAccuracy: false,
  timeout: oneSecond
};

// first we get a fast, low-accuracy position
const accurateGeolocationPositionOptions = { 
  enableHighAccuracy: true,
  timeout: tenSeconds
};

export class GeoPosition {
  constructor(options = {}) {
    if ("geolocation" in navigator) {
      if ("geoListenEnabled" in options) {
        geoListenEnabled = options.geoListenEnabled;
      } else {
        geoListenEnabled = true; // awkward but only way I can think of to default this to true the way I want
      }
    }
  }

  isGeoEnabled() {
    return geoListenEnabled;
  }

  toString() { 
    return `Latitude ${latitude}, Longitude ${longitude}`;
  }

  // note: you can specify a single callback function here or an array of functions, in case you 
  // want to use this code to update a map at the same time it updates the stream, for example
  connect() {
    var initialGeolocation = jQuery.Deferred();
    var geoMonitor = jQuery.Deferred();

    if (!geoListenEnabled) {
      logger.info("Geolocation disabled");
      return initialGeoLocation;
    }

    logger.info("Initializing geolocation system");

    navigator.geolocation.getCurrentPosition(function initialGeoSuccess(initialPosition) {
      var coords = initialPosition.coords;
      logger.info("Received initial geolocation",coords);

      navigator.geolocation.watchPosition(function highAccuracyGeoSuccess(updatedPosition) {
        var newCoords = updatedPosition.coords;
        geoMonitor.notify(newCoords);
      },function highAccuracyGeoError(error) {
        logger.warn("Unable to monitor geolocation: " + error);
        geoMonitor.reject();
      },accurateGeolocationPositionOptions);

      initialGeolocation.resolve(coords,geoMonitor);
      // NOTE: this method returns a watchID which can be used to cancel the geolocation monitor, could be useful in the future
    },function initialGeoError(error) {
      logger.warn(`Unable to get initial geolocation: ${error.message} (code #${error.code})`);
      initialGeolocation.reject(defaultCoords);
      geoMonitor.reject();
    },fastGeolocationPositionOptions);

    return initialGeolocation.promise();
  }
}
