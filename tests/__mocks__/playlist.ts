import { AudioContext } from "standardized-audio-context-mock";
import { Playlist } from "../../src/playlist";
import { coordsToPoints } from "../../src/utils";
import { mockAssetPool } from "./assetPool";
import { mockRoundware } from "./roundware";
import { faker } from "@faker-js/faker";
const mockPlaylist = new Playlist({
  client: mockRoundware,
  assetPool: mockAssetPool,
  audioContext: new AudioContext(),
  listenerPoint: coordsToPoints({
    latitude: +faker.address.latitude(),
    longitude: +faker.address.longitude(),
  }),
});

export { mockPlaylist };
