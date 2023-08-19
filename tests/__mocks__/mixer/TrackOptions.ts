import { TrackOptions } from "../../../src/mixer/TrackOptions";
import { MOCK_AUDIO_TRACKS_DATA } from "../mock_api_responses";

const mockTrackOptions = new TrackOptions(() => "", MOCK_AUDIO_TRACKS_DATA[0]);
export { mockTrackOptions };
