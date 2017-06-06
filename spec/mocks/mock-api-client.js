import { ApiClient } from "../../src/api-client";

let mockApiClientRequestPromise = {
  storedCallback: () => {},

  done: function(callback) {
    this.storedCallback = callback;
    return mockApiClientRequestPromise;
  },

  then: function(callback) {
    this.storedCallback = callback;
    return this.done(callback);
  },
};

let mockApiClient = new ApiClient("http://roundware.example.com");

// note You have to call this method inside a beforeEach or it() function
//   import mockApiClient from "./mocks/mock-api-client";
//   beforeEach(mockApiClient.testInit);
mockApiClient.testInit = () => {
  spyOn(mockApiClient,"get").and.returnValue(mockApiClientRequestPromise);
  spyOn(mockApiClient,"post").and.returnValue(mockApiClientRequestPromise);
  spyOn(mockApiClient,"patch").and.returnValue(mockApiClientRequestPromise);
  spyOn(mockApiClient,"send").and.returnValue(mockApiClientRequestPromise);
  spyOn(mockApiClient,"setAuthToken");
};

export { mockApiClient, mockApiClientRequestPromise };
