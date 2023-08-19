import { AudioContext } from "standardized-audio-context-mock";
import { PlaylistAudiotrack } from "../../src/playlistAudioTrack";
import { MOCK_AUDIO_TRACKS_DATA } from "./mock_api_responses";
import { mockPlaylist } from "./playlist";
import { mockRoundware } from "./roundware";

const mockPlaylistAudiotrack = new PlaylistAudiotrack({
  audioContext: new AudioContext(),
  audioData: MOCK_AUDIO_TRACKS_DATA[0],
  playlist: mockPlaylist,
  client: mockRoundware,
});

export { mockPlaylistAudiotrack };
