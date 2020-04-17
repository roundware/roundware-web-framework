import { Envelope } from "../src/envelope";

describe("Envelope",() => {
  var project, storedCallback;

  var responseData = { 
    name: "ACME",
    pub_date: "2017-05-22",
    audio_format: "MP3"
  };

  var requestPromise = {
    then: (callback) => {
      storedCallback = callback;
      return requestPromise;
    }
  };

  var apiClient = {
    get: () => { return requestPromise; }
  };

  var newProjectOptions = {
    apiClient: apiClient
  };

  beforeEach(() => {
    spyOn(apiClient,"get").and.callThrough();
    project = new Project("100",newProjectOptions);
  });

  it(".toString() returns a useful string",() => {
    expect(project.toString()).toMatch(/100/);
  });

  it(".connect() makes an API request to /projects/#",() => {
    project.connect(300);
    expect(apiClient.get).
      toHaveBeenCalledWith("/projects/100",{ session_id: 300 });
  });

  it("connect() returns a promise for the connect request",() => { 
    expect(project.connect(333)).toBe(requestPromise);
  });

  it("connect() attaches a callback to the connect request promise that returns the given sessionID",() => { 
    project.connect(333);
    expect(storedCallback(responseData)).toBe(333);
  });

  it(".connect() extracts project data from the API call",() => {
    project.connect(300);
    storedCallback(responseData);
    expect(project.toString()).toMatch(/ACME/);
  });
});

