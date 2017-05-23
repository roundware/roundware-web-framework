import { Session } from "../src/session";
import { mockApiClient, mockApiClientRequestPromise } from "./mocks/mock-api-client";

describe("Session",() => {
  let session;
  let userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5)";
  let geoListenEnablement = "geoListenEnablement setting";
  let responseData = {
    session_id: 22
  };

  beforeEach(() => {
    let newSessionOptions = {
      apiClient: mockApiClient,
      userAgent: userAgent
    };

    mockApiClient.testInit();
    session = new Session(30,geoListenEnablement,newSessionOptions);
  });

  it(".toString() returns a useful string",() => {
    expect(session.toString()).toMatch(/Session/);
  });

  it(".connect() makes an API request to /sessions/",() => {
    session.connect();
    expect(mockApiClient.post).
      toHaveBeenCalledWith("/sessions/",{ 
        project_id: 30,
        geo_listen_enabled: geoListenEnablement,
        client_system: userAgent
      });
  });

  it("connect() returns a promise for the connect request",() => { 
    expect(session.connect()).toBe(mockApiClientRequestPromise);
  });

  it(".connect() attaches a callback that extracts session data from the API call",() => {
    session.connect();
    mockApiClientRequestPromise.storedCallback(responseData);
    expect(session.toString()).toMatch(/Session #22/);
  });

  describe("with a long userAgent",() => {
    let longUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 1234567890Padding";
    let longUserAgentSession;

    beforeEach(() => {
      let newSessionOptions = {
        apiClient: mockApiClient,
        userAgent: longUserAgent
      };

      longUserAgentSession = new Session(30,geoListenEnablement,newSessionOptions);
    });

    it(".connect() uses an abbreviated clientSystem value for the API request",() => {
      longUserAgentSession.connect();
      expect(mockApiClient.post).
        toHaveBeenCalledWith("/sessions/",{ 
          project_id: 30,
          geo_listen_enabled: geoListenEnablement,
          client_system: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 12345"
        });
    });
  });
});
