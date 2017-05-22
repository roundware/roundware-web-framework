import { ApiClient } from "../src/api-client";

describe("ApiClient",function() {
  var client;

  var ajaxInterface = { 
    ajax: function() {},
    ajaxSetup: function() {}
  };

  var ajaxSpy;
  var sendOptions = { cache: true };

  var ajaxRequest = {};
  const baseUrl = "http://example.com";
  const streamsPath = "/streams/";
  const streamsUrl = baseUrl + streamsPath;
  const data = { a: 1 };

  beforeEach(() => {
    var options = {
      ajaxInterface: ajaxInterface
    };

    client = new ApiClient(baseUrl,options);

    ajaxSpy = spyOn(ajaxInterface,"ajax").
      and.
      returnValue(ajaxRequest);
  });

  it(".get() makes GET requests",function() {
    client.get(streamsPath,data,sendOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "GET", cache: true });
  });

  it(".get() returns the request object",function() {
    expect(client.get(streamsPath,data,sendOptions)).toBe(ajaxRequest);
  });

  it(".post() makes POST requests",function() {
    client.post(streamsPath,data,sendOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "POST", cache: true });
  });

  it(".post() returns the request object",function() {
    expect(client.post(streamsPath,data,sendOptions)).toBe(ajaxRequest);
  });

  it(".patch() makes PATCH requests",function() {
    client.patch(streamsPath,data,sendOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "PATCH", cache: true });
  });

  it(".patch() returns the request object",function() {
    expect(client.patch(streamsPath,data,sendOptions)).toBe(ajaxRequest);
  });

  it(".send() makes generic Ajax requests, with data",function() {
    var customOptions = { method: "HEAD", cache: true };

    client.send(streamsPath,data,customOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "HEAD", cache: true });
  });

  it("sets Ajax authorization header",function() {
    var headerSpy = spyOn(ajaxInterface,"ajaxSetup");

    client.setAuthToken("ABC123");

    expect(headerSpy).toHaveBeenCalledWith({
      headers: { 
        Authorization: "token ABC123"
      },
      crossDomain: true
    });
  });
});
