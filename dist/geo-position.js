"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GeoPosition = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var initialGeoTimeoutSeconds = 1;

var defaultCoords = {
  latitude: 1,
  longitude: 1
};

// for an initial rapid, low-accuracy position
var fastGeolocationPositionOptions = {
  enableHighAccuracy: false,
  timeout: initialGeoTimeoutSeconds
};

// subsequent position monitoring should be high-accuracy
var accurateGeolocationPositionOptions = {
  enableHighAccuracy: true
};

/** Responsible for tracking the user's position, when geo listening is enabled and the browser is capable
 * @property {Boolean} geoListenEnabled - whether or not the geo positioning system is enabled and available
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation **/

var GeoPosition = exports.GeoPosition = function () {
  /** Create a new GeoPosition.
   * @param {Object} options - parameters for initializing this GeoPosition
   * @param {Boolean} [options.geoListenEnabled = false] - whether or not to attempt to use geolocation **/
  function GeoPosition() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, GeoPosition);

    this.navigator = options.navigator || _shims.navigator;

    if (this.navigator.geolocation && options.geoListenEnabled) {
      this.geoListenEnabled = true;
    } else {
      this.geoListenEnabled = false;
    }
  }

  /** @return {String} Human-readable representation of this GeoPosition **/


  _createClass(GeoPosition, [{
    key: "toString",
    value: function toString() {
      return "GeoPosition (enabled: " + this.geoListenEnabled + ")";
    }

    /** Attempts to get an initial rough geographic location for the listener, then sets up a callback
     * to update the position.
     * @param {Function} geoUpdateCallback - object that should receive geolocation updates
     * @return {Promise} represents the pending initial geolocation effort
     * @see geoListenEnabled **/

  }, {
    key: "connect",
    value: function connect() {
      var _this = this;

      var geoUpdateCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

      if (!this.geoListenEnabled) {
        _shims.logger.info("Geolocation disabled");
        return Promise.resolve();
      }

      _shims.logger.info("Initializing geolocation system");

      var initialGeolocationPromise = new Promise(function (resolve, reject) {
        _this.navigator.geolocation.getCurrentPosition(function (initialPosition) {
          var coords = initialPosition.coords;
          _shims.logger.info("Received initial geolocation", coords);

          geoUpdateCallback(coords);

          var geoWatchId = _this.navigator.geolocation.watchPosition(function (updatedPosition) {
            var newCoords = updatedPosition.coords;
            geoUpdateCallback(newCoords);
          }, function (error) {
            _shims.logger.warn("Unable to watch position: " + error.message + " (code #" + error.code + ")");
          }, accurateGeolocationPositionOptions);

          _shims.logger.info("Monitoring geoposition updates (watch ID " + geoWatchId + ")");
          resolve();
        }, function initialGeoError(error) {
          _shims.logger.warn("Unable to get initial geolocation: " + error.message + " (code #" + error.code + ")");
          reject();
        }, fastGeolocationPositionOptions);
      });

      return initialGeolocationPromise;
    }
  }]);

  return GeoPosition;
}();