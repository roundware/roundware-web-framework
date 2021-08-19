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
      const apiClient = new ApiClient(config.baseServerUrl);
      expect(apiClient).toBeInstanceOf(ApiClient);
    });
  });

  describe("Functions", () => {
    const apiClient = new ApiClient(config.baseServerUrl);

    const mockInit = {
      headers: {},
      method: "GET",
      mode: "cors",
    };

    const mockPath = "/mock_path";
    const mockData = {
      test: "mock_data",
      id: 1234,
    };
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

    describe(".patch()", () => {
      it("should call fetch with given path", async () => {
        await apiClient.patch(mockPath, mockData);
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=PATCH",
          {
            body: JSON.stringify(mockData),
            headers: { "Content-Type": "application/json" },
            method: "PATCH",
            mode: "cors",
          }
        );
      });

      it("should return data after request", async () => {
        const response = await apiClient.patch(mockPath, {});
        expect(response).toEqual(MOCK_ASSET_DATA);
      });

      it("should throw error if failed", async () => {
        expect.assertions(1);
        global.fetch = jest.fn(() => {
          throw new Error();
        });
        try {
          await apiClient.patch(mockPath, {});
        } catch (e) {
          expect(e).toBeInstanceOf(RoundwareConnectionError);
        }
      });
    });

    describe(".send()", () => {
      it("should call fetch with given path", async () => {
        await apiClient.send(
          mockPath,
          {},
          {
            method: "GET",
          }
        );
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=GET",
          {
            headers: {},
            method: "GET",
            mode: "cors",
          }
        );
      });

      it("should pass query params correctly for GET request", async () => {
        await apiClient.send(mockPath, mockData, {
          method: "GET",
        });
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=GET&test=mock_data&id=1234",
          {
            headers: {},
            method: "GET",
            mode: "cors",
          }
        );
      });
      it("should pass body in correctly for POST request", async () => {
        await apiClient.send(mockPath, mockData, {
          method: "POST",
        });
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=POST",
          {
            body: JSON.stringify(mockData),
            headers: { "Content-Type": "application/json" },
            method: "POST",
            mode: "cors",
          }
        );
      });

      it("shoud use default {} if data not passed", async () => {
        await apiClient.send(mockPath, undefined, {
          method: "POST",
        });
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=POST",
          {
            body: JSON.stringify({}),
            headers: { "Content-Type": "application/json" },
            method: "POST",
            mode: "cors",
          }
        );
      });

      it("should work with multipart/form-data", async () => {
        await apiClient.send(mockPath, mockData, {
          method: "POST",
          contentType: "multipart/form-data",
        });
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=POST&contentType=multipart%2Fform-data",
          {
            body: "",
            headers: {},
            method: "POST",
            mode: "cors",
          }
        );
      });
      it("should pass body in correctly for PATCH request", async () => {
        await apiClient.send(mockPath, mockData, {
          method: "PATCH",
        });
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
          "https://prod.roundware.com/api/2/mock_path?method=PATCH",
          {
            body: JSON.stringify(mockData),
            headers: { "Content-Type": "application/json" },
            method: "PATCH",
            mode: "cors",
          }
        );
      });

      it("should return response after request", async () => {
        const response = await apiClient.send(mockPath, {}, {});
        expect(response).toEqual(MOCK_ASSET_DATA);
      });

      it("should throw error if failed", async () => {
        expect.assertions(1);
        global.fetch = jest.fn(() => {
          throw new Error();
        });
        try {
          await apiClient.send(mockPath, {}, {});
        } catch (e) {
          expect(e).toBeInstanceOf(RoundwareConnectionError);
        }
      });

      it("should throw error is response not ok", async () => {
        expect.assertions(1);
        global.fetch = jest.fn((): any => Promise.resolve({ ok: false }));
        try {
          await apiClient.send(mockPath, {}, {});
        } catch (e) {
          expect(e).toBeInstanceOf(RoundwareConnectionError);
        }
      });

      it("should throw error is response is not parsable", async () => {
        expect.assertions(1);
        global.fetch = jest.fn((): any =>
          Promise.resolve({ ok: true, json: () => Promise.reject() })
        );
        try {
          await apiClient.send(mockPath, {}, {});
        } catch (e) {
          expect(e).toBeInstanceOf(RoundwareConnectionError);
        }
      });
    });
  });
});
