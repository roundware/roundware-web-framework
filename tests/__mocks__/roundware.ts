import { Roundware } from "../../src/roundware";
import config from "./roundware.config";
import { faker } from "@faker-js/faker";
import { IAssetFilters } from "../../src/types/asset";
export const mockRoundware = new Roundware({
  deviceId: "test",
  geoListenMode: 1,
  listenerLocation: {
    latitude: +faker.address.latitude(),
    longitude: +faker.address.longitude(),
  },
  projectId: 1,
  serverUrl: config.baseServerUrl,
  speakerConfig: {
    acceptableDelayMs: 100,
    length: 100,
    loop: true,
    prefetch: true,
    sync: true,
    syncCheckInterval: 100,
  },
  assetFilters: [] as IAssetFilters,
});
