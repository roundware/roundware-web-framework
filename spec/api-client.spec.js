import { ApiClient } from "../src/api-client";

describe("ApiClient",function() {
  var client;

  var ajaxInterface = { 
    ajax: function() {},
    ajaxSetup: function() {}
  };

  var ajaxSpy;
  var sendOptions = { xyz: 123 };
  var ajaxRequestPromiseErrorHandler;
  var ajaxRequestErrorHandlingPromise;

  var ajaxRequestPromise = {
    catch(errorHandlingBehavior) {
      ajaxRequestPromiseErrorHandler = errorHandlingBehavior;
      return ajaxRequestErrorHandlingPromise;
    }
  };
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
      returnValue(ajaxRequestPromise);
  });

  it(".get() makes GET requests",function() {
    client.get(streamsPath,data,sendOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "GET", xyz: 123, crossDomain: true });
  });

  it(".get() returns the request object",function() {
    expect(client.get(streamsPath,data,sendOptions)).toBe(ajaxRequestErrorHandlingPromise);
  });

  it(".post() makes POST requests",function() {
    client.post(streamsPath,data,sendOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "POST", xyz: 123, crossDomain: true });
  });

  it(".post() returns the request object",function() {
    expect(client.post(streamsPath,data,sendOptions)).toBe(ajaxRequestErrorHandlingPromise);
  });

  it(".patch() makes PATCH requests",function() {
    client.patch(streamsPath,data,sendOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "PATCH", xyz: 123, crossDomain: true });
  });

  it(".patch() returns the request object",function() {
    expect(client.patch(streamsPath,data,sendOptions)).toBe(ajaxRequestErrorHandlingPromise);
  });

  it(".send() makes generic Ajax requests, with data",function() {
    var customOptions = { method: "HEAD", cache: true };

    client.send(streamsPath,data,customOptions);
    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "HEAD", cache: true, crossDomain: true });
  });

  it('.send() rethrows async API errors',() => {
    client.send(streamsPath,data,sendOptions);
    expect(ajaxRequestPromiseErrorHandler).not.toBeNull();
    expect(() => ajaxRequestPromiseErrorHandler({},"ugh","a problem")).toThrow(jasmine.stringMatching('ugh'));
  });

  it("sets Ajax authorization header",function() {
    var headerSpy = spyOn(ajaxInterface,"ajaxSetup");

    client.setAuthToken("ABC123");

    expect(headerSpy).toHaveBeenCalledWith({
      headers: { 
        Authorization: "token ABC123"
      }
    });
  });
});
