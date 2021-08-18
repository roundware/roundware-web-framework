import { noAssetData } from "../../src/constants/warning";
import {
  InvalidArgumentError,
  MissingArgumentError,
} from "../../src/errors/app.errors";
import { GeoListenMode, Roundware } from "../../src/roundware";
import { IRoundwareConstructorOptions } from "../../src/types/roundware";

describe("Roundware", () => {
  describe("Instantiation", () => {
    it("throw error if windowScope not passed", () => {
      // @ts-expect-error
      expect(() => new Roundware()).toThrow(
        new MissingArgumentError(
          `windowScope`,
          `instantiating Roundware`,
          `window`
        )
      );
    });

    it("throws error if options not passed", () => {
      // @ts-expect-error
      expect(() => new Roundware(global.window)).toThrow(
        new MissingArgumentError(
          `options`,
          `instantiating Roundware`,
          `IRoundwareConstructorOptions`
        )
      );
    });

    it("throw error if serverUrl is not passed or invalid", () => {
      // @ts-expect-error
      expect(() => new Roundware(global.window, {})).toThrow(
        new InvalidArgumentError(
          `options.serverUrl`,
          `string`,
          `instantiating Roundware`
        )
      );
    });

    it("throw error if projectId is not passed or invalid", () => {
      expect(
        () =>
          // @ts-expect-error
          new Roundware(global.window, {
            serverUrl: "mock.roundware.com",
          })
      ).toThrow(
        new InvalidArgumentError(
          `options.serverUrl`,
          `string`,
          `instantiating Roundware`
        )
      );
    });

    it("creates a Roundware instance successfully", () => {
      const options: IRoundwareConstructorOptions = {
        serverUrl: "https://prod.roundware.com/api/2",
        projectId: 10,
        assetFilters: {},
        listenerLocation: {
          latitude: 50,
          longitude: 155,
        },
        deviceId: "",
        apiClient: undefined,
        geoListenMode: GeoListenMode.DISABLED,
      };
      const roundware = new Roundware(global.window, options);
      expect(roundware).toBeInstanceOf(Roundware);
    });
  });

  describe("Access Properties", () => {
    const options: IRoundwareConstructorOptions = {
      serverUrl: "https://prod.roundware.com/api/2",
      projectId: 10,
      assetFilters: {},
      listenerLocation: {
        latitude: 50,
        longitude: 155,
      },
      deviceId: "",
      apiClient: undefined,
      geoListenMode: GeoListenMode.DISABLED,
    };
    const roundware = new Roundware(global.window, options);
    it("Return array of assets", () => {
      const assets = roundware.assets();
      console.log(assets);
      expect(Array.isArray(assets)).toBe(true);
    });

    it(".connect() - should return uiConfig", async () => {
      // @ts-ignore
      // fetch.enableMocks();

      // // @ts-ignore
      // fetch.mockResponse((req): Promise<void | any> => {
      //   console.log(req);
      //   if (req.method == "OPTIONS") return Promise.resolve("");

      //   switch (req.url) {
      //     case "https://prod.roundware.com/api/2/users/?method=POST":
      //       if (req.method == "POST")
      //         return Promise.resolve(JSON.stringify(MOCK_USER_DATA));

      //     case "https://prod.roundware.com/api/2/sessions/method=POST":
      //       if (req.method == "POST")
      //         return Promise.resolve(JSON.stringify(MOCK_SESSION_DATA));

      //     case "https://prod.roundware.com/api/2/projects/10/?session_id=91152":
      //       if (req.method == "GET")
      //         Promise.resolve(JSON.stringify(MOCK_PROJECT_DATA));
      //       break;

      //     case "https://prod.roundware.com/api/2/projects/10/uiconfig/?session_id=91152":
      //       if (req.method == "GET")
      //         Promise.resolve(JSON.stringify(MOCK_PROJECT_UICONFIG_DATA));
      //       break;
      //     case "https://prod.roundware.com/api/2/speakers/?activeyn=true&project_id=10":
      //       if (req.method == "GET")
      //         Promise.resolve(JSON.stringify(MOCK_SPEAKER_DATA));
      //       break;
      //     case "https://prod.roundware.com/api/2/audiotracks/?project_id=10&active=true":
      //       if (req.method == "GET")
      //         Promise.resolve(JSON.stringify(MOCK_AUDIO_TRACKS_DATA));
      //       break;
      //     case "https://prod.roundware.com/api/2/assets/?submitted=true&media_type=audio&project_id=10":
      //       if (req.method == "GET")
      //         Promise.resolve(JSON.stringify(MOCK_ASSET_DATA));
      //       break;

      //     case "https://prod.roundware.com/api/2/timedassets/?project_id=10":
      //       if (req.method == "GET")
      //         Promise.resolve(JSON.stringify(MOCK_TIMED_ASSET_DATA));
      //       break;
      //     default:
      //       return Promise.resolve();
      //   }
      // });

      const data = await roundware.connect();
      console.log(data);
      expect(data).toHaveProperty("uiConfig");
      expect(data.uiConfig).toHaveProperty("speak");
    });
  });
});
