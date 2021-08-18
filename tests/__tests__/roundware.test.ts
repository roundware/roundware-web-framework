import { assetDecorationMapper } from "../../src/assetPool";
import { noAssetData } from "../../src/constants/warning";
import {
  InvalidArgumentError,
  MissingArgumentError,
} from "../../src/errors/app.errors";
import {
  allAssetFilter,
  anyTagsFilter,
  distanceRangesFilter,
  GeoListenMode,
  Roundware,
} from "../../src/roundware";
import { IAssetData } from "../../src/types";
import { IRoundwareConstructorOptions } from "../../src/types/roundware";
import { coordsToPoints } from "../../src/utils";
import {
  MOCK_ASSET_DATA,
  MOCK_PROJECT_UICONFIG_DATA,
  MOCK_TIMED_ASSET_DATA,
} from "../__mocks__/mock_api_responses";

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

    it(".connect() - should successfully connect return promise of uiConfig", async () => {
      const data = await roundware.connect();
      expect(data.uiConfig).toMatchObject(MOCK_PROJECT_UICONFIG_DATA);
    });

    const MOCK_LOCATION = {
      latitude: 20,
      longitude: 43,
    };
    it(".updateLocation() - update location in mixer", () => {
      roundware.updateLocation(MOCK_LOCATION);

      const mixerListenerPoint = coordsToPoints(MOCK_LOCATION);
      expect(roundware.mixer.mixParams.listenerPoint).toEqual(
        mixerListenerPoint
      );
    });

    it(".onUpdateLocation() - should execute callback with listenerLocation when passed", () => {
      const onLocationUpdateCallback = jest.fn();
      roundware.onUpdateLocation = onLocationUpdateCallback;
      expect(onLocationUpdateCallback).toBeCalledTimes(1);
      expect(onLocationUpdateCallback).toHaveBeenLastCalledWith(
        roundware.geoPosition.getLastCoords()
      );
      roundware.updateLocation(MOCK_LOCATION);
      expect(onLocationUpdateCallback).toBeCalledTimes(2);
      expect(onLocationUpdateCallback).toHaveBeenLastCalledWith(MOCK_LOCATION);
    });

    it("onUpdateAssets() - called when assets are updated", async () => {
      const onUpdateAssetsCallback = jest.fn();
      roundware.onUpdateAssets = onUpdateAssetsCallback;
      expect(onUpdateAssetsCallback).toHaveBeenCalledTimes(0);
      await roundware.updateAssetPool();

      expect(onUpdateAssetsCallback).toHaveBeenCalledTimes(1);
      expect(onUpdateAssetsCallback).toHaveBeenLastCalledWith(
        roundware.assets()
      );
    });

    describe(".updateAssetPool()", () => {
      let roundware;
      beforeEach(() => {
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
        roundware = new Roundware(global.window, options);
      });
      afterEach(() => (roundware = undefined));
      it("update _lastAssetUpdate", async () => {
        // @ts-ignore
        expect(roundware._lastAssetUpdate).toBeUndefined();
        await roundware.updateAssetPool();
        // @ts-ignore
        expect(roundware._lastAssetUpdate instanceof Date).toBeTruthy();
      });

      it("update assetData when first time", async () => {
        expect(roundware.assetData).toBeNull();
        await roundware.updateAssetPool();
        expect(roundware.assetData).toEqual(MOCK_ASSET_DATA);
      });

      it("update assetData second time with created__gte:", async () => {
        expect(roundware.assetData).toBeNull();
        await roundware.updateAssetPool();
        expect(roundware.assetData).toEqual(MOCK_ASSET_DATA);
        await roundware.updateAssetPool();

        const fetchLastUrl: string =
          // @ts-ignore
          global.fetch.mock.calls[
            // @ts-ignore
            global.fetch.mock.calls.length - 1
          ][0].toString();
        expect(
          fetchLastUrl.startsWith(
            "https://prod.roundware.com/api/2/assets/?method=GET&contentType=x-www-form-urlencoded&created__gte"
          )
        ).toBeTruthy();
      });

      it("update assetPool assets with decoration", async () => {
        expect(roundware.assetPool.assets).toEqual([]);
        await roundware.updateAssetPool();
        expect(roundware.assetPool.assets).toEqual(
          MOCK_ASSET_DATA.map(assetDecorationMapper(MOCK_TIMED_ASSET_DATA))
        );
      });
    });

    it(".getAssetsFromPool() Returns a reduced asset list by filtering the overall pool.", async () => {
      let assets = await roundware.getAssetsFromPool(() => true);
      expect(assets).toEqual(MOCK_ASSET_DATA);
      assets = await roundware.getAssetsFromPool(
        (asset, mixParams) => asset.id == 5936
      );

      expect(assets).toEqual([
        {
          id: 5936,
          description: "",
          latitude: 1,
          longitude: 1,
          shape: null,
          filename: "20150119-113758-18467.wav",
          file: "https://prod.roundware.com/rwmedia/20150119-113758-18467.mp3",
          volume: 1,
          submitted: true,
          created: "2015-01-19T11:37:59",
          updated: "2015-01-19T11:37:59",
          weight: 50,
          start_time: 0,
          end_time: 7.407,
          user: null,
          media_type: "audio",
          audio_length_in_seconds: 7.41,
          tag_ids: [92],
          session_id: 18467,
          project_id: 10,
          language_id: 1,
          envelope_ids: [3392],
          description_loc_ids: [],
          alt_text_loc_ids: [],
        },
      ]);
    });

    describe(".loadAssetPool() must load assetPool", () => {
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

      it("if assetPool not loaded check and update it", async () => {
        expect(roundware.assetPool.assets).toEqual([]);
        const assets = await roundware.loadAssetPool();
        expect(roundware.assetPool.assets).toEqual(
          MOCK_ASSET_DATA.map(assetDecorationMapper(MOCK_TIMED_ASSET_DATA))
        );
        expect(assets).toEqual(MOCK_ASSET_DATA);
      });
    });
  });
});
