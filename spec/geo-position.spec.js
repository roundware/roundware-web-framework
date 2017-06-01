import { GeoPosition } from "../src/geo-position";

describe("GeoPosition",() => {
  let geoPosition;
  let initialCoordinates = { coords: { latitude: 1, longitude: 2 } };
  let watchCoordinates   = { coords: { latitude: 3, longitude: 4 } };

  let geoLocationSystem = {
    getCurrentPosition: (successCallback,errCallback) => { successCallback(initialCoordinates); },
    watchPosition:      (successCallback,errCallback) => { successCallback(watchCoordinates); },
  };

  let geoEnabledNavigator = { 
    geolocation: geoLocationSystem
  };

  let geoPositionOptions = {
    navigator: geoEnabledNavigator,
    geoListenEnabled: true
  };

  /* istanbul ignore next */
  let failSpecOnErrorCallback = (err) => {
    fail(err);
  };

  describe('with geolocation support',() => {
    beforeEach(() => {
      geoPosition = new GeoPosition(geoPositionOptions);
    });

    it('geoListenEnabled is true if the geoListenEnabled option is also true',() => {
      expect(geoPosition.geoListenEnabled).toBe(true);
    });

    it('geoListenEnabled is false if the geoListenEnabled option is false',() => {
      geoPosition = new GeoPosition({
        navigator: geoEnabledNavigator,
        geoListenEnabled: false
      });

      expect(geoPosition.geoListenEnabled).toBe(false);
    });
  });

  it('.toString() returns a string',() => {
    let geoPosition = new GeoPosition();
    expect(geoPosition.toString()).toMatch(/GeoPosition/);
  });

  describe('without geolocation support',() => {
    it('geoListenEnabled is false, even when geoListenEnabled option is true',() => {
      let geoPosition = new GeoPosition({ geoListenEnabled: true });
      expect(geoPosition.geoListenEnabled).toBe(false);
    });
  });

  describe('.connect()',() => {
    let connectPromise, geoPositionUpdateCallback;

    beforeEach(() => {
      geoPosition = new GeoPosition(geoPositionOptions);

      spyOn(geoLocationSystem,"getCurrentPosition").and.callThrough();
      spyOn(geoLocationSystem,"watchPosition").and.callThrough();

      geoPositionUpdateCallback = jasmine.createSpy('geoPositionUpdateCallback');
      connectPromise = geoPosition.connect(geoPositionUpdateCallback).catch(failSpecOnErrorCallback);
    });

    it('returns the initial geolocation promise',() => {
      expect(connectPromise instanceof Promise).toBe(true);
    });

    it('requests an initial rough geolocation',() => {
      expect(geoLocationSystem.getCurrentPosition).toHaveBeenCalled();
    });

    it('passes initial rough position estimate and then high-accuracy estimate to the given callback',() => {
      expect(geoPositionUpdateCallback.calls.count()).toBe(2);

      let allArgs = geoPositionUpdateCallback.calls.allArgs();

      expect(allArgs[0][0]).toBe(initialCoordinates.coords);
      expect(allArgs[1][0]).toBe(watchCoordinates.coords);
    });
  });

  describe('.connect() with initial geolocation error',() => {
    let connectPromise, geoPositionUpdateCallback;

    beforeEach(() => {
      geoPosition = new GeoPosition(geoPositionOptions);

      spyOn(geoLocationSystem,"getCurrentPosition").and.callFake((_,errCallback) => {
        errCallback({ message: "ugh", code: 1 });
      });

      connectPromise = geoPosition.connect(geoPositionUpdateCallback);
    });

    it('returns a rejected promise',(done) => {
      connectPromise.then(
        /* istanbul ignore next */
        function shouldNotResolve() { 
          fail("promise was resolved instead of rejected"); 
        }
      ).catch(done);
    });
  });

  describe('.connect() with initial geolocation error',() => {
    let connectPromise, geoPositionUpdateCallback;

    beforeEach(() => {
      geoPosition = new GeoPosition(geoPositionOptions);

      spyOn(geoLocationSystem,"watchPosition").and.callFake((_,errCallback) => {
        errCallback({ message: "ugh", code: 2 });
      });

      connectPromise = geoPosition.connect(geoPositionUpdateCallback);
    });

    it('still returns a resolved promise',(done) => {
      connectPromise.then(
        function resolve() {},
        /* istanbul ignore next */
        function shouldNotReject() { fail("promise was rejected instead of resolved"); }
      ).then(done);
    });
  });

  describe('when geolisten is disabled',() => {
    let disabledConnectPromise;

    beforeEach(() => {
      let disabledGeo = new GeoPosition({
        navigator: geoEnabledNavigator,
        geoListenEnabled: false
      });

      spyOn(geoLocationSystem,"getCurrentPosition");
      disabledConnectPromise = disabledGeo.connect();
    });

    it('returns a resolved promise',() => {
      expect(disabledConnectPromise instanceof Promise).toBe(true);
    });

    it('does not activate geolocation',() => {
      expect(geoLocationSystem.getCurrentPosition).not.toHaveBeenCalled();
    });
  });
});
