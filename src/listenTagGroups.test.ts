// The listener's tag filters, group by group: an asset needs one chosen tag
// in every Listen group (any within a group, all across groups), as the web
// app's map shows (2026-11-20). These run the default filter chain.
import { getRandomAssetData } from "../tests/__mocks__/assetData";
import { ASSET_PRIORITIES, anyTagsFilter } from "./assetFilters";
import AssetPool, { assetDecorationMapper } from "./assetPool";
import { GeoListenMode } from "./mixer";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { IMixParams } from "./types";
import { coordsToPoints } from "./utils";

const HERE = { latitude: 42.36, longitude: -71.06 };
// Kind of Sound
const STORIES = 1;
const MUSIC = 2;
// Neighborhood
const NORTH = 11;
const SOUTH = 12;
// Not a Listen group: metadata only (Contribution Type)
const ARTIST = 21;

const LISTENING: IMixParams = {
  listenerPoint: coordsToPoints(HERE),
  geoListenMode: GeoListenMode.MANUAL,
  recordingRadius: 1000,
};

const asset = (tag_ids: number[]) =>
  assetDecorationMapper([])({ ...getRandomAssetData(1)[0], tag_ids });

const rank = (tag_ids: number[], params: IMixParams) => anyTagsFilter()(asset(tag_ids), params);

describe("anyTagsFilter with the listener's groups", () => {
  const groups = { listenTagGroups: [[STORIES, MUSIC], [NORTH]] };

  it("passes an asset with a chosen tag in every group", () => {
    expect(rank([STORIES, NORTH], groups)).not.toBe(ASSET_PRIORITIES.DISCARD);
    expect(rank([MUSIC, NORTH, ARTIST], groups)).not.toBe(ASSET_PRIORITIES.DISCARD);
  });

  it("refuses one that misses a group, though it matches another", () => {
    // Choosing North now means North: a story from South doesn't play.
    expect(rank([STORIES, SOUTH], groups)).toBe(ASSET_PRIORITIES.DISCARD);
  });

  it("refuses one with no tag in a group's category at all", () => {
    expect(rank([STORIES], groups)).toBe(ASSET_PRIORITIES.DISCARD);
    expect(rank([], groups)).toBe(ASSET_PRIORITIES.DISCARD);
  });

  it("is no limit where no group has anything chosen", () => {
    expect(rank([], { listenTagGroups: [] })).toBe(ASSET_PRIORITIES.NEUTRAL);
    expect(rank([STORIES], { listenTagGroups: [[], [NORTH]] })).toBe(ASSET_PRIORITIES.DISCARD);
    expect(rank([NORTH], { listenTagGroups: [[], [NORTH]] })).not.toBe(ASSET_PRIORITIES.DISCARD);
  });

  it("takes the place of the flat list when given", () => {
    expect(
      rank([STORIES, SOUTH], { ...groups, listenTagIds: [STORIES, MUSIC, NORTH] })
    ).toBe(ASSET_PRIORITIES.DISCARD);
  });

  it("without groups, the flat list still means any one of them", () => {
    expect(rank([STORIES, SOUTH], { listenTagIds: [STORIES, NORTH] })).not.toBe(
      ASSET_PRIORITIES.DISCARD
    );
    expect(rank([SOUTH], { listenTagIds: [STORIES, NORTH] })).toBe(ASSET_PRIORITIES.DISCARD);
  });
});

describe("the listener's groups in the default chain", () => {
  const pool = () =>
    new AssetPool({
      assets: [
        [STORIES, NORTH],
        [STORIES, SOUTH],
        [MUSIC, NORTH, ARTIST],
        [MUSIC],
      ].map((tag_ids, i) => ({ ...getRandomAssetData(1)[0], id: i + 1, ...HERE, tag_ids })),
      mixParams: LISTENING,
    });
  const track = (trackTagIds: number[] = []) =>
    ({ trackId: 1, mixParams: { trackTagIds }, trackOptions: {} } as unknown as PlaylistAudiotrack);

  const playable = (p: AssetPool, t: PlaylistAudiotrack, listenTagGroups: number[][]) => {
    const ids: number[] = [];
    for (;;) {
      const next = p.nextForTrack(t, {
        elapsedSeconds: 0,
        filterOutAssets: p.assets.filter((a) => ids.includes(a.id)),
        listenTagGroups,
      });
      if (!next) return ids.sort();
      ids.push(next.id);
    }
  };

  it("everything chosen still needs a tag in each group", () => {
    // 4 has no neighborhood, so no Neighborhood tag is chosen for it.
    expect(playable(pool(), track(), [[STORIES, MUSIC], [NORTH, SOUTH]])).toEqual([1, 2, 3]);
  });

  it("North only: both kinds of sound, from North", () => {
    expect(playable(pool(), track(), [[STORIES, MUSIC], [NORTH]])).toEqual([1, 3]);
  });

  it("a track's own tags narrow it further, and can be metadata no group shows", () => {
    expect(playable(pool(), track([ARTIST]), [[STORIES, MUSIC], [NORTH]])).toEqual([3]);
  });

  it("what's playing stops being wanted when its group's tag is unchosen", () => {
    const p = pool();
    const story = p.assets.find((a) => a.id === 1)!;
    expect(p.stillWanted(track(), story, { listenTagGroups: [[STORIES], [NORTH]] })).toBe(true);
    expect(p.stillWanted(track(), story, { listenTagGroups: [[STORIES], [SOUTH]] })).toBe(false);
  });
});
