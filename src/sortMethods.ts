// see https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/SortMethod.swift

import { IAssetData } from "./types/asset";

/**
 Sort assets destructively, in random order.
 @note This is tricky to get right, uses a Fisher-Yates (aka Knuth) Shuffle. I copied this right out of Stack Overflow.
 @see https://stackoverflow.com/a/2450976/308448
 @see http://sedition.com/perl/javascript-fy.html
 */
export function sortRandomly(assetsArray: IAssetData[]) {
  if (Array.isArray(assetsArray))
    for (let i = assetsArray.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [assetsArray[i], assetsArray[rand]] = [assetsArray[rand], assetsArray[i]];
    }
}

/**
 Sort assets destructively, in descending order of assigned weight.
 */

export function sortByWeight(assetsArray: IAssetData[]) {
  if (Array.isArray(assetsArray))
    assetsArray.sort((assetA, assetB) => assetA.weight! - assetB.weight!);
}

/**
Sort assets destructively, in descending order of current number of likes.
@TODO Not implemented yet
*/
export function sortByLikes(assetsArray: IAssetData[]) {
  // eslint-disable-line no-unused-vars
  console.warn("sortByLikes not implemented yet");
  return assetsArray; // TODO: implement sortByLikes
}

export function sortByProjectDefault(
  ordering: string
): (assetArray: IAssetData[]) => void {
  switch (ordering) {
    case "by_weight":
      return sortByWeight;
    case "by_like":
      return sortByLikes;
    case "random":
    default:
      return sortRandomly;
  }
}

// swift code for 'sortByRanking':
//private var assetVotes: [Int: Int]? = nil

//func sortRanking(for asset: Asset, in playlist: Playlist) -> Double {
//if let votes = assetVotes?[asset.id] {
//return Double(-votes)
//} else {
//return 0.0
//}
//}

//func onRefreshAssets(in playlist: Playlist) -> Promise<Void> {
//let projectId = playlist.project.id
//return RWFramework.sharedInstance.apiGetVotesSummary(
//type: "like",
//projectId: projectId.description
//).then { data -> Void in
//let voteData = try JSON(data: data).array
//self.assetVotes = voteData?.reduce(into: [Int: Int]()) { acc, data in
//let assetId = data["asset_id"].int!
//let votes = data["asset_votes"].int!
//acc[assetId] = votes
//}
//}
//}
//}
