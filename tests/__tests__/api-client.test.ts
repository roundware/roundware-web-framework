import { ApiClient } from "../../src/api-client";
import {
  InvalidArgumentError,
  RoundwareConnectionError,
} from "../../src/errors/app.errors";
import { getResponse, setupFetchMock } from "../fetch.setup";
import config from "../__mocks__/roundware.config";
import { MOCK_ASSET_DATA } from "../__mocks__/mock_api_responses";

describe("Api Client", () => {
  describe("Instantiation", () => {
    it("should throw error when baseServerUrl is not stirng", () => {
      // @ts-expect-error
      expect(() => new ApiClient(global.window)).toThrow(
        new InvalidArgumentError(
          "baseServerUrl",
          "string",
          "instantiating ApiClient"
        )
      );
    });

    it("should create a ApiClient instance", () => {
      const apiClient = new ApiClient(global.window, config.baseServerUrl);
      expect(apiClient).toBeInstanceOf(ApiClient);
    });
  });

  describe("Functions", () => {
    const apiClient = new ApiClient(global.window, config.baseServerUrl);

    const mockInit = {
      headers: {},
      method: "GET",
      mode: "cors",
    };

    const mockPath = "/mock_path";
    const getUrl = (path: string) => {
      const url = new URL(config.baseServerUrl + path);
      return url.toString();
    };

    beforeEach(() => setupFetchMock());

    describe(".get()", () => {
      it("should make get request to Roundware server", async () => {
        expect.assertions(2);
        const data = await apiClient.get(mockPath, {});
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          getUrl("/mock_path?method=GET&contentType=x-www-form-urlencoded"),
          mockInit
        );
      });

      it("should throw error for network error", async () => {
        global.fetch = jest.fn(() => {
          throw Error();
        });
        expect.assertions(1);
        try {
          await apiClient.get(mockPath, {});
        } catch (e) {
          expect(e).toBeInstanceOf(RoundwareConnectionError);
        }
      });

      it("should return data back from server", () => {
        return expect(apiClient.get(mockPath, {})).resolves.toEqual(
          MOCK_ASSET_DATA
        );
      });
    });

    describe(".post()", () => {
      it("should make a post request to server", async () => {
        await apiClient.post(mockPath, {
          data: "mock Data",
          id: 123,
        });
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=POST",
          {
            body: '{"data":"mock Data","id":123}',
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            mode: "cors",
          }
        );
      });

      it("should return data after request", async () => {
        const response = await apiClient.post(mockPath, {});
        expect(response).toEqual(MOCK_ASSET_DATA);
      });

      it("should throw error if failed", async () => {
        expect.assertions(1);
        global.fetch = jest.fn(() => {
          throw new Error();
        });
        try {
          await apiClient.post(mockPath, {});
        } catch (e) {
          expect(e).toBeInstanceOf(RoundwareConnectionError);
        }
      });
    });
  });
});
