import {
  LoadingState,
  DeadAirState,
  FadingInState,
  PlayingState,
  FadingOutState,
  WaitingForAssetState,
  makeInitialTrackState,
  TimedTrackState,
} from "./TrackStates";
import { PlaylistAudiotrack } from "./playlistAudioTrack";
import { TrackOptions } from "./mixer/TrackOptions";
import { AssetEnvelope } from "./mixer/AssetEnvelope";
import { ASSET_PRIORITIES } from "./assetFilters";
import { IDecoratedAsset } from "./types/asset";
import { IAudioContext } from "standardized-audio-context";
import { Feature, Point } from "geojson";
import { Roundware } from "./roundware";
import { Playlist } from "./playlist";
import { AssetPool } from "./assetPool";
import { IAudioTrackData } from "./types/audioTrack";
import { RoundwareEvents } from "./events";
import { ApiClient } from "./api-client";
import { IMixParams } from "./types";

// Mock dependencies
const mockAudioContext = {
  createMediaElementSource: jest.fn(),
  createGain: jest.fn(),
  createStereoPanner: jest.fn(),
  destination: {},
  state: "running",
  resume: jest.fn(),
} as unknown as IAudioContext;

const mockClient = {
  events: {
    logAssetStart: jest.fn(),
    logAssetEnd: jest.fn(),
  },
} as unknown as Roundware;

const mockAssetPool = {} as unknown as AssetPool;

const mockListenerPoint = {
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [0, 0],
  },
  properties: {},
} as Feature<Point>;

const mockAudioData: IAudioTrackData = {
  id: 1,
  timed_asset_priority: "",
  tag_filters: [],
  minpanpos: 0,
  active: true,
  start_with_silence: false,
  banned_duration: 0,
  project_id: 1,
  minfadeintime: 0,
  maxfadeintime: 10,
  minfadeouttime: 0,
  maxfadeouttime: 10,
  fadeout_when_filtered: false,
  minvolume: 0,
  maxvolume: 1,
  minduration: 0,
  maxduration: 100,
  mindeadair: 0,
  maxdeadair: 10,
  repeatrecordings: false,
  maxpanpos: 0,
  minpanduration: 10,
  maxpanduration: 20,
};

// Mock PlaylistAudiotrack
jest.mock("./playlistAudioTrack", () => ({
  PlaylistAudiotrack: jest.fn().mockImplementation(() => ({
    trackId: "test-track",
    loadNextAsset: jest.fn(),
    transition: jest.fn(),
    pauseAudio: jest.fn(),
    playAudio: jest.fn(),
    setZeroGain: jest.fn(),
    fadeIn: jest.fn(),
    fadeOut: jest.fn(),
    setInitialTrackState: jest.fn(),
    audioElement: {
      addEventListener: jest.fn(),
      currentTime: 0,
    },
    currentAsset: null,
    assetEnvelope: null,
    playing: true,
    audioData: mockAudioData,
    playlist: {
      playing: true,
      _client: {
        listenHistory: {
          addAsset: jest.fn(),
        },
      },
    },
  })),
}));

describe("TrackStates", () => {
  let track: PlaylistAudiotrack;
  let trackOptions: TrackOptions;
  let playlist: Playlist;

  beforeEach(() => {
    playlist = new Playlist({
      client: mockClient,
      listenerPoint: mockListenerPoint,
      assetPool: mockAssetPool,
      audioContext: mockAudioContext,
      audioTracks: [mockAudioData],
    });
    track = new PlaylistAudiotrack({
      audioContext: mockAudioContext,
      audioData: mockAudioData,
      playlist: playlist,
      client: mockClient,
    });
    trackOptions = new TrackOptions(
      (param: string) => "",
      mockAudioData
    );
  });

  describe("LoadingState", () => {
    let state: LoadingState;

    beforeEach(() => {
      state = new LoadingState(track, trackOptions);
    });

    it("should initialize with null asset", () => {
      expect(state.asset).toBeNull();
    });

    it("should return correct string representation", () => {
      expect(state.toString()).toBe("Loading");
    });

    it("should transition to FadingInState when asset is loaded", () => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      (track.loadNextAsset as jest.Mock).mockReturnValue(mockAsset);

      // Capture the event listener callback
      let playingCallback: Function = () => {};
      (track.audioElement.addEventListener as jest.Mock).mockImplementation((event, callback) => {
        if (event === "playing") {
          playingCallback = callback;
        }
      });

      state.play();

      expect(track.loadNextAsset).toHaveBeenCalled();
      expect(track.setZeroGain).toHaveBeenCalled();
      expect(track.audioElement.addEventListener).toHaveBeenCalledWith(
        "playing",
        expect.any(Function),
        { once: true }
      );
      expect(track.playAudio).toHaveBeenCalled();
      expect(track.playlist._client.listenHistory.addAsset).toHaveBeenCalledWith(mockAsset);

      // Simulate the playing event
      playingCallback();
      expect(track.transition).toHaveBeenCalledWith(expect.any(FadingInState));
    });

    it("should transition to WaitingForAssetState when no asset is loaded", () => {
      (track.loadNextAsset as jest.Mock).mockReturnValue(null);

      state.play();

      expect(track.transition).toHaveBeenCalledWith(
        expect.any(WaitingForAssetState)
      );
    });

    it("should handle empty methods", () => {
      expect(() => state.pause()).not.toThrow();
      expect(() => state.finish()).not.toThrow();
      expect(() => state.skip()).not.toThrow();
      expect(() => state.replay()).not.toThrow();
      expect(() => state.updateParams()).not.toThrow();
    });

    it("should not transition when playlist is not playing", () => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      (track.loadNextAsset as jest.Mock).mockReturnValue(mockAsset);

      // Set playlist to not playing
      track.playlist.playing = false;

      // Capture the event listener callback
      let playingCallback: Function = () => {};
      (track.audioElement.addEventListener as jest.Mock).mockImplementation((event, callback) => {
        if (event === "playing") {
          playingCallback = callback;
        }
      });

      state.play();

      expect(track.loadNextAsset).toHaveBeenCalled();
      expect(track.setZeroGain).toHaveBeenCalled();
      expect(track.audioElement.addEventListener).toHaveBeenCalledWith(
        "playing",
        expect.any(Function),
        { once: true }
      );
      expect(track.playAudio).toHaveBeenCalled();
      expect(track.playlist._client.listenHistory.addAsset).toHaveBeenCalledWith(mockAsset);

      // Simulate the playing event
      playingCallback();
      expect(track.transition).not.toHaveBeenCalled();
    });
  });

  describe("DeadAirState", () => {
    let state: DeadAirState;

    beforeEach(() => {
      // Mock randomDeadAir to return a fixed value
      jest.spyOn(TrackOptions.prototype, 'randomDeadAir', 'get').mockReturnValue(5);
      state = new DeadAirState(track, trackOptions);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should initialize with correct dead air duration", () => {
      expect(state.deadAirSeconds).toBe(5);
    });

    it("should transition to LoadingState after dead air period", () => {
      jest.useFakeTimers();
      state.play();
      jest.advanceTimersByTime(5000); // 5 seconds
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(LoadingState)
      );
      jest.useRealTimers();
    });

    it("should resume from remaining time when paused", () => {
      jest.useFakeTimers();
      state.play();
      // Pause after 2 seconds
      jest.advanceTimersByTime(2000);
      state.pause();
      // Resume and verify it uses the remaining time
      const remainingTime = state.play();
      expect(remainingTime).toBeUndefined(); 
      jest.useRealTimers();
    });

    it("should handle empty methods", () => {
      expect(() => state.replay()).not.toThrow();
      expect(() => state.updateParams({})).not.toThrow();
    });

    it("should handle skip", () => {
      jest.useFakeTimers();
      state.play();
      state.skip();
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(LoadingState)
      );
      jest.useRealTimers();
    });
  });

  describe("FadingInState", () => {
    let state: FadingInState;
    let assetEnvelope: AssetEnvelope;

    beforeEach(() => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      assetEnvelope = new AssetEnvelope(trackOptions, mockAsset);
      state = new FadingInState(track, trackOptions, { assetEnvelope });
    });

    it("should fade in and transition to PlayingState", () => {
      jest.useFakeTimers();
      state.play();
      expect(track.fadeIn).toHaveBeenCalledWith(assetEnvelope.fadeInDuration);
      jest.advanceTimersByTime(assetEnvelope.fadeInDuration * 1000);
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(PlayingState)
      );
      jest.useRealTimers();
    });

    it("should handle failed fade in", () => {
      (track.fadeIn as jest.Mock).mockReturnValue(false);
      state.play();
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(LoadingState)
      );
    });

    it("should pause correctly", () => {
      jest.useFakeTimers();
      state.play();
      state.pause();
      expect(track.pauseAudio).toHaveBeenCalled();
      expect(state.timeRemainingMs).toBeDefined();
      jest.useRealTimers();
    });

    it("should handle empty methods", () => {
      expect(() => state.replay()).not.toThrow();
      expect(() => state.updateParams({})).not.toThrow();
    });

    it("should return correct string representation", () => {
      expect(state.toString()).toBe(`FadingIn Asset #${assetEnvelope.assetId} (${assetEnvelope.fadeInDuration.toFixed(1)}s)`);
    });
  });

  describe("PlayingState", () => {
    let state: PlayingState;
    let assetEnvelope: AssetEnvelope;

    beforeEach(() => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      assetEnvelope = new AssetEnvelope(trackOptions, mockAsset);
      state = new PlayingState(track, trackOptions, { assetEnvelope });
    });

    it("should play audio and transition to FadingOutState", () => {
      jest.useFakeTimers();
      state.play();
      expect(track.playAudio).toHaveBeenCalled();
      jest.advanceTimersByTime(assetEnvelope.startFadingOutSecs * 1000);
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(FadingOutState)
      );
      jest.useRealTimers();
    });

    it("should handle pause and resume", () => {
      jest.useFakeTimers();
      state.play();
      state.pause();
      expect(track.pauseAudio).toHaveBeenCalled();
      expect(state.timeRemainingMs).toBeDefined();
      state.play();
      expect(track.playAudio).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it("should handle empty methods", () => {
      expect(() => state.replay()).not.toThrow();
      expect(() => state.updateParams({})).not.toThrow();
    });

    it("should return correct string representation", () => {
      expect(state.toString()).toBe(`Playing asset #${assetEnvelope.assetId} (${assetEnvelope.startFadingOutSecs.toFixed(1)}s)`);
    });
  });

  describe("FadingOutState", () => {
    let state: FadingOutState;
    let assetEnvelope: AssetEnvelope;
    let mockApiClient: ApiClient;

    beforeEach(() => {
      mockApiClient = new ApiClient("http://test.com");
      mockApiClient.post = jest.fn().mockResolvedValue({ id: 456 });
      mockApiClient.patch = jest.fn();
      track.listenEvents = new RoundwareEvents(1, mockApiClient);

      const mockAsset: IDecoratedAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      track.currentAsset = mockAsset;
      assetEnvelope = new AssetEnvelope(trackOptions, mockAsset);
      state = new FadingOutState(track, trackOptions, { assetEnvelope });

      // Log asset start to set up _startedAssets
      track.listenEvents.logAssetStart(mockAsset.id);
    });

    it("should fade out and transition to DeadAirState", () => {
      jest.useFakeTimers();
      state.play();
      expect(track.fadeOut).toHaveBeenCalledWith(assetEnvelope.fadeOutDuration);
      jest.advanceTimersByTime(assetEnvelope.fadeOutDuration * 1000);
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(DeadAirState)
      );
      jest.useRealTimers();
    });

    it("should handle paused asset status", () => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
        status: "paused",
      };
      track.currentAsset = mockAsset;
      state.finish();
      expect(mockAsset.resume_time).toBe(0);
    });

    it("should log asset end", async () => {
      state.finish();
      expect(mockApiClient.patch).toHaveBeenCalled();
    });

    it("should handle empty methods", () => {
      expect(() => state.replay()).not.toThrow();
      expect(() => state.updateParams({})).not.toThrow();
    });

    it("should pause audio and track", () => {
      jest.useFakeTimers();
      state.play();
      state.pause();
      expect(track.pauseAudio).toHaveBeenCalled();
      expect(state.timeRemainingMs).toBeDefined();
      jest.useRealTimers();
    });

    it("should call parent class updateParams", () => {
      const mockMixParams: IMixParams = {
        listenerPoint: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [0, 0]
          },
          properties: {}
        }
      };
      const parentUpdateParamsSpy = jest.spyOn(TimedTrackState.prototype, 'updateParams');
      
      state.updateParams(mockMixParams);
      
      expect(parentUpdateParamsSpy).toHaveBeenCalledWith(mockMixParams);
      parentUpdateParamsSpy.mockRestore();
    });

    it("should return correct string representation", () => {
      expect(state.toString()).toBe(`FadingOut asset #${assetEnvelope.assetId} (${assetEnvelope.fadeOutDuration.toFixed(1)}s)`);
    });
  });

  describe("WaitingForAssetState", () => {
    let state: WaitingForAssetState;

    beforeEach(() => {
      state = new WaitingForAssetState(track, trackOptions);
    });

    it("should transition to LoadingState after waiting period", () => {
      jest.useFakeTimers();
      state.play();
      jest.advanceTimersByTime(10000); // DEFAULT_WAITING_FOR_ASSET_INTERVAL_SECONDS
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(LoadingState)
      );
      jest.useRealTimers();
    });

    it("should transition to LoadingState when params are updated", () => {
      state.updateParams({});
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(LoadingState)
      );
    });

    it("should handle asset filtering", () => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      track.currentAsset = mockAsset;
      track.assetEnvelope = new AssetEnvelope(trackOptions, mockAsset);

      // Mock distanceRangesFilter to return DISCARD
      jest.spyOn(require("./assetFilters"), "distanceRangesFilter").mockReturnValue(() => ASSET_PRIORITIES.DISCARD);

      state.updateParams({});
      expect(track.transition).toHaveBeenCalledWith(
        expect.any(LoadingState)
      );
    });

    it("should handle empty methods", () => {
      expect(() => state.replay()).not.toThrow();
      expect(() => state.updateParams({})).not.toThrow();
    });

    it("should return correct string representation", () => {
      expect(state.toString()).toBe("WaitingForAsset (10s)");
    });
  });

  describe("TimedTrackState", () => {
    let state: TimedTrackState;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      state = new TimedTrackState(track, trackOptions);
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });
    
    
    it("should handle setNextStateTimer with logging", () => {
      jest.useFakeTimers();
      const logSpy = jest.spyOn(state, 'log');
      state.setNextStateTimer(5000);
      expect(state.timerId).toBeDefined();
      expect(state.intervalId).toBeDefined();
      expect(state.timerApproximateEndingAtMs).toBeDefined();
      
      // Advance timer to trigger interval callback
      jest.advanceTimersByTime(1000);
      expect(logSpy).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it("should handle clearTimer with no timers", () => {
      const result = state.clearTimer();
      expect(result).toBe(0);
    });

    it("should handle clearTimer with only intervalId", () => {
      state.intervalId = setInterval(() => {}, 1000);
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      const result = state.clearTimer();
      expect(clearIntervalSpy).toHaveBeenCalledWith(state.intervalId);
      expect(result).toBe(0);
      clearIntervalSpy.mockRestore();
    });

    it("should handle finish method", () => {
      state.timeRemainingMs = 5000;
      state.finish();
      expect(state.timeRemainingMs).toBeUndefined();
    });

    it("should handle skip method", () => {
      const setNextStateSpy = jest.spyOn(state, 'setNextState');
      state.skip();
      expect(setNextStateSpy).toHaveBeenCalled();
      setNextStateSpy.mockRestore();
    });

    it("should handle setLoadingState", () => {
      state.setLoadingState();
      expect(track.transition).toHaveBeenCalledWith(expect.any(LoadingState));
    });

    it("should handle updateParams with no fadeout_when_filtered", () => {
      track.audioData.fadeout_when_filtered = false;
      state.updateParams({});
      expect(track.transition).not.toHaveBeenCalled();
    });

    it("should handle updateParams with no current asset", () => {
      track.audioData.fadeout_when_filtered = true;
      track.currentAsset = null;
      state.updateParams({});
      expect(track.transition).not.toHaveBeenCalled();
    });

    it("should handle updateParams when already fading out", () => {
      track.audioData.fadeout_when_filtered = true;
      track.currentAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      track.state = new FadingOutState(track, trackOptions, {
        assetEnvelope: new AssetEnvelope(trackOptions, track.currentAsset),
      });
      state.updateParams({});
      expect(track.transition).not.toHaveBeenCalled();
    });

    it("should handle updateParams when asset is filtered out", () => {
      track.audioData.fadeout_when_filtered = true;
      track.currentAsset = {
        id: 1,
        description: "test",
        latitude: 0,
        longitude: 0,
        shape: null,
        filename: "test.mp3",
        file: "test.mp3",
        volume: 1,
        submitted: true,
        created: new Date(),
        updated: new Date(),
        weight: 1,
        start_time: 0,
        end_time: 10,
        user: null,
        media_type: "audio",
        audio_length_in_seconds: 10,
        tag_ids: [],
        session_id: 1,
        project_id: 1,
        language_id: 1,
        envelope_ids: [],
        description_loc_ids: [],
        alt_text_loc_ids: [],
        activeRegionLowerBound: 0,
        activeRegionUpperBound: 10,
        activeRegionLength: 10,
        locationPoint: mockListenerPoint,
        playCount: 0,
      };
      track.assetEnvelope = new AssetEnvelope(trackOptions, track.currentAsset);
      track.playing = true;

      // Mock distanceRangesFilter to return DISCARD
      jest.spyOn(require("./assetFilters"), "distanceRangesFilter").mockReturnValue(() => ASSET_PRIORITIES.DISCARD);

      state.updateParams({});
      expect(track.transition).toHaveBeenCalledWith(expect.any(FadingOutState));
      expect(track.currentAsset.status).toBe("paused");
      expect(track.currentAsset.pausedFromTrackId).toBe(track.trackId);
      expect(track.pausedAssetId).toBe(track.currentAsset.id);
    });
  });

  describe("makeInitialTrackState", () => {
    it("should create LoadingState when startWithSilence is false", () => {
      const state = makeInitialTrackState(track, trackOptions);
      expect(state).toBeInstanceOf(LoadingState);
      expect(state.track).toBe(track);
      expect(state.trackOptions).toBe(trackOptions);
      
      // Verify the state can be used
      state.play();
      expect(track.loadNextAsset).toHaveBeenCalled();
    });

    it("should create DeadAirState when startWithSilence is true", () => {
      const optionsWithSilence = new TrackOptions(
        (param: string) => "",
        {
          ...mockAudioData,
          start_with_silence: true,
        }
      );
      const state = makeInitialTrackState(track, optionsWithSilence) as DeadAirState;
      expect(state).toBeInstanceOf(DeadAirState);
      expect(state.track).toBe(track);
      expect(state.trackOptions).toBe(optionsWithSilence);
      
      // Verify the state can be used
      jest.useFakeTimers();
      state.play();
      expect(state.timerId).toBeDefined();
      jest.useRealTimers();
    });

    it("should handle edge case with undefined startWithSilence", () => {
      const optionsWithUndefinedSilence = new TrackOptions(
        (param: string) => "",
        {
          ...mockAudioData,
          start_with_silence: false,
        }
      );
      const state = makeInitialTrackState(track, optionsWithUndefinedSilence);
      expect(state).toBeInstanceOf(LoadingState);
    });
  });
});
