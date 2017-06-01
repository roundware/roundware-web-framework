import Roundware from '../src/roundware';

describe('Roundware', function() {
  let roundware;
  let audioStreamUrl = "http://audio.example.com";
  const sessionId = 250;

  let mockUser = {
    connect: () => { return new Promise((resolve,reject) => { resolve(); }); }
  };

  let mockGeo = jasmine.createSpyObj('geoPosition',['connect']); 

  let mockSession = {
    connect: () => { return new Promise((resolve,reject) => { resolve(sessionId); }); }
  };

  let mockProject = {
    connect: () => { return new Promise((resolve,reject) => { resolve(sessionId); }); }
  };

  let mockStream = {
    connect: () => { return Promise.resolve(audioStreamUrl); },
    update: {}
  };

  /* istanbul ignore next */
  let failSpecOnErrorCallback = (err) => {
    fail(err);
  };

  beforeEach(() => {
    roundware = new Roundware({
      projectId: 1,
      serverUrl: 'http://example.com',
      user: mockUser,
      geoPosition: mockGeo,
      session: mockSession,
      project: mockProject,
      stream: mockStream
    });
  });

  describe('.start()',() => {
    let userConnectSpy, sessionConnectSpy, projectConnectSpy, returnPromise;

    beforeEach(() => {
      userConnectSpy = spyOn(mockUser,'connect').and.callThrough();
      returnPromise = roundware.start().catch(failSpecOnErrorCallback);
    });

    it('makes the User connection API call',() => {
      expect(userConnectSpy).toHaveBeenCalled();
    });

    it('makes the GeoPosition connection API call',() => {
      expect(mockGeo.connect).toHaveBeenCalledWith(mockStream.update);
    });

    it('returns a promise that succeeds with the audio stream URL',(done) => {
      expect(returnPromise instanceof Promise).toBe(true);

      returnPromise.then((successValue) => {
        expect(successValue).toBe(audioStreamUrl);
      }).catch(failSpecOnErrorCallback).
        then(done);
    });
  });

  describe(".tags()",() => {
    var streamUpdateSpy;

    beforeEach(() => {
      streamUpdateSpy = spyOn(mockStream,"update");
    });

    it('sends a stream update',() => {
      roundware.tags("1234");
      expect(streamUpdateSpy).toHaveBeenCalledWith({ tag_ids: "1234" });
    });
  });

  it('constructor raises throws error when the server URL parameter is missing', function() {
    expect(() => {
      new Roundware({ projectId: 1 });
    }).toThrow(jasmine.stringMatching('serverUrl'));
  });

  it('constructor throws error when the project ID parameter is missing', function() {
    expect(() => {
      new Roundware({ serverUrl: 'http://example.com' });
    }).toThrow(jasmine.stringMatching('projectId'));
  });
});
