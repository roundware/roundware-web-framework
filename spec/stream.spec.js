import { Stream } from "../src/stream";
import { mockApiClient, mockApiClientRequestPromise } from "./mocks/mock-api-client";

describe("Stream",() => {
  let stream;
  let streamUrl = "http://audio.example.com/100.mp3";
  let sessionId = 650;
  let initialCoordinates = {
    latitude: 39.2904,
    longitude: 76.6122
  };
  let geoMonitorCallback;
  let geoMonitor = {
    progress: function(callback) {
      geoMonitorCallback = callback;
    }
  };
  let initialGeolocation = {
    then: function(callback) {
      return callback(initialCoordinates,geoMonitor);
    }
  };

  let responseData = {
    stream_url: streamUrl,
    stream_id: 1300
  };

  let heartbeatIntervalSeconds = 1;

  beforeEach(() => {
    mockApiClient.testInit();
    jasmine.clock().install(); // so we can test heartbeat .setInterval

    stream = new Stream({ 
      apiClient: mockApiClient,
      heartbeatIntervalSeconds: heartbeatIntervalSeconds
    });
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it(".toString() returns a useful string",() => {
    expect(stream.toString()).toMatch(/Stream/);
  });

  it(".connect() makes an API request to /streams/",() => {
    stream.connect(sessionId,initialGeolocation);

    let expectedData = {};
    Object.assign(expectedData,initialCoordinates,{ session_id:  sessionId });

    expect(mockApiClient.post).
      toHaveBeenCalledWith("/streams/",expectedData,{ 
        crossDomain: true,
        cache: true
      });
  });

  it(".connect() returns a promise for the API request",() => { 
    expect(stream.connect(sessionId,initialGeolocation)).toBe(mockApiClientRequestPromise);
  });

  it(".connect() attaches a callback that extracts session data from the API call",() => {
    stream.connect(sessionId,initialGeolocation);
    mockApiClientRequestPromise.storedCallback(responseData);
    expect(stream.toString()).toMatch(/Stream #1300/);
  });

  it(".connect() attaches a callback that returns a new audio stream URL",() => {
    stream.connect(sessionId,initialGeolocation);
    let result = mockApiClientRequestPromise.storedCallback(responseData);
    expect(result).toBe(streamUrl);
  });

  it(".connect() registers a geoMonitor progress callback that updates the server with new position info",() => {
    stream.connect(sessionId,initialGeolocation);

    mockApiClientRequestPromise.storedCallback(responseData);
    geoMonitorCallback({ latitude: 10, longitude: 10 });

    expect(mockApiClient.patch).
      toHaveBeenCalledWith("/streams/1300/",{ session_id: 650, latitude: 10, longitude: 10 });
  });

  it(".connect() creates a heartbeat timer",() => {
    stream.connect(sessionId,initialGeolocation);
    mockApiClientRequestPromise.storedCallback(responseData);
    
    jasmine.clock().tick(heartbeatIntervalSeconds * 1000);
    expect(mockApiClient.post).
      toHaveBeenCalledWith("/streams/1300/heartbeat/", { session_id: 650 });
  });

  it(".update() sends new data to the server",() => {
    stream.connect(sessionId,initialGeolocation);
    mockApiClientRequestPromise.storedCallback(responseData);
    stream.update({ abc: 123 });

    expect(mockApiClient.patch).
      toHaveBeenCalledWith("/streams/1300/", { abc: 123, session_id: 650 });
  });
});
