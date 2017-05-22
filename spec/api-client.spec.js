import { ApiClient } from "../src/api-client";

describe("ApiClient",function() {
  var client;

  var ajaxInterface = { 
    ajax: function() {},
    ajaxSetup: function() {}
  };

  var ajaxSpy;

  const baseUrl = "http://example.com";
  const streamsPath = "/streams/";
  const streamsUrl = baseUrl + streamsPath;
  const data = { a: 1 };

  beforeEach(() => {
    var options = {
      ajaxInterface: ajaxInterface
    };

    client = new ApiClient(baseUrl,options);
    ajaxSpy = spyOn(ajaxInterface,"ajax").and.callThrough();
  });

  it(".send() makes Ajax requests with data",function() {
    var options = { method: "POST", cache: true };

    client.send(streamsPath,data,options);

    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "POST", cache: true });
  });

  it(".get() makes GET requests",function() {
    var options = { cache: true };

    client.get(streamsPath,data,options);

    expect(ajaxSpy).toHaveBeenCalledWith(streamsUrl,{ data: data, method: "GET", cache: true });
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
