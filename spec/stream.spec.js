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

  it(".play() makes an API request to /streams/",() => {
    stream.play(sessionId,initialCoordinates);
    mockApiClientRequestPromise.storedCallback(responseData);

    let expectedData = {};
    Object.assign(expectedData,initialCoordinates,{ session_id:  sessionId });

    expect(mockApiClient.post).
      toHaveBeenCalledWith("/streams/",expectedData,{ 
        cache: true
      });
  });

  it(".play() returns a promise for the API request",() => { 
    expect(stream.play(sessionId,initialCoordinates)).toBe(mockApiClientRequestPromise);
  });

  it(".play() attaches a callback that extracts session data from the API call",() => {
    stream.play(sessionId,initialCoordinates);
    mockApiClientRequestPromise.storedCallback(responseData);
    expect(stream.toString()).toMatch(/Stream #1300/);
  });

  it(".play() invokes the caller's firstPlayCallback with a new audio stream URL",() => {
    let firstPlayCallback = jasmine.createSpy("firstPlayCallback");
    stream.play(sessionId,initialCoordinates,firstPlayCallback);
    mockApiClientRequestPromise.storedCallback(responseData);
    expect(firstPlayCallback).toHaveBeenCalledWith(streamUrl);
  });

  it('multiple calls to .play() invoke the firstPlayCallback once, and make /resume calls to the server thereafter ',() => {
    let firstPlayCallback = jasmine.createSpy("firstPlayCallback");

    stream.play(sessionId,initialCoordinates,firstPlayCallback);
    mockApiClientRequestPromise.storedCallback(responseData);

    let secondPlayResponse = stream.play(sessionId,initialCoordinates,firstPlayCallback);
    expect(secondPlayResponse).toBe(mockApiClientRequestPromise);

    expect(firstPlayCallback).toHaveBeenCalledTimes(1);
    expect(mockApiClient.post).toHaveBeenCalledTimes(2);

    expect(mockApiClient.post).
      toHaveBeenCalledWith("/streams/1300/resume/");
  });

  it(".play() creates a heartbeat timer",() => {
    stream.play(sessionId,initialCoordinates);
    mockApiClientRequestPromise.storedCallback(responseData);
    
    jasmine.clock().tick(heartbeatIntervalSeconds * 1000);
    expect(mockApiClient.post).
      toHaveBeenCalledWith("/streams/1300/heartbeat/", { session_id: 650 });
  });

  it(".update() sends new data to the server",() => {
    stream.play(sessionId,initialCoordinates);
    mockApiClientRequestPromise.storedCallback(responseData);

    stream.update({ abc: 123 });

    expect(mockApiClient.patch).
      toHaveBeenCalledWith("/streams/1300/", { abc: 123, session_id: 650 });
  });

  it('.pause() does nothing when called before .play()',() => {
    expect(() => stream.pause()).not.toThrow();
  });

  it('.pause() sends a pause API message when called after .play()',() => {
    stream.play(sessionId,initialCoordinates);
    mockApiClientRequestPromise.storedCallback(responseData);
    stream.pause();

    expect(mockApiClient.post).
      toHaveBeenCalledWith("/streams/1300/pause/");
  });
});
