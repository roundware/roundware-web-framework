import { AssetPool } from "../../src/assetPool";
import { MOCK_ASSET_DATA } from "./mock_api_responses";
const mockAssetPool = new AssetPool({
  assets: MOCK_ASSET_DATA,
  filterChain: undefined,
  sortMethods: undefined,
  mixParams: undefined,
});
export { mockAssetPool };
