import { noAssetData } from "../../src/constants/warning";
import {
  InvalidArgumentError,
  MissingArgumentError,
} from "../../src/errors/app.errors";
import { GeoListenMode, Roundware } from "../../src/roundware";
import { IRoundwareConstructorOptions } from "../../src/types/roundware";
import { MOCK_PROJECT_UICONFIG_DATA } from "../__mocks__/mock_api_responses";

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

    it(".connect() - should return promise of uiConfig", async () => {
      const data = await roundware.connect();
      expect(data.uiConfig).toMatchObject(MOCK_PROJECT_UICONFIG_DATA);
    });
  });
});
