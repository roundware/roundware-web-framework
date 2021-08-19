import { assetDecorationMapper } from "../../src/assetPool";

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

    const onPlayAssetsCallback = jest.fn();

    it(".onPlayAssets() - should set the callback and return currently playing assets", () => {
      roundware.onPlayAssets = onPlayAssetsCallback;
      expect(onPlayAssetsCallback).toBeCalledTimes(1);
      expect(onPlayAssetsCallback).toHaveBeenLastCalledWith(
        roundware.currentlyPlayingAssets
      );
    });

    it(".triggerOnPlayAsset() - should trigger callback call when onPlayAssets set", () => {
      roundware.triggerOnPlayAssets();
      expect(onPlayAssetsCallback).toBeCalledTimes(2);
      expect(onPlayAssetsCallback).toHaveBeenLastCalledWith(
        roundware.currentlyPlayingAssets
      );
      roundware.triggerOnPlayAssets();
      expect(onPlayAssetsCallback).toBeCalledTimes(3);
      expect(onPlayAssetsCallback).toHaveBeenLastCalledWith(
        roundware.currentlyPlayingAssets
      );
    });

    it(".currentlyPlayingAssets should return currently playing assets or warn", async () => {
      jest.spyOn(console, "warn").mockImplementation(() => {});

      let cpa = roundware.currentlyPlayingAssets;

      expect(cpa).toBeUndefined();
      expect(console.warn).toHaveBeenLastCalledWith(
        `Cannot get currently playing assets. roundware.mixer is not activated yet!`
      );
      // await roundware.activateMixer();
      // cpa = roundware.currentlyPlayingAssets;
      // expect(cpa).not.toBeUndefined();
    });

    it("getAssets() return already existing assets when no filter passed", async () => {
      const assets = await roundware.getAssets();
      expect(assets).toEqual(roundware.assetData);
    });

    it("getAssets() fetch assets from filter", async () => {
      const assets = await roundware.getAssets({
        latitude: 42.4986343383789,
      });
      expect(assets).toEqual(
        MOCK_ASSET_DATA.filter((asset) => asset.latitude === 42.4986343383789)
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

      it("fetches latest assets when called first time", async () => {
        expect(roundware.assetData).toBeNull();
        await roundware.loadAssetPool();
        expect(roundware.assetData).toEqual(MOCK_ASSET_DATA);
      });

      it("fetches latest timed assets when called first time", async () => {
        expect(roundware.timedAssetData).toBeNull();
        await roundware.loadAssetPool();
        expect(roundware.timedAssetData).toEqual(MOCK_TIMED_ASSET_DATA);
      });

      it("loads asset pool with decorated assets", async () => {
        expect(roundware.assetPool.assets).toEqual([]);
        await roundware.loadAssetPool();

        expect(roundware.assetPool.assets).toEqual(
          MOCK_ASSET_DATA.map(assetDecorationMapper(MOCK_TIMED_ASSET_DATA))
        );
      });

      it("sets _assetDataTimer after first call", async () => {
        // @ts-ignore - checking private property
        expect(roundware._assetDataTimer).toBeUndefined();
        global.setInterval = jest.fn();
        await roundware.loadAssetPool();
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenLastCalledWith(
          roundware.updateAssetPool,
          // @ts-ignore
          roundware._assetUpdateInterval
        );
      });

      it("setInternal not called second time", async () => {
        // @ts-ignore - checking private property
        expect(roundware._assetDataTimer).toBeUndefined();
        // @ts-ignore
        global.setInterval = jest.fn(
          (callback: Function, ms: number, ...args) => "NodeJSTIMERMOCK"
        );

        await roundware.loadAssetPool();

        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenLastCalledWith(
          roundware.updateAssetPool,
          // @ts-ignore
          roundware._assetUpdateInterval
        );

        expect(roundware._assetDataTimer).toEqual("NodeJSTIMERMOCK");

        // do not call second time
        await roundware.loadAssetPool();
        expect(setInterval).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(roundware._assetDataTimer).toEqual("NodeJSTIMERMOCK");
      });
    });
  });
});
