import Roundware from '../src/roundware';
import mockNavigator from "./mocks/mock-navigator";

describe('Roundware',() => {
  let roundware;
  let audioStreamUrl = "http://audio.example.com";
  let initialCoordinates = { latitude: 10, longitude: 10 };

  const sessionId = 250;

  let mockWindow = {
    navigator: mockNavigator
  };

  let mockUser = {
    connect: () => { return new Promise((resolve,reject) => resolve()); }
  };

  let mockGeo = {
    connect: () => {},
    waitForInitialGeolocation: () => { return new Promise((resolve,reject) => resolve(initialCoordinates)); }
  };

  let mockSession = {
    connect: () => { return new Promise((resolve,reject) => resolve(sessionId)); }
  };

  let mockProject = {
    connect: () => { return new Promise((resolve,reject) => resolve(sessionId)); }
  };

  let mockStream = {
    play: () => { return Promise.resolve(); },
    pause: {},
    update: {}
  };

  /* istanbul ignore next */
  let failSpecOnErrorCallback = (err) => {
    fail(err);
  };

  beforeEach(() => {
    roundware = new Roundware(mockWindow,{
      projectId: 1,
      serverUrl: 'http://example.com',
      user: mockUser,
      geoPosition: mockGeo,
      session: mockSession,
      project: mockProject,
      stream: mockStream
    });
  });

  it('constructor throws error when the server URL parameter is missing', () => {
    expect(() => {
      new Roundware(mockWindow,{ projectId: 1 });
    }).toThrow(jasmine.stringMatching('serverUrl'));
  });

  it('constructor throws error when the project ID parameter is missing', () => {
    expect(() => {
      new Roundware(mockWindow,{ serverUrl: 'http://example.com' });
    }).toThrow(jasmine.stringMatching('projectId'));
  });

  describe('.connect()',() => {
    let userConnectSpy, geoConnectSpy, returnPromise;

    beforeEach(() => {
      userConnectSpy = spyOn(mockUser,'connect').and.callThrough();
      geoConnectSpy = spyOn(mockGeo,'connect').and.callThrough();
      returnPromise = roundware.connect().catch(failSpecOnErrorCallback);
    });

    it('makes the User connection API call',() => {
      expect(userConnectSpy).toHaveBeenCalled();
    });

    it('makes the GeoPosition connection API call',() => {
      expect(mockGeo.connect).toHaveBeenCalledWith(mockStream.update);
    });

    it('returns a promise',(done) => {
      expect(returnPromise instanceof Promise).toBe(true);
      returnPromise.then(done).catch(failSpecOnErrorCallback);
    });
  });

  describe('when connected',() => {
    let firstPlayCallback = function dummyFunction() {};

    beforeEach((done) => {
      roundware.connect().
        then(done).
        catch(failSpecOnErrorCallback);
    });

    it('.play() waits on the initial geolocation promise before commanding the stream object to start playing',(done) => {
      let streamPlaySpy = spyOn(mockStream,'play').and.callThrough();

      roundware.play(firstPlayCallback).
        then(done).
        then(() => {
          expect(streamPlaySpy).toHaveBeenCalled();
        }).
        catch(failSpecOnErrorCallback);
    });

    it(".pause() commands the stream to pause",() => {
      let streamPauseSpy = spyOn(mockStream,'pause');
      roundware.pause();
      expect(streamPauseSpy).toHaveBeenCalled();
    });
  });

  describe("followed by .tags()",() => {
    let streamUpdateSpy;

    beforeEach(() => {
      streamUpdateSpy = spyOn(mockStream,"update");
    });

    it('sends a stream update',() => {
      roundware.tags("1234");
      expect(streamUpdateSpy).toHaveBeenCalledWith({ tag_ids: "1234" });
    });
  });
});
