import { assetDecorationMapper } from "../../src/assetPool";
import { Playlist } from "../../src/playlist";
import { PlaylistAudiotrack } from "../../src/playlistAudioTrack";
import { Roundware } from "../../src/roundware";
import {
  FadingInState,
  LoadingState,
  WaitingForAssetState,
} from "../../src/TrackStates";

import {
  MOCK_ASSET_DATA,
  MOCK_AUDIO_TRACKS_DATA,
  MOCK_TIMED_ASSET_DATA,
} from "../__mocks__/mock_api_responses";
describe("playlistAudioTrack", () => {
  const mockPlaylist = {
    next: jest.fn(
      () => MOCK_ASSET_DATA.map(assetDecorationMapper(MOCK_TIMED_ASSET_DATA))[0]
    ),
  };
  describe("Initialization", () => {
    test("should create an playlistAudioTrack instance", () => {
      const track = new PlaylistAudiotrack({
        // @ts-ignore
        windowScope: global,
        // @ts-ignore
        audioData: MOCK_AUDIO_TRACKS_DATA[0],
        // @ts-ignore
        playlist: mockPlaylist as Playlist,
      });

      expect(track).toBeInstanceOf(PlaylistAudiotrack);
    });
  });

  describe("Track States", () => {
    const track = new PlaylistAudiotrack({
      // @ts-ignore
      windowScope: global,
      // @ts-ignore
      audioData: MOCK_AUDIO_TRACKS_DATA[0],
      // @ts-ignore
      playlist: mockPlaylist as Playlist,
    });
    test("initial track state should be loading", () => {
      expect(track.state).toBeInstanceOf(LoadingState);
    });
    test("asset should be null", () => {
      expect(track.currentAsset).toBeNull();
    });

    test("asset should be loaded after play", () => {
      track.play();
      expect(track.playlist.next).toBeCalledTimes(1);
      expect(track.currentAsset).toEqual(
        MOCK_ASSET_DATA.map(assetDecorationMapper(MOCK_TIMED_ASSET_DATA))[0]
      );
    });

    // @ts-ignore
    global.setTimeout = jest.fn((callback: () => void, time: number) => {});

    test("should switch to FadingInState after play", () => {
      expect(track.state).toBeInstanceOf(FadingInState);
    });

    it("should set timer within in the fading range", () => {
      // @ts-ignore
      expect(setTimeout.mock.calls[0][1]).toBeGreaterThan(
        track.trackOptions.fadeInLowerBound
      );
      // @ts-ignore
      expect(setTimeout.mock.calls[0][1]).toBeLessThan(
        track.trackOptions.fadeInUpperBound
      );
    });
  });
});
