import { LoadingState } from "../../src/TrackStates";
import { mockTrackOptions } from "../__mocks__/mixer/TrackOptions";
import { mockPlaylistAudiotrack } from "../__mocks__/playlistAudioTrack";
jest.mock("standardized-audio-context", () =>
  require("standardized-audio-context-mock")
);
describe("LoadingState", () => {
  test("should initialize", () => {
    const state = new LoadingState(mockPlaylistAudiotrack, mockTrackOptions);
    expect(state).toBeTruthy();
    expect(state.asset).toBeNull();
  });
});
