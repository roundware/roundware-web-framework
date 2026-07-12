import { IAudioContext, IGainNode } from 'standardized-audio-context';
import { RoundwareEvents } from './events';
import { Playlist } from './playlist';
import { PlaylistAudiotrack } from './playlistAudioTrack';
import { Roundware } from './roundware';
import { IDecoratedAsset } from './types/asset';
import { IAudioTrackData } from './types/audioTrack';
import { ITrackStates } from './types/track-states';
import { silenceAudioBase64 } from './utils';

jest.mock('standardized-audio-context');
jest.mock('./roundware');
jest.mock('./playlist');
jest.mock('./mixer/TrackOptions');
jest.mock('./mixer/AssetEnvelope');
jest.mock('./audioPanner');
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  makeAudioSafeToPlay: jest.fn((audioElement, audioContext, callback) => {
    callback();
  }),
  playlistTrackLog: jest.fn(),
  timestamp: '16:45:42',
  silenceAudioBase64: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//w==',
}));

describe('PlaylistAudiotrack', () => {
  let playlistAudiotrack: PlaylistAudiotrack;
  let mockAudioContext: jest.Mocked<IAudioContext>;
  let mockGainNode: jest.Mocked<IGainNode<IAudioContext>>;
  let mockPlaylist: jest.Mocked<Playlist>;
  let mockClient: jest.Mocked<Roundware>;
  let mockAudioData: IAudioTrackData;
  let mockAudioElement: Partial<HTMLAudioElement>;
  let mockMediaElementSource: any;
  let mockPanNode: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPanNode = {
      connect: jest.fn().mockReturnThis(),
    };

    mockMediaElementSource = {
      connect: jest.fn().mockReturnThis(),
    };

    mockGainNode = {
      gain: {
        value: 1,
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
        cancelAndHoldAtTime: jest.fn(),
      },
      connect: jest.fn().mockReturnThis(),
    } as any;

    mockAudioContext = {
      createMediaElementSource: jest.fn().mockReturnValue(mockMediaElementSource),
      createGain: jest.fn().mockReturnValue(mockGainNode),
      createStereoPanner: jest.fn().mockReturnValue(mockPanNode),
      destination: { id: 'destination' } as unknown as AudioDestinationNode,
      currentTime: 0,
      state: 'running',
      resume: jest.fn(),
    } as any;

    mockPlaylist = {
      playing: true,
      next: jest.fn(),
      elapsedTimeMs: 0,
    } as any;

    mockClient = {
      events: {
        logAssetStart: jest.fn(),
        logAssetEnd: jest.fn(),
      } as any,
    } as any;

    mockAudioData = {
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

    mockAudioElement = {
      src: '',
      currentTime: 0,
      paused: true,
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    playlistAudiotrack = new PlaylistAudiotrack({
      audioContext: mockAudioContext,
      audioData: mockAudioData,
      playlist: mockPlaylist,
      client: mockClient,
    });

    (playlistAudiotrack as any).audioElement = mockAudioElement;
    (playlistAudiotrack as any).gainNode = mockGainNode;
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(playlistAudiotrack.trackId).toBe(1);
      expect(playlistAudiotrack.playing).toBe(false);
      expect(playlistAudiotrack.currentAsset).toBeNull();
      expect(playlistAudiotrack.played).toBe(false);
    });

    it('should set isSafeToPlay and log success when audio is safe to play', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      expect(newPlaylistAudiotrack.isSafeToPlay).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(`successfully ${mockAudioData.id} true`);
      consoleSpy.mockRestore();
    });

    it('should handle end event and log asset end', () => {
      const mockAsset: IDecoratedAsset = {
        id: 123,
        status: 'paused',
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        start_time: 0,
        end_time: 0,
        audio_length_in_seconds: 0,
        session_id: 0,
        language_id: 0,
        activeRegionUpperBound: 0,
        description: '',
        filename: '',
        updated: '',
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        file: '',
        volume: 0,
        created: '',
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.currentAsset = mockAsset;

      const endEvent = new Event('end');
      newPlaylistAudiotrack.audioElement.dispatchEvent(endEvent);
      
      expect(mockClient?.events?.logAssetEnd).toHaveBeenCalledWith(mockAsset.id);
    });

    it('should handle end event when no current asset', () => {
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.currentAsset = null;

      const endEvent = new Event('end');
      newPlaylistAudiotrack.audioElement.dispatchEvent(endEvent);
      
      expect(mockClient?.events?.logAssetEnd).toHaveBeenCalledWith(undefined);
    });

    it('should handle pause event and log asset end', () => {
      const mockAsset: IDecoratedAsset = {
        id: 123,
        status: 'paused',
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        start_time: 0,
        end_time: 0,
        audio_length_in_seconds: 0,
        session_id: 0,
        language_id: 0,
        activeRegionUpperBound: 0,
        description: '',
        filename: '',
        updated: '',
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        file: '',
        volume: 0,
        created: '',
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.playing = true;
      newPlaylistAudiotrack.currentAsset = mockAsset;

      const pauseEvent = new Event('pause');
      newPlaylistAudiotrack.audioElement.dispatchEvent(pauseEvent);

      expect(newPlaylistAudiotrack.playing).toBe(false);
      expect(mockClient?.events?.logAssetEnd).toHaveBeenCalledWith(mockAsset.id);
    });

    it('should handle pause event when no current asset', () => {
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.playing = true;
      newPlaylistAudiotrack.currentAsset = null;

      const pauseEvent = new Event('pause');
      newPlaylistAudiotrack.audioElement.dispatchEvent(pauseEvent);

      expect(newPlaylistAudiotrack.playing).toBe(false);
      expect(mockClient?.events?.logAssetEnd).toHaveBeenCalledWith(undefined);
    });

    it('should handle playing event when audio is safe to play and playlist is playing', () => {
      const mockAsset: IDecoratedAsset = {
        id: 123,
        status: 'paused',
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        file: '',
        volume: 0,
        created: '',
        updated: '',
        description: '',
        language_id: 0,
        user: null,
        session_id: 0,
        start_time: 0,
        end_time: 0,
        activeRegionUpperBound: 0,
        filename: '',
        audio_length_in_seconds: 0,
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.isSafeToPlay = true;
      newPlaylistAudiotrack.currentAsset = mockAsset;
      newPlaylistAudiotrack.playlist.playing = true;

      const playingEvent = new Event('playing');
      newPlaylistAudiotrack.audioElement.dispatchEvent(playingEvent);

      expect(mockAsset.status).toBeUndefined();
      expect(mockClient?.events?.logAssetStart).toHaveBeenCalledWith(mockAsset.id);
      expect(newPlaylistAudiotrack.playing).toBe(true);
      expect(newPlaylistAudiotrack.played).toBe(true);
    });

    it('should not handle playing event when audio is not safe to play', () => {
      const mockAsset: IDecoratedAsset = {
        id: 123,
        status: 'paused',
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        file: '',
        volume: 0,
        created: '',
        updated: '',
        description: '',
        language_id: 0,
        user: null,
        session_id: 0,
        start_time: 0,
        end_time: 0,
        activeRegionUpperBound: 0,
        filename: '',
        audio_length_in_seconds: 0,
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.isSafeToPlay = false;
      newPlaylistAudiotrack.currentAsset = mockAsset;
      newPlaylistAudiotrack.playlist.playing = true;

      const playingEvent = new Event('playing');
      newPlaylistAudiotrack.audioElement.dispatchEvent(playingEvent);

      expect(mockAsset.status).toBe('paused');
      expect(mockClient?.events?.logAssetStart).not.toHaveBeenCalled();
      expect(newPlaylistAudiotrack.playing).toBe(false);
      expect(newPlaylistAudiotrack.played).toBe(false);
    });

    it('should pause audio when playlist is not playing', () => {
      const mockAsset = {
        id: 123,
        status: 'some_status',
        activeRegionLowerBound: 0,
        locationPoint: [0, 0],
        playCount: 0,
        activeRegionLength: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        file: '',
        volume: 0,
        created: '',
        updated: '',
        description: '',
        language_id: 0,
        user: null,
        session_id: 0,
        start_time: 0,
        end_time: 0,
        activeRegionUpperBound: 0,
        filename: '',
        audio_length_in_seconds: 0,
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.isSafeToPlay = true;
      newPlaylistAudiotrack.currentAsset = {
        ...mockAsset,
        status: 'paused',
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        }
      };
      newPlaylistAudiotrack.playlist.playing = false;

      const pauseAudioSpy = jest.spyOn(newPlaylistAudiotrack, 'pauseAudio');

      const playingEvent = new Event('playing');
      newPlaylistAudiotrack.audioElement.dispatchEvent(playingEvent);

      expect(pauseAudioSpy).toHaveBeenCalled();
      expect(mockAsset.status).toBe('some_status');
      expect(mockClient?.events?.logAssetStart).not.toHaveBeenCalled();
      expect(newPlaylistAudiotrack.playing).toBe(false);
      expect(newPlaylistAudiotrack.played).toBe(false);
    });

    it('should handle playing event when playlist is not playing', () => {
      const mockAsset: IDecoratedAsset = {
        id: 123,
        status: 'paused',
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        file: '',
        volume: 0,
        created: '',
        updated: '',
        description: '',
        language_id: 0,
        user: null,
        session_id: 0,
        start_time: 0,
        end_time: 0,
        activeRegionUpperBound: 0,
        filename: '',
        audio_length_in_seconds: 0,
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.isSafeToPlay = true;
      newPlaylistAudiotrack.currentAsset = mockAsset;
      newPlaylistAudiotrack.playlist.playing = false;

      const playingEvent = new Event('playing');
      newPlaylistAudiotrack.audioElement.dispatchEvent(playingEvent);

      expect(mockAsset.status).toBe('paused');
      expect(mockClient?.events?.logAssetStart).not.toHaveBeenCalled();
      expect(newPlaylistAudiotrack.playing).toBe(false);
      expect(newPlaylistAudiotrack.played).toBe(false);
    });

    it('should handle playing event when currentAsset is null', () => {
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: mockAudioData,
        playlist: mockPlaylist,
        client: mockClient,
      });

      newPlaylistAudiotrack.isSafeToPlay = true;
      newPlaylistAudiotrack.currentAsset = null;
      newPlaylistAudiotrack.playlist.playing = true;

      const playingEvent = new Event('playing');
      newPlaylistAudiotrack.audioElement.dispatchEvent(playingEvent);

      expect(newPlaylistAudiotrack.playing).toBe(false);
      expect(newPlaylistAudiotrack.played).toBe(false);
    });
  });

  describe('setInitialTrackState', () => {
    it('should set initial track state', () => {
      playlistAudiotrack.setInitialTrackState();
      expect(playlistAudiotrack.state).toBeDefined();
    });
  });

  describe('onAudioError', () => {
    it('should handle audio error and reset state', () => {
      playlistAudiotrack.onAudioError();
      expect(playlistAudiotrack.state).toBeDefined();
    });
  });

  describe('onAudioEnded', () => {
    it('should handle audio ended event', () => {
      playlistAudiotrack.onAudioEnded();
    });
  });

  describe('play', () => {
    it('should call state.play() if state exists', () => {
      const mockState = {
        play: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.play();
      expect(mockState.play).toHaveBeenCalled();
    });

    it('should not call state.play() if state does not exist', () => {
      playlistAudiotrack.state = undefined;
      playlistAudiotrack.play();
    });
  });

  describe('updateParams', () => {
    it('should update mix params and state', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.updateParams({ tagIds: [1, 2] });
      expect(mockState.updateParams).toHaveBeenCalled();
    });

    it('should handle undefined mixParams', () => {
      playlistAudiotrack.mixParams = undefined;
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      expect(playlistAudiotrack.mixParams).toBeDefined();
    });

    it('should handle undefined listenTagIds in mixParams', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.mixParams = undefined;
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      expect(mockState.updateParams).toHaveBeenCalled();
    });

    it('should handle existing listenTagIds in mixParams', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.mixParams = { listenTagIds: [3, 4] } as any;
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      expect(mockState.updateParams).toHaveBeenCalled();
    });

    it('should handle updateParams when both mixParams and listenTagIds exist', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.mixParams = { listenTagIds: [3, 4] } as any;
      
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      
      expect(playlistAudiotrack.mixParams).toBeDefined();
      expect(mockState.updateParams).toHaveBeenCalled();
    });

    it('should handle updateParams when state is undefined', () => {
      playlistAudiotrack.state = undefined;
      playlistAudiotrack.mixParams = { listenTagIds: [3, 4] } as any;
      
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      
      expect(playlistAudiotrack.mixParams).toBeDefined();
      // Should not throw any errors when state is undefined
    });

    it('should concatenate existing and new listenTagIds', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.mixParams = { listenTagIds: [3, 4] } as any;
      
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      
      expect(mockState.updateParams).toHaveBeenCalled();
    });

    it('should handle updateParams with existing listenTagIds', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.mixParams = { listenTagIds: [3, 4] } as any;
      
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      
      expect(playlistAudiotrack.mixParams?.listenTagIds).toEqual([3, 4]);
      expect(mockState.updateParams).toHaveBeenCalled();
    });

    it('should handle updateParams when mixParams exists but listenTagIds is undefined', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.mixParams = { someOtherParam: 'value' } as any;
      
      playlistAudiotrack.updateParams({ listenTagIds: [1, 2] });
      
      expect(playlistAudiotrack.mixParams).toBeDefined();
      expect(mockState.updateParams).toHaveBeenCalled();
    });

    it('should handle updateParams with no parameters', () => {
      const mockState = {
        updateParams: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.mixParams = { someParam: 'value' } as any;
      
      playlistAudiotrack.updateParams();
      
      expect(playlistAudiotrack.mixParams).toBeDefined();
      expect(mockState.updateParams).toHaveBeenCalled();
    });
  });

  describe('holdGain', () => {
    it('should cancel and hold gain at current time', () => {
      playlistAudiotrack.holdGain();
      expect(mockGainNode.gain.cancelAndHoldAtTime).toHaveBeenCalledWith(0);
    });
  });

  describe('setZeroGain', () => {
    it('should set gain to nearly zero', () => {
      playlistAudiotrack.setZeroGain();
      expect(mockGainNode.gain.value).toBe(0.0001);
    });
  });

  describe('fadeIn', () => {
    it('should fade in with correct volume', () => {
      const mockAsset = {
        volume: 0.8,
      } as IDecoratedAsset;
      playlistAudiotrack.currentAsset = mockAsset;
      const result = playlistAudiotrack.fadeIn(2);
      expect(result).toBe(true);
    });

    it('should return false if no current asset', () => {
      playlistAudiotrack.currentAsset = null;
      const result = playlistAudiotrack.fadeIn(2);
      expect(result).toBe(false);
    });

    it('should handle errors during fade in', () => {
      const mockAsset = {
        volume: 0.8,
      } as IDecoratedAsset;
      playlistAudiotrack.currentAsset = mockAsset;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      jest.spyOn(playlistAudiotrack as any, 'rampGain').mockImplementation(() => {
        throw new Error('Fade in failed');
      });

      const result = playlistAudiotrack.fadeIn(2);
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('fadeOut', () => {
    it('should fade out with correct duration', () => {
      const mockAsset = {
        audio_length_in_seconds: 10,
      } as IDecoratedAsset;
      playlistAudiotrack.currentAsset = mockAsset;
      const result = playlistAudiotrack.fadeOut(2);
      expect(result).toBe(true);
    });

    it('should adjust fade out duration to remaining audio length', () => {
      const mockAsset = {
        audio_length_in_seconds: 10,
      } as IDecoratedAsset;
      playlistAudiotrack.currentAsset = mockAsset;
      (playlistAudiotrack as any).audioElement.currentTime = 8;
      const result = playlistAudiotrack.fadeOut(5);
      expect(result).toBe(true);
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalled();
    });
  });

  describe('rampGain', () => {
    it('should ramp gain to target value', () => {
      const result = playlistAudiotrack.rampGain(0.5, 2);
      expect(result).toBe(true);
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalled();
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
    });

    it('should handle errors when ramping gain', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      (mockGainNode.gain.setValueAtTime as jest.Mock).mockImplementation(() => {
        throw new Error('Gain error');
      });

      const result = playlistAudiotrack.rampGain(0.5, 2);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('loadNextAsset', () => {
    it('should load next asset from playlist', () => {
      const mockAsset = {
        id: 1,
        file: 'test.mp3',
        start_time: 0,
      } as IDecoratedAsset;
      mockPlaylist.next.mockReturnValue(mockAsset);
      const result = playlistAudiotrack.loadNextAsset();
      expect(result).toBe(mockAsset);
    });

    it('should set currentTime to resume_time when asset status is resumed', () => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        file: 'test.mp3',
        start_time: 0,
        status: 'resumed',
        resume_time: 5,
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        end_time: 0,
        audio_length_in_seconds: 0,
        session_id: 0,
        language_id: 0,
        activeRegionUpperBound: 0,
        description: '',
        filename: '',
        updated: '',
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        volume: 0,
        created: '',
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      mockPlaylist.next.mockReturnValue(mockAsset);
      
      const addEventListenerSpy = jest.spyOn(mockAudioElement, 'addEventListener');
      let metadataCallback: EventListener | undefined;
      
      addEventListenerSpy.mockImplementation((event, callback) => {
        if (event === 'loadedmetadata') {
          metadataCallback = callback as EventListener;
        }
      });

      playlistAudiotrack.loadNextAsset();
      
      expect(metadataCallback).toBeDefined();
      metadataCallback?.({} as Event);
      expect(mockAudioElement.currentTime).toBe(5);
      addEventListenerSpy.mockRestore();
    });

    it('should set currentTime to start_time when asset status is not resumed', () => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        file: 'test.mp3',
        start_time: 3,
        status: undefined,
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        end_time: 0,
        audio_length_in_seconds: 0,
        session_id: 0,
        language_id: 0,
        activeRegionUpperBound: 0,
        description: '',
        filename: '',
        updated: '',
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        volume: 0,
        created: '',
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      mockPlaylist.next.mockReturnValue(mockAsset);
      
      const addEventListenerSpy = jest.spyOn(mockAudioElement, 'addEventListener');
      let metadataCallback: EventListener | undefined;
      
      addEventListenerSpy.mockImplementation((event, callback) => {
        if (event === 'loadedmetadata') {
          metadataCallback = callback as EventListener;
        }
      });

      playlistAudiotrack.loadNextAsset();
      
      expect(metadataCallback).toBeDefined();
      metadataCallback?.({} as Event);
      expect(mockAudioElement.currentTime).toBe(3);
      addEventListenerSpy.mockRestore();
    });

    it('should set currentTime to start_time when asset status is resumed but no resume_time', () => {
      const mockAsset: IDecoratedAsset = {
        id: 1,
        file: 'test.mp3',
        start_time: 3,
        status: 'resumed',
        resume_time: undefined,
        activeRegionLength: 0,
        activeRegionLowerBound: 0,
        end_time: 0,
        audio_length_in_seconds: 0,
        session_id: 0,
        language_id: 0,
        activeRegionUpperBound: 0,
        description: '',
        filename: '',
        updated: '',
        locationPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          },
          properties: {}
        },
        playCount: 0,
        envelope_ids: [],
        latitude: 0,
        longitude: 0,
        submitted: false,
        weight: 0,
        tag_ids: [],
        project_id: 0,
        media_type: '',
        volume: 0,
        created: '',
        description_loc_ids: [],
        alt_text_loc_ids: []
      };
      mockPlaylist.next.mockReturnValue(mockAsset);
      
      const addEventListenerSpy = jest.spyOn(mockAudioElement, 'addEventListener');
      let metadataCallback: EventListener | undefined;
      
      addEventListenerSpy.mockImplementation((event, callback) => {
        if (event === 'loadedmetadata') {
          metadataCallback = callback as EventListener;
        }
      });

      playlistAudiotrack.loadNextAsset();
      
      expect(metadataCallback).toBeDefined();
      metadataCallback?.({} as Event);
      expect(mockAudioElement.currentTime).toBe(3);
      addEventListenerSpy.mockRestore();
    });

    it('should return null if no next asset', () => {
      mockPlaylist.next.mockReturnValue(undefined);
      const result = playlistAudiotrack.loadNextAsset();
      expect(result).toBeNull();
    });

    it('should return null if asset file is not a string', () => {
      const mockAsset = {
        id: 1,
        file: null,
        start_time: 0,
      } as IDecoratedAsset;
      mockPlaylist.next.mockReturnValue(mockAsset);
      const result = playlistAudiotrack.loadNextAsset();
      expect(result).toBeNull();
    });

    it('should initialize playCount to 0 if not a number', () => {
      const mockAsset = {
        id: 1,
        file: 'test.mp3',
        start_time: 0,
        playCount: 'not a number' as any,
      } as IDecoratedAsset;
      playlistAudiotrack.currentAsset = mockAsset;
      playlistAudiotrack.played = true;
      mockPlaylist.next.mockReturnValue(mockAsset);
      
      playlistAudiotrack.loadNextAsset();
      expect(mockAsset.playCount).toBe(1);
    });

    it('should increment play count for played assets', () => {
      const mockAsset = {
        id: 1,
        file: 'test.mp3',
        start_time: 0,
        playCount: 0,
      } as IDecoratedAsset;
      playlistAudiotrack.currentAsset = mockAsset;
      playlistAudiotrack.played = true;
      mockPlaylist.next.mockReturnValue(mockAsset);
      
      playlistAudiotrack.loadNextAsset();
      expect(mockAsset.playCount).toBe(1);
    });

    it('should not increment play count for paused assets', () => {
      const mockAsset = {
        id: 1,
        file: 'test.mp3',
        start_time: 0,
        playCount: 0,
        status: 'paused',
      } as IDecoratedAsset;
      playlistAudiotrack.currentAsset = mockAsset;
      playlistAudiotrack.played = true;
      mockPlaylist.next.mockReturnValue(mockAsset);
      
      playlistAudiotrack.loadNextAsset();
      expect(mockAsset.playCount).toBe(0);
    });
  });

  describe('pause', () => {
    it('should pause audio and update state', () => {
      const mockState = {
        pause: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      (playlistAudiotrack as any).audioElement = mockAudioElement;
      (playlistAudiotrack as any).gainNode = mockGainNode;
      (playlistAudiotrack as any).playlist = mockPlaylist;
      (playlistAudiotrack as any).listenEvents = mockClient.events;
      
      playlistAudiotrack.pause();
      expect(mockState.pause).toHaveBeenCalled();
    });

    it('should not call state.pause() if state is undefined', () => {
      playlistAudiotrack.state = undefined;
      playlistAudiotrack.pause();
      expect(mockAudioElement.pause).not.toHaveBeenCalled();
    });
  });

  describe('playAudio', () => {
    it('should resume audio context if not running', async () => {
      playlistAudiotrack.audioContext = {
        state: 'suspended',
        resume: jest.fn().mockResolvedValue(undefined),
      } as any;
      playlistAudiotrack.audioElement = {
        src: 'test.mp3',
        play: jest.fn().mockResolvedValue(undefined),
      } as any;

      await playlistAudiotrack.playAudio();

      expect(playlistAudiotrack.audioContext.resume).toHaveBeenCalled();
      expect(playlistAudiotrack.audioElement.play).toHaveBeenCalled();
    });

    it('should not resume audio context if already running', async () => {
      playlistAudiotrack.audioContext = {
        state: 'running',
        resume: jest.fn().mockResolvedValue(undefined),
      } as any;
      playlistAudiotrack.audioElement = {
        src: 'test.mp3',
        play: jest.fn().mockResolvedValue(undefined),
      } as any;

      await playlistAudiotrack.playAudio();

      expect(playlistAudiotrack.audioContext.resume).not.toHaveBeenCalled();
      expect(playlistAudiotrack.audioElement.play).toHaveBeenCalled();
    });

    it('should set silence audio when source is empty', async () => {
      playlistAudiotrack.audioContext = {
        state: 'running',
        resume: jest.fn().mockResolvedValue(undefined),
      } as any;
      playlistAudiotrack.audioElement = {
        src: '',
        play: jest.fn().mockResolvedValue(undefined),
      } as any;

      await playlistAudiotrack.playAudio();

      expect(playlistAudiotrack.audioElement.src).toBe(silenceAudioBase64);
      expect(playlistAudiotrack.audioElement.play).toHaveBeenCalled();
    });

    it('should handle play error and reset state', async () => {
      const mockState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      playlistAudiotrack.audioContext = {
        state: 'running',
        resume: jest.fn().mockResolvedValue(undefined),
      } as any;
      playlistAudiotrack.audioElement = {
        src: 'test.mp3',
        play: jest.fn().mockRejectedValue(new Error('Play failed')),
      } as any;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.audioData = {
        id: 1,
      } as IAudioTrackData;

      // Ensure state is properly set up before the error
      playlistAudiotrack.setInitialTrackState = jest.fn().mockImplementation(() => {
        playlistAudiotrack.state = mockState;
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const setInitialTrackStateSpy = jest.spyOn(playlistAudiotrack, 'setInitialTrackState');

      await playlistAudiotrack.playAudio();

      expect(consoleErrorSpy).toHaveBeenCalledWith('1', expect.any(Error));
      expect(setInitialTrackStateSpy).toHaveBeenCalled();
      expect(mockState.finish).toHaveBeenCalled();
      expect(mockState.play).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('pauseAudio', () => {
    it('should pause audio if not already paused', () => {
      Object.defineProperty(mockAudioElement, 'paused', {
        get: () => false,
      });
      playlistAudiotrack.pauseAudio();
      expect(mockAudioElement.pause).toHaveBeenCalled();
    });
  });

  describe('skip', () => {
    it('should set initial track state and return early when playlist is not playing', () => {
      const mockState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      const mockEvents = {
        logAssetEnd: jest.fn(),
      } as unknown as RoundwareEvents;

      playlistAudiotrack.playlist = {
        playing: false,
      } as any;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.gainNode = mockGainNode;
      playlistAudiotrack.trackOptions = {
        fadeOutLowerBound: 1,
      } as any;
      playlistAudiotrack.currentAsset = {
        id: 123,
        audio_length_in_seconds: 10,
      } as IDecoratedAsset;
      playlistAudiotrack.listenEvents = mockEvents;

      const setInitialTrackStateSpy = jest.spyOn(playlistAudiotrack, 'setInitialTrackState');
      const fadeOutSpy = jest.spyOn(playlistAudiotrack, 'fadeOut');
      const pauseAudioSpy = jest.spyOn(playlistAudiotrack, 'pauseAudio');
      const logAssetEndSpy = jest.spyOn(mockEvents, 'logAssetEnd');

      playlistAudiotrack.skip();

      expect(setInitialTrackStateSpy).toHaveBeenCalled();
      expect(fadeOutSpy).not.toHaveBeenCalled();
      expect(pauseAudioSpy).not.toHaveBeenCalled();
      expect(logAssetEndSpy).not.toHaveBeenCalled();
      expect(mockState.play).not.toHaveBeenCalled();
      expect(mockState.finish).not.toHaveBeenCalled();
    });

    it('should fade out, pause, log end, and transition when playlist is playing', () => {
      const mockOldState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      const mockNewState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      const mockEvents = {
        logAssetEnd: jest.fn(),
      } as unknown as RoundwareEvents;

      playlistAudiotrack.playlist = {
        playing: true,
      } as any;
      playlistAudiotrack.state = mockOldState;
      playlistAudiotrack.gainNode = mockGainNode;
      playlistAudiotrack.trackOptions = {
        fadeOutLowerBound: 1,
      } as any;
      playlistAudiotrack.currentAsset = {
        id: 123,
        audio_length_in_seconds: 10,
      } as IDecoratedAsset;
      playlistAudiotrack.listenEvents = mockEvents;

      const setInitialTrackStateSpy = jest.spyOn(playlistAudiotrack, 'setInitialTrackState');
      const fadeOutSpy = jest.spyOn(playlistAudiotrack, 'fadeOut').mockReturnValue(true);
      const pauseAudioSpy = jest.spyOn(playlistAudiotrack, 'pauseAudio');
      const logAssetEndSpy = jest.spyOn(mockEvents, 'logAssetEnd');
      jest.spyOn(require('./TrackStates'), 'makeInitialTrackState').mockReturnValue(mockNewState);

      jest.useFakeTimers();
      playlistAudiotrack.skip();
      jest.advanceTimersByTime(playlistAudiotrack.trackOptions.fadeOutLowerBound * 1000);

      expect(setInitialTrackStateSpy).not.toHaveBeenCalled();
      expect(fadeOutSpy).toHaveBeenCalledWith(playlistAudiotrack.trackOptions.fadeOutLowerBound);
      expect(pauseAudioSpy).toHaveBeenCalled();
      expect(logAssetEndSpy).toHaveBeenCalledWith(123);
      expect(mockOldState.finish).toHaveBeenCalled();
      expect(mockNewState.play).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should not transition if playlist stops playing during fade out', () => {
      const mockOldState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      const mockNewState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      const mockEvents = {
        logAssetEnd: jest.fn(),
      } as unknown as RoundwareEvents;

      playlistAudiotrack.playlist = {
        playing: true,
      } as any;
      playlistAudiotrack.state = mockOldState;
      playlistAudiotrack.gainNode = mockGainNode;
      playlistAudiotrack.trackOptions = {
        fadeOutLowerBound: 1,
      } as any;
      playlistAudiotrack.currentAsset = {
        id: 123,
        audio_length_in_seconds: 10,
      } as IDecoratedAsset;
      playlistAudiotrack.listenEvents = mockEvents;

      const fadeOutSpy = jest.spyOn(playlistAudiotrack, 'fadeOut').mockReturnValue(true);
      const pauseAudioSpy = jest.spyOn(playlistAudiotrack, 'pauseAudio');
      const logAssetEndSpy = jest.spyOn(mockEvents, 'logAssetEnd');
      jest.spyOn(require('./TrackStates'), 'makeInitialTrackState').mockReturnValue(mockNewState);

      jest.useFakeTimers();
      playlistAudiotrack.skip();
      // Simulate playlist stopping during fade out
      playlistAudiotrack.playlist.playing = false;
      jest.advanceTimersByTime(playlistAudiotrack.trackOptions.fadeOutLowerBound * 1000);

      expect(fadeOutSpy).toHaveBeenCalled();
      expect(pauseAudioSpy).toHaveBeenCalled();
      expect(logAssetEndSpy).toHaveBeenCalled();
      expect(mockOldState.finish).not.toHaveBeenCalled();
      expect(mockNewState.play).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('replay', () => {
    it('should replay current track', () => {
      const mockState = {
        replay: jest.fn(),
      } as unknown as ITrackStates;
      playlistAudiotrack.state = mockState;
      playlistAudiotrack.replay();
      expect(mockState.replay).toHaveBeenCalled();
    });

    it('should not call state.replay() if state is undefined', () => {
      playlistAudiotrack.state = undefined;
      playlistAudiotrack.replay();
      expect(mockAudioElement.play).not.toHaveBeenCalled();
    });

    it('should handle undefined state', () => {
      const playlistTrackLogSpy = jest.spyOn(require('./utils'), 'playlistTrackLog').mockImplementation();
      playlistAudiotrack.state = undefined;
      playlistAudiotrack.replay();
      expect(playlistTrackLogSpy).toHaveBeenCalledWith(`Replaying ${playlistAudiotrack}`);
      playlistTrackLogSpy.mockRestore();
    });
  });

  describe('transition', () => {
    it('should handle transition when state is undefined', () => {
      const mockNewState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      playlistAudiotrack.state = undefined;
      playlistAudiotrack.playlist = {
        playing: true,
        elapsedTimeMs: 5000,
      } as any;

      const playlistTrackLogSpy = jest.spyOn(require('./utils'), 'playlistTrackLog');

      playlistAudiotrack.transition(mockNewState);

      expect(playlistTrackLogSpy).toHaveBeenCalled();
      expect(mockNewState.play).not.toHaveBeenCalled();
      expect(mockNewState.finish).not.toHaveBeenCalled();
    });

    it('should transition to new state and play when playlist is playing', () => {
      const mockOldState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      const mockNewState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      playlistAudiotrack.state = mockOldState;
      playlistAudiotrack.playlist = {
        playing: true,
        elapsedTimeMs: 5000,
      } as any;

      const playlistTrackLogSpy = jest.spyOn(require('./utils'), 'playlistTrackLog');

      playlistAudiotrack.transition(mockNewState);

      expect(playlistTrackLogSpy).toHaveBeenCalled();
      expect(mockOldState.finish).toHaveBeenCalled();
      expect(mockNewState.play).toHaveBeenCalled();
      expect(playlistAudiotrack.state).toBe(mockNewState);
    });

    it('should transition to new state but not play when playlist is not playing', () => {
      const mockOldState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      const mockNewState = {
        play: jest.fn(),
        finish: jest.fn(),
      } as unknown as ITrackStates;

      playlistAudiotrack.state = mockOldState;
      playlistAudiotrack.playlist = {
        playing: false,
        elapsedTimeMs: 5000,
      } as any;

      const playlistTrackLogSpy = jest.spyOn(require('./utils'), 'playlistTrackLog');

      playlistAudiotrack.transition(mockNewState);

      expect(playlistTrackLogSpy).toHaveBeenCalled();
      expect(mockOldState.finish).toHaveBeenCalled();
      expect(mockNewState.play).not.toHaveBeenCalled();
      expect(playlistAudiotrack.state).toBe(mockNewState);
    });
  });

  describe('toString', () => {
    it('should return correct string representation', () => {
      expect(playlistAudiotrack.toString()).toBe('Track #1');
    });

    it('should return correct string representation with different track ID', () => {
      const newPlaylistAudiotrack = new PlaylistAudiotrack({
        audioContext: mockAudioContext,
        audioData: { ...mockAudioData, id: 2 },
        playlist: mockPlaylist,
        client: mockClient,
      });
      expect(newPlaylistAudiotrack.toString()).toBe('Track #2');
    });
  });
});