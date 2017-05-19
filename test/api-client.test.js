import { ApiClient } from "../src/api-client";

describe("ApiClient",function() {
  var client, ajaxSpy;

  var ajaxInterface = { 
    ajax: function() {},
    ajaxSetup: function() {}
  };

  const baseUrl = "http://example.com";
  const streamsUrl = baseUrl + "/streams/";

  beforeEach(() => {
    client = new ApiClient({ ajaxInterface: ajaxInterface });
    // STOPPED HERE
    ajaxSpy = sinon.spy(ajaxInterface,"ajax");
  });


  it("makes Ajax requests",function() {
    var data = { a: 1 };
    var options = { method: "POST", cache: true };

    client.send("/streams/",data,options);

    expect(ajaxSpy).to.have.been.calledWith(streamsUrl,{ data: data, method: "POST", cache: true });
  });

  it("sets Ajax authorization header",function() {
    var headerSpy = sinon.spy(ajaxInterface,"ajaxSetup");
    client.setAuthToken("ABC123");

    expect(headerSpy).to.have.been.calledWith({
      headers: { 
        Authorization: "token ABC123"
      }
    });
  });
});
