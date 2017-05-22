import { Project } from "../src/project";

describe("Project",() => {
  var project;
  var responseData = { 
    name: "ACME",
    pub_date: "2017-05-22",
    audio_format: "MP3"
  };
  var requestPromise = {
    then: (callback) => {
      return callback(responseData);
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

  it("connect() returns the given sessionID",() => { 
    expect(project.connect(333)).toBe(333);
  });

  it(".connect() extracts project data from the API call",() => {
    project.connect(300);
    expect(project.toString()).toMatch(/ACME/);
  });
});
