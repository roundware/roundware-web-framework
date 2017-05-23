import { User } from "../src/user";

describe("User",() => {
  var user, storedCallback;

  var responseData = {
    username: "Sonya"
  };

  var requestPromise = {
    done(callback) {
      storedCallback = callback;
      return requestPromise;
    }
  };

  var apiClient = {
    post: () => { return requestPromise; },
    setAuthToken: () => {}
  };

  var newUserOptions = {
    apiClient: apiClient
  };

  beforeEach(function()  {
    spyOn(apiClient,"post").and.callThrough();
    spyOn(apiClient,"setAuthToken");
    user = new User(newUserOptions);
  });

  it(".toString() returns a useful string",() => {
    expect(user.toString()).toMatch(/User/);
  });

  it(".connect() makes an API request to /users/#",() => {
    user.connect();
    expect(apiClient.post).
      toHaveBeenCalledWith("/users/",{ device_id: "00000000000000", client_type: "web" });
  });

  it("connect() returns a promise for the connect request",() => { 
    expect(user.connect()).toBe(requestPromise);
  });

  it(".connect() attachs a callback that extracts user data from the API call",() => {
    user.connect();
    storedCallback(responseData);
    expect(user.toString()).toMatch(/Sonya/);
  });
});
