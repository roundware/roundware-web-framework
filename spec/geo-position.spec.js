import { GeoPosition } from "../src/geo-position";

describe("GeoPosition",() => {
  let geoPosition, currentPositionCallback, watchPositionCallback;

  let geoLocationSystem = {
    getCurrentPosition: function(callback) {
      currentPositionCallback = callback;
    },

    watchCurrentPosition: function(callback) {
      watchPositionCallback = callback;
    }
  };

  let geoEnabledNavigator = { 
    geolocation: geoLocationSystem
  };

  describe('with geolocation support', function() {
    it('geoListenEnabled is true if the geoListenEnabled option is also true',() => {
      geoPosition = new GeoPosition({
        navigator: geoEnabledNavigator,
        geoListenEnabled: true
      });

      expect(geoPosition.geoListenEnabled).toBe(true);
    });

    it('geoListenEnabled is false if the geoListenEnabled option is false',() => {
      let geoPosition = new GeoPosition({
        navigator: geoEnabledNavigator,
        geoListenEnabled: false
      });

      expect(geoPosition.geoListenEnabled).toBe(false);
    });
  });

  it('.toString() returns a string', function() {
    let geoPosition = new GeoPosition();
    expect(geoPosition.toString()).toMatch(/GeoPosition/);
  });

  describe('without geolocation support', function() {
    it('geoListenEnabled is false, even when geoListenEnabled option is true',() => {
      let geoPosition = new GeoPosition({ geoListenEnabled: true });
      expect(geoPosition.geoListenEnabled).toBe(false);
    });
  });

  describe('.connect()',function() {
    beforeEach(function() {
      geoPosition = new GeoPosition({
        navigator: geoEnabledNavigator,
        geoListenEnabled: true
      });

      spyOn(geoLocationSystem,"getCurrentPosition");
      spyOn(geoLocationSystem,"watchPosition");

      let connectResult = geoPosition.connect();
    });

    it('returns the initial geolocation promise', function() {
      expect(connectResult instanceof Promise).toBe(true);
    });

    it('requests an initial rough geolocation', function() {
      pending();
    });

    it('passes initial rough geolocation to the given callback', function() {
      pending();
      connectResult.resolve();
    });

    it('watches for position changes and passes them to the given callback', function() {
      pending();
    });

    it('handles initial geolocation failure', function() {
      pending();
    });

    it('handles geolocation watch failure', function() {
      pending();
    });

    describe('when geolistening is disabled', function() {
      pending();
    });
  });
});
