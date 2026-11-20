// A track with tag filters (the audiotrack's tag_filters) plays only assets
// with at least one of its tags, out of what the listener's own filters
// allow (2026-11-20). These run the default filter chain, not a stand-in.
import { getRandomAssetData } from "../tests/__mocks__/assetData";
import { ASSET_PRIORITIES, stillWantedFilter, trackTagsFilter } from "./assetFilters";
import AssetPool, { assetDecorationMapper } from "./assetPool";
import { GeoListenMode } from "./mixer";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { IMixParams } from "./types";
import { coordsToPoints } from "./utils";

const HERE = { latitude: 42.36, longitude: -71.06 };
const STORIES = 1;
const BELLS = 2;
const NORTH = 3;

// In reach: at the listener's spot, inside the recording radius.
const LISTENING: IMixParams = {
  listenerPoint: coordsToPoints(HERE),
  geoListenMode: GeoListenMode.MANUAL,
  recordingRadius: 1000,
};

const assets = (...tagSets: number[][]) =>
  getRandomAssetData(tagSets.length).map((a, i) => ({
    ...a,
    id: i + 1,
    ...HERE,
    tag_ids: tagSets[i],
  }));

/** Only what nextForTrack and stillWanted read of a track. */
const track = (trackTagIds: number[] = [], trackId = 1) =>
  ({ trackId, mixParams: { trackTagIds }, trackOptions: {} } as unknown as PlaylistAudiotrack);

/** Every asset the track may play now, in no particular order. */
const playable = (pool: AssetPool, t: PlaylistAudiotrack, listenTagIds: number[]) => {
  const ids: number[] = [];
  for (;;) {
    const next = pool.nextForTrack(t, {
      elapsedSeconds: 0,
      filterOutAssets: pool.assets.filter((a) => ids.includes(a.id)),
      listenTagIds,
    });
    if (!next) return ids.sort();
    ids.push(next.id);
  }
};

describe("trackTagsFilter", () => {
  const asset = (tag_ids: number[]) =>
    assetDecorationMapper([])({ ...getRandomAssetData(1)[0], tag_ids });

  it("leaves a track without tags alone", () => {
    expect(trackTagsFilter()(asset([BELLS]), {})).toBe(ASSET_PRIORITIES.NEUTRAL);
    expect(trackTagsFilter()(asset([BELLS]), { trackTagIds: [] })).toBe(
      ASSET_PRIORITIES.NEUTRAL
    );
  });

  it("passes an asset with any one of the track's tags", () => {
    expect(trackTagsFilter()(asset([NORTH, BELLS]), { trackTagIds: [STORIES, BELLS] })).toBe(
      ASSET_PRIORITIES.NEUTRAL
    );
  });

  it("refuses an asset with none of them, or none at all", () => {
    expect(trackTagsFilter()(asset([NORTH]), { trackTagIds: [BELLS] })).toBe(
      ASSET_PRIORITIES.DISCARD
    );
    expect(trackTagsFilter()(asset([]), { trackTagIds: [BELLS] })).toBe(
      ASSET_PRIORITIES.DISCARD
    );
  });
});

describe("a track's tag filters in the default chain", () => {
  const pool = () =>
    new AssetPool({
      assets: assets([STORIES, NORTH], [BELLS, NORTH], [STORIES], [NORTH]),
      mixParams: LISTENING,
    });
  const everything = [STORIES, BELLS, NORTH];

  it("a track without filters plays all the listener chose", () => {
    expect(playable(pool(), track(), everything)).toEqual([1, 2, 3, 4]);
  });

  it("a filtered track plays only assets with its tags", () => {
    expect(playable(pool(), track([BELLS]), everything)).toEqual([2]);
    expect(playable(pool(), track([STORIES, BELLS]), everything)).toEqual([1, 2, 3]);
  });

  it("narrows what the listener chose, never widens it", () => {
    // Listener: North only. The Stories track gets North's stories, not
    // every story (they were merged once: a filtered track played more).
    expect(playable(pool(), track([STORIES]), [NORTH])).toEqual([1]);
  });

  it("goes silent when the listener's choice leaves it nothing", () => {
    const p = new AssetPool({ assets: assets([STORIES], [NORTH]), mixParams: LISTENING });
    expect(playable(p, track([BELLS]), everything)).toEqual([]);
  });

  it("leaves the pool's own settings as they were", () => {
    const p = new AssetPool({ assets: assets([BELLS]), mixParams: { ...LISTENING, listenTagIds: [9] } });
    playable(p, track([BELLS]), [BELLS]);
    expect(p.mixParams.listenTagIds).toEqual([9]);
    expect(p.mixParams.trackTagIds).toBeUndefined();
  });
});

describe("stillWanted: whether what's playing would still be chosen", () => {
  const p = () => new AssetPool({ assets: assets([STORIES, NORTH]), mixParams: LISTENING });

  it("yes, while nothing changed", () => {
    const pool = p();
    expect(pool.stillWanted(track([STORIES]), pool.assets[0], { listenTagIds: [NORTH] })).toBe(true);
  });

  it("no, once the listener unchooses its tags", () => {
    const pool = p();
    expect(pool.stillWanted(track(), pool.assets[0], { listenTagIds: [BELLS] })).toBe(false);
  });

  it("no, on a track whose tags it lacks", () => {
    const pool = p();
    expect(pool.stillWanted(track([BELLS]), pool.assets[0], { listenTagIds: [NORTH] })).toBe(false);
  });

  it("no, once the listener is out of reach", () => {
    const pool = p();
    const far = coordsToPoints({ latitude: 40.7, longitude: -74.0 });
    expect(
      pool.stillWanted(track(), pool.assets[0], { listenTagIds: [NORTH], listenerPoint: far })
    ).toBe(false);
  });

  it("no, once the date range leaves it out", () => {
    const pool = p();
    const future = new Date(Date.now() + 86_400_000);
    expect(
      pool.stillWanted(track(), pool.assets[0], {
        listenTagIds: [NORTH],
        startDate: future,
        endDate: new Date(future.getTime() + 86_400_000),
      })
    ).toBe(false);
  });

  it("yes, though it has been played: every playing asset has", () => {
    const pool = p();
    pool.assets[0].playCount = 1;
    expect(stillWantedFilter(pool.assets[0], { ...LISTENING, listenTagIds: [NORTH] })).not.toBe(
      ASSET_PRIORITIES.DISCARD
    );
  });
});
