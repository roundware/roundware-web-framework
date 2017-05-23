import { User } from "../src/user";
import { mockApiClient, mockApiClientRequestPromise } from "./mocks/mock-api-client";

describe("User",() => {
  var user;

  var responseData = {
    username: "Sonya",
    token: "ABC123"
  };

  beforeEach(mockApiClient.testInit);

  var newUserOptions = {
    apiClient: mockApiClient
  };

  beforeEach(function()  {
    user = new User(newUserOptions);
  });

  it(".toString() returns a useful string",() => {
    expect(user.toString()).toMatch(/User/);
  });

  it(".connect() makes an API request to /users/#",() => {
    user.connect();
    expect(mockApiClient.post).
      toHaveBeenCalledWith("/users/",{ device_id: "00000000000000", client_type: "web" });
  });

  it("connect() returns a promise for the connect request",() => { 
    expect(user.connect()).toBe(mockApiClientRequestPromise);
  });

  it(".connect() attaches a callback that extracts user data from the API call",() => {
    user.connect();
    mockApiClientRequestPromise.storedCallback(responseData);
    expect(user.toString()).toMatch(/Sonya/);
  });

  it(".connect() passes the retrieved auth token to the API client",() => {
    user.connect();
    mockApiClientRequestPromise.storedCallback(responseData);

    expect(mockApiClient.setAuthToken).
      toHaveBeenCalledWith("ABC123");
  });
});
