import { ApiClient } from "../src/api-client";

describe("ApiClient",() => {
  let client;
  let sendOptions = { xyz: 123 };
  let apiSuccessPromise = {
    then: () => apiSuccessPromise,
    fail: () => {}
  };

  let deferredPromise = {
    then: (callback) => callback()
  };

  const baseUrl = "http://example.com";
  const streamsPath = "/streams/";
  const streamsUrl = baseUrl + streamsPath;
  const data = { a: 1 };

  let failSpecOnErrorCallback = (err) => {
    /* istanbul ignore next */
    fail(err);
  };

  let deferredObj = {
    promise: () => deferredPromise,
    resolve: (resolveValue) => Promise.resolve(resolveValue),
    reject: (rejectValue) => {} // hard to resolve incompatibility with ES6 Promise, jQuery Promise, Jasmine in a rejection scenario
  };

  let jQueryDummy = {
    ajax: () => apiSuccessPromise,
    ajaxSetup: () => {},
    Deferred: () => deferredObj
  };

  let dummyWindow = {
    jQuery: jQueryDummy
  };

  describe('with API success',() => {
    beforeEach(() => {
      spyOn(jQueryDummy,"ajax").and.callThrough();
      client = new ApiClient(dummyWindow,baseUrl);
    });

    it(".get() makes GET requests with URL params",(done) => {
      client.get(streamsPath,data,sendOptions).then(done);

      expect(jQueryDummy.ajax).toHaveBeenCalledWith(streamsUrl,jasmine.objectContaining({ 
        method: "GET", 
        data: data,
        xyz: 123
      }));
    });

    it(".get() returns a promise",(done) => {
      let result = client.get(streamsPath,data,sendOptions);
      expect(result).toEqual(deferredPromise);
      result.then(done);
    });

    it(".post() makes POST requests, serialized with JSON",(done) => {
      client.post(streamsPath,data,sendOptions).then(done);

      expect(jQueryDummy.ajax).toHaveBeenCalledWith(streamsUrl,jasmine.objectContaining({ 
        method: "POST",
        data: data
      }));
    });

    it(".post() returns a promise",(done) => {
      let result = client.post(streamsPath,data,sendOptions);
      expect(result).toEqual(deferredPromise);
      result.then(done);
    });

    it(".patch() makes PATCH requests",(done) => {
      client.patch(streamsPath,data,sendOptions).then(done);

      expect(jQueryDummy.ajax).toHaveBeenCalledWith(streamsUrl,jasmine.objectContaining({ 
        method: "PATCH",
        data: data
      }));
    });

    it(".patch() returns the request object",() => {
      expect(client.patch(streamsPath,data,sendOptions)).toEqual(deferredPromise);
    });

    it(".send() makes generic Ajax requests",(done) => {
      let customOptions = { xyz: "123", method: "POST" };
      client.send(streamsPath,data,customOptions).then(done);
      expect(jQueryDummy.ajax).toHaveBeenCalledWith(streamsUrl,jasmine.objectContaining(customOptions));
    });

    it(".setAuthToken() sets authorization headers",() => {
      spyOn(jQueryDummy,"ajaxSetup");
      client.setAuthToken("ABC123");

      expect(jQueryDummy.ajaxSetup).toHaveBeenCalledWith(jasmine.objectContaining({
        headers: jasmine.objectContaining({ 
          Authorization: "token ABC123"
        })
      }));
    });
  });

  describe('with network error',() => {
    let apiErrorPromise = {
      then: () => apiErrorPromise,
      fail: (callback) => callback({},"yikes","error")
    };

    it('unwraps and rethrows the error',() => {
      jQueryDummy.ajax = () => apiErrorPromise;
      spyOn(deferredObj,"reject");
      client = new ApiClient(dummyWindow,baseUrl);
      client.get(streamsPath,data,sendOptions);//.then(done,() => {}).catch(()=>{});
      expect(deferredObj.reject).toHaveBeenCalledWith(jasmine.stringMatching(/yikes/));
    });
  });
});
