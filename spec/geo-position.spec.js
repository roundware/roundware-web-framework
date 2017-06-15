import { GeoPosition } from "../src/geo-position";
import { mockNavigator, mockGeolocationSystem, initialCoordinates, watchCoordinates } from "./mocks/mock-navigator";

describe("GeoPosition",() => {
  let geoPosition;

  let geoPositionOptions = {
    geoListenEnabled: true
  };

  let failSpecOnErrorCallback = (err) => {
    /* istanbul ignore next */
    fail(err);
  };

  let shouldNotResolveCallback = () => {
    /* istanbul ignore next */
    fail("promise was resolved instead of being rejected");
  };

  let shouldNotRejectCallback = () => {
    /* istanbul ignore next */
    fail("promise was rejected instead of being resolved");
  };

  describe('constructor',() => {
    beforeEach(() => {
      geoPosition = new GeoPosition({});
    });
    
    it('.toString() returns a string',() => {
      expect(geoPosition.toString()).toMatch(/GeoPosition/);
    });

    it('sets a default initial geolocation promise that can be waited on',(done) => {
      geoPosition.waitForInitialGeolocation().then(done,shouldNotRejectCallback);
    });

    it('sets a default initial geolocation promise that resolves to default coordinates',(done) => {
      geoPosition.waitForInitialGeolocation().then((result) => {
        expect(result).toEqual({ latitude: 1, longitude: 1 });
        done();
      },shouldNotRejectCallback);
    });
  });

  describe('without geolocation support',() => {
    it('geoListenEnabled is false, even when geoListenEnabled option is true',() => {
      let geoPosition = new GeoPosition({},{ geoListenEnabled: true });
      expect(geoPosition.geoListenEnabled).toBe(false);
    });
  });

  describe('with geolocation support',() => {
    beforeEach(() => {
      geoPosition = new GeoPosition(mockNavigator,geoPositionOptions);
    });

    it('geoListenEnabled is true if the geoListenEnabled option is also true',() => {
      expect(geoPosition.geoListenEnabled).toBe(true);
    });

    it('geoListenEnabled is false if the geoListenEnabled option is false',() => {
      geoPosition = new GeoPosition(mockNavigator,{
        geoListenEnabled: false
      });

      expect(geoPosition.geoListenEnabled).toBe(false);
    });
  });

  describe('.connect()',() => {
    let geoPositionUpdateCallback;

    beforeEach(() => {
      geoPosition = new GeoPosition(mockNavigator,geoPositionOptions);

      spyOn(mockGeolocationSystem,"getCurrentPosition").and.callThrough();
      spyOn(mockGeolocationSystem,"watchPosition").and.callThrough();

      geoPositionUpdateCallback = jasmine.createSpy('geoPositionUpdateCallback');
      geoPosition.connect(geoPositionUpdateCallback);
    });

    it('requests an initial rough geolocation',() => {
      expect(mockGeolocationSystem.getCurrentPosition).toHaveBeenCalled();
    });

    it('passes initial rough position estimate and then high-accuracy estimate to the given callback',() => {
      expect(geoPositionUpdateCallback.calls.count()).toBe(2);

      let allArgs = geoPositionUpdateCallback.calls.allArgs();

      expect(allArgs[0][0]).toBe(initialCoordinates.coords);
      expect(allArgs[1][0]).toBe(watchCoordinates.coords);
    });

    it('sets a promise that can be successfully waited on via .waitForGeolocation()',(done) => {
      let promise = geoPosition.waitForInitialGeolocation();
      expect(promise instanceof Promise).toBe(true);

      promise.
        catch(failSpecOnErrorCallback).
        then(done);
    });
  });

  describe('.connect() with initial geolocation error',() => {
    let geoPositionUpdateCallback;

    beforeEach(() => {
      geoPosition = new GeoPosition(mockNavigator,geoPositionOptions);

      spyOn(mockGeolocationSystem,"getCurrentPosition").and.callFake((_,errCallback) => {
        errCallback({ message: "ugh", code: 1 });
      });

      geoPosition.connect(geoPositionUpdateCallback);
    });

    it('sets promise that resolves to default coordinates, which can be waited on via .waitForGeolocation()',(done) => {
      geoPosition.waitForInitialGeolocation().then(function shouldResolve(coords) {
        expect(coords).toEqual({ latitude: 1, longitude: 1 });
      },shouldNotRejectCallback).
      then(done);
    });
  });

  describe('.connect() with geolocation monitoring error',() => {
    let connectPromise, geoPositionUpdateCallback;

    beforeEach(() => {
      geoPosition = new GeoPosition(mockNavigator,geoPositionOptions);

      spyOn(mockGeolocationSystem,"watchPosition").and.callFake((_,errCallback) => {
        errCallback({ message: "ugh", code: 2 });
      });

      geoPosition.connect(geoPositionUpdateCallback);
    });

    it('still sets a resolved promise which can be waited on via .waitForGeolocation()',(done) => {
      geoPosition.waitForInitialGeolocation().then(done).catch(shouldNotRejectCallback);
    });
  });

  describe('when geolisten is disabled',() => {
    beforeEach(() => {
      let disabledGeo = new GeoPosition(mockNavigator,{
        geoListenEnabled: false
      });

      spyOn(mockGeolocationSystem,"getCurrentPosition");
      disabledGeo.connect();
    });

    it('still sets a resolved promise which can be waited on via .waitForGeolocation()',(done) => {
      geoPosition.waitForInitialGeolocation().then(done).catch(shouldNotRejectCallback);
    });

    it('does not activate geolocation',() => {
      expect(mockGeolocationSystem.getCurrentPosition).not.toHaveBeenCalled();
    });
  });
});
