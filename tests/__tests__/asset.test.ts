import ApiClient from "../../src/api-client";
import { Asset, PATH } from "../../src/asset";
import {
  InvalidArgumentError,
  MissingArgumentError,
} from "../../src/errors/app.errors";
import { IAssetFilters } from "../../src/types/asset";
import { setupFetchMock } from "../fetch.setup";
import config from "../__mocks__/roundware.config";
jest.mock(`../../src/api-client`);
describe("Asset ", () => {
  test(`should instantiate with given projectId and apiClient`, () => {
    const apiClient = new ApiClient(config.baseServerUrl);
    const asset = new Asset(config.projectId, { apiClient });
    expect(asset).toBeInstanceOf(Asset);
    // @ts-ignore
    expect(asset._apiClient).toBeInstanceOf(ApiClient);
    // @ts-ignore
    expect(asset._projectId).toBe(config.projectId);
  }),
    test(`connect should call api client with projectId and filters`, async () => {
      const projectId = 10;
      const filters: IAssetFilters = {
        created__gte: "2019-08-15T18:06:39",
      };
      const mockApiClient = new ApiClient(config.baseServerUrl);
      const asset = new Asset(projectId, { apiClient: mockApiClient });
      await asset.connect(filters);
      expect(mockApiClient.get).toBeCalledWith(PATH, {
        ...filters,
        project_id: projectId,
      });
    });

  test(`should default filters to {}`, async () => {
    const projectId = 10;
    const mockApiClient = new ApiClient(config.baseServerUrl);
    const asset = new Asset(projectId, { apiClient: mockApiClient });
    await asset.connect();
    expect(mockApiClient.get).toBeCalledWith(PATH, {
      project_id: projectId,
    });
  });
});
