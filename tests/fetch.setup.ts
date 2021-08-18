/* Sends mock responses for roundware API calls */
import {
  MOCK_ASSET_DATA,
  MOCK_AUDIO_TRACKS_DATA,
  MOCK_PROJECT_DATA,
  MOCK_PROJECT_UICONFIG_DATA,
  MOCK_SESSION_DATA,
  MOCK_SPEAKER_DATA,
  MOCK_TIMED_ASSET_DATA,
  MOCK_USER_DATA,
} from "./__mocks__/mock_api_responses";
global.fetch = jest.fn(
  (input: RequestInfo, init?: RequestInit): Promise<any> => {
    if (init.method == "OPTIONS") return Promise.resolve(getResponse());

    switch (input) {
      case "https://prod.roundware.com/api/2/users/?method=POST":
        if (init.method == "POST")
          return Promise.resolve(getResponse(MOCK_USER_DATA));
        return Promise.resolve(getResponse());

      case "https://prod.roundware.com/api/2/sessions/?method=POST":
        if (init.method == "POST")
          return Promise.resolve(getResponse(MOCK_SESSION_DATA));
        return Promise.resolve(getResponse());

      case "https://prod.roundware.com/api/2/projects/10/?method=GET&contentType=x-www-form-urlencoded&session_id=91152":
        if (init.method == "GET")
          return Promise.resolve(getResponse(MOCK_PROJECT_DATA));
        return Promise.resolve(getResponse());

      case "https://prod.roundware.com/api/2/projects/10/uiconfig/?method=GET&contentType=x-www-form-urlencoded&session_id=91152":
        if (init.method == "GET")
          return Promise.resolve(getResponse(MOCK_PROJECT_UICONFIG_DATA));
        return Promise.resolve(getResponse());

      case "https://prod.roundware.com/api/2/speakers/?method=GET&contentType=x-www-form-urlencoded&project_id=10":
        if (init.method == "GET")
          return Promise.resolve(getResponse(MOCK_SPEAKER_DATA));
        return Promise.resolve(getResponse());

      case "https://prod.roundware.com/api/2/audiotracks/?method=GET&contentType=x-www-form-urlencoded&project_id=10&active=true":
        if (init.method == "GET")
          return Promise.resolve(getResponse(MOCK_AUDIO_TRACKS_DATA));
        return Promise.resolve(getResponse());

      case "https://prod.roundware.com/api/2/assets/?submitted=true&media_type=audio&project_id=10":
        if (init.method == "GET")
          return Promise.resolve(getResponse(MOCK_ASSET_DATA));
        return Promise.resolve(getResponse());

      case "https://prod.roundware.com/api/2/timedassets/?project_id=10":
        if (init.method == "GET")
          return Promise.resolve(getResponse(MOCK_TIMED_ASSET_DATA));
        return Promise.resolve(getResponse());

      default:
        return Promise.resolve(getResponse());
    }
  }
);

function getResponse(body?: object) {
  return {
    status: 200,
    ok: true,
    json: () => Promise.resolve(body),
  };
}
