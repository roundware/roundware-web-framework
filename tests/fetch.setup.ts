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

export const setupFetchMock = () => {
  global.fetch = jest.fn(
    (input: RequestInfo, init?: RequestInit): Promise<any> => {
      if (init.method == "OPTIONS") return Promise.resolve(getResponse(input));

      switch (input) {
        case "https://prod.roundware.com/api/2/users/?method=POST":
          if (init.method == "POST")
            return Promise.resolve(getResponse(input, MOCK_USER_DATA));
          return Promise.resolve(getResponse(input));

        case "https://prod.roundware.com/api/2/sessions/?method=POST":
          if (init.method == "POST")
            return Promise.resolve(getResponse(input, MOCK_SESSION_DATA));
          return Promise.resolve(getResponse(input));

        case "https://prod.roundware.com/api/2/projects/10/?method=GET&contentType=x-www-form-urlencoded&session_id=91152":
          if (init.method == "GET")
            return Promise.resolve(getResponse(input, MOCK_PROJECT_DATA));
          return Promise.resolve(getResponse(input));

        case "https://prod.roundware.com/api/2/projects/10/uiconfig/?method=GET&contentType=x-www-form-urlencoded&session_id=91152":
          if (init.method == "GET")
            return Promise.resolve(
              getResponse(input, MOCK_PROJECT_UICONFIG_DATA)
            );
          return Promise.resolve(getResponse(input));

        case "https://prod.roundware.com/api/2/speakers/?method=GET&contentType=x-www-form-urlencoded&project_id=10":
          if (init.method == "GET")
            return Promise.resolve(getResponse(input, MOCK_SPEAKER_DATA));
          return Promise.resolve(getResponse(input));

        case "https://prod.roundware.com/api/2/audiotracks/?method=GET&contentType=x-www-form-urlencoded&project_id=10&active=true":
          if (init.method == "GET")
            return Promise.resolve(getResponse(input, MOCK_AUDIO_TRACKS_DATA));
          return Promise.resolve(getResponse(input));

        case "https://prod.roundware.com/api/2/assets/?method=GET&contentType=x-www-form-urlencoded&project_id=10":
          if (init.method == "GET")
            return Promise.resolve(getResponse(input, MOCK_ASSET_DATA));
          return Promise.resolve(getResponse(input));

        case "https://prod.roundware.com/api/2/timedassets/?method=GET&contentType=x-www-form-urlencoded&project_id=10":
          if (init.method == "GET")
            return Promise.resolve(getResponse(input, MOCK_TIMED_ASSET_DATA));
          return Promise.resolve(getResponse(input));

        default:
          if (
            input
              .toString()
              .startsWith(
                "https://prod.roundware.com/api/2/assets/?method=GET&contentType=x-www-form-urlencoded&created__gte"
              )
          ) {
            return Promise.resolve(getResponse(input, []));
          }
          if (
            input.toString() ==
            "https://prod.roundware.com/api/2/assets/?method=GET&contentType=x-www-form-urlencoded&project_id=10&latitude=42.4986343383789"
          )
            return Promise.resolve(
              getResponse(
                input,
                MOCK_ASSET_DATA.filter(
                  (asset) => asset.latitude == 42.4986343383789
                )
              )
            );
          if (
            input
              .toString()
              .startsWith(
                "https://prod.roundware.com/api/2/timedassets/?method=GET&contentType=x-www-form-urlencoded&created__gte"
              )
          ) {
            return Promise.resolve(getResponse(input, []));
          }
          console.warn(`Sent empty response for: `, input);
          return Promise.resolve(getResponse(input));
      }
    }
  );

  function getResponse(input: RequestInfo, body?: object) {
    if (!body) console.warn(`Sent empty response for: `, input);
    return {
      status: 200,
      ok: true,
      json: () => Promise.resolve(body),
    };
  }
};
setupFetchMock();
