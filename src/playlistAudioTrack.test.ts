import { PlaylistAudiotrack } from './playlistAudioTrack';
import { Roundware } from './roundware';
import { Playlist } from './playlist';
import { IAudioContext, IGainNode, IAudioParam, IMediaElementAudioSourceNode, IStereoPannerNode } from 'standardized-audio-context';
import { IDecoratedAsset } from './types/asset';
import { Feature, Point } from '@turf/helpers';

describe('PlaylistAudiotrack', () => {
  let playlistAudiotrack: PlaylistAudiotrack;
  let mockAudioContext: jest.Mocked<IAudioContext>;
  let mockPlaylist: jest.Mocked<Playlist>;
  let mockRoundware: jest.Mocked<Roundware>;
  let mockAudioElement: HTMLAudioElement;
  let mockMediaElementSource: jest.Mocked<IMediaElementAudioSourceNode<IAudioContext>>;
  let mockGainNode: jest.Mocked<IGainNode<IAudioContext>>;
  let mockPanNode: jest.Mocked<IStereoPannerNode<IAudioContext>>;

  beforeAll(() => {
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.log after tests
    jest.restoreAllMocks();
  });
  const createMockAsset = (overrides: Partial<IDecoratedAsset> = {}): IDecoratedAsset => ({
    id: 1,
    file: 'test.mp3',
    volume: 1,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    submitted: true,
    weight: 1,
    media_type: 'audio',
    description: '',
    latitude: 0,
    longitude: 0,
    shape: undefined,
    filename: 'test.mp3',
    audio_length_in_seconds: 10,
    tag_ids: [],
    session_id: 1,
    project_id: 1,
    language_id: 1,
    envelope_ids: [],
    description_loc_ids: [],
    alt_text_loc_ids: [],
    user: undefined,
    playCount: 0,
    lastListenTime: undefined,
    status: undefined,
    resume_time: undefined,
    timedAssetStart: undefined,
    timedAssetEnd: undefined,
    listenerPoint: undefined,
    project: undefined,
    activeRegionLowerBound: 0,
    activeRegionUpperBound: 10,
    activeRegionLength: 10,
    locationPoint: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      },
      properties: {}
    } as Feature<Point>,
    start_time: 0,
    end_time: 10,
    ...overrides
  });

  beforeEach(() => {
    // Create mock audio element first since it's used by other mocks
    mockAudioElement = {
      src: '',
      currentTime: 0,
      addEventListener: jest.fn(),
      play: jest.fn().mockResolvedValue(undefined),  // Mock the play method
      pause: jest.fn(),
      paused: false
    } as any;
  
    const mockGainParam: jest.Mocked<IAudioParam> = {
      value: 1,
      defaultValue: 1,
      minValue: 0,
      maxValue: 1,
      cancelScheduledValues: jest.fn(),
      cancelAndHoldAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      setTargetAtTime: jest.fn(),
      setValueCurveAtTime: jest.fn()
    };
  
    const baseAudioNode = {
      channelCount: 2,
      channelCountMode: 'explicit' as const,
      channelInterpretation: 'speakers' as const,
      context: {} as IAudioContext,
      numberOfInputs: 1,
      numberOfOutputs: 1,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
  
    mockGainNode = {
      ...baseAudioNode,
      gain: mockGainParam,
      connect: jest.fn().mockReturnValue(mockGainNode)
    } as unknown as jest.Mocked<IGainNode<IAudioContext>>;
  
    mockPanNode = {
      ...baseAudioNode,
      pan: mockGainParam,
      connect: jest.fn().mockReturnValue(mockGainNode)
    } as unknown as jest.Mocked<IStereoPannerNode<IAudioContext>>;
  
    mockMediaElementSource = {
      ...baseAudioNode,
      mediaElement: mockAudioElement,
      connect: jest.fn().mockReturnValue(mockPanNode)
    } as unknown as jest.Mocked<IMediaElementAudioSourceNode<IAudioContext>>;
  
    mockAudioContext = {
      createMediaElementSource: jest.fn().mockReturnValue(mockMediaElementSource),
      createGain: jest.fn().mockReturnValue(mockGainNode),
      createStereoPanner: jest.fn().mockReturnValue(mockPanNode),
      destination: {},
      currentTime: 0,
      state: 'running',
      resume: jest.fn().mockResolvedValue(undefined),
      createAnalyser: jest.fn(),
      createBiquadFilter: jest.fn(),
      createBuffer: jest.fn(),
      createBufferSource: jest.fn(),
      createChannelMerger: jest.fn(),
      createChannelSplitter: jest.fn(),
      createConstantSource: jest.fn(),
      createConvolver: jest.fn(),
      createDelay: jest.fn(),
      createDynamicsCompressor: jest.fn(),
      createIIRFilter: jest.fn(),
      createMediaStreamDestination: jest.fn(),
      createMediaStreamSource: jest.fn(),
      createMediaStreamTrackSource: jest.fn(),
      createOscillator: jest.fn(),
      createPanner: jest.fn(),
      createPeriodicWave: jest.fn(),
      createScriptProcessor: jest.fn(),
      createWaveShaper: jest.fn(),
      suspend: jest.fn()
    } as unknown as jest.Mocked<IAudioContext>;
  
    mockPlaylist = {
      next: jest.fn(),
      playing: true,
      elapsedTimeMs: 0
    } as any;
  
    mockRoundware = {
      events: {
        logAssetStart: jest.fn(),
        logAssetEnd: jest.fn()
      }
    } as any;
  
    // Create the PlaylistAudiotrack instance
    playlistAudiotrack = new PlaylistAudiotrack({
      audioContext: mockAudioContext,
      audioData: {
        id: 1,
        minvolume: 0.7,
        maxvolume: 0.7,
        minduration: 200,
        maxduration: 250,
        mindeadair: 1,
        maxdeadair: 3,
        minfadeintime: 2,
        maxfadeintime: 4,
        minfadeouttime: 0.3,
        maxfadeouttime: 1,
        minpanpos: 0,
        maxpanpos: 0,
        minpanduration: 10,
        maxpanduration: 20,
        repeatrecordings: false,
        active: true,
        start_with_silence: false,
        banned_duration: 600,
        tag_filters: [],
        project_id: 9,
        fadeout_when_filtered: false,
        timed_asset_priority: '0'
      },
      playlist: mockPlaylist,
      client: mockRoundware
    });
  
    // Mock the state object with required methods
    const mockState = {
      play: jest.fn().mockImplementation(async () => {
        await playlistAudiotrack.playAudio();
      }),
      pause: jest.fn().mockImplementation(() => {
        playlistAudiotrack.pauseAudio();
      }),
      finish: jest.fn(),
      skip: jest.fn().mockImplementation(() => {
        playlistAudiotrack.fadeOut(0.1);
      }),
      replay: jest.fn(),
      updateParams: jest.fn(),
      toString: jest.fn()
    };
  
    // Set the mock state
    playlistAudiotrack.state = mockState as any;
  });

  describe('holdGain', () => {
    it('should cancel scheduled gain values', () => {
      const cancelSpy = jest.spyOn(playlistAudiotrack.gainNode.gain, 'cancelScheduledValues');
      playlistAudiotrack.holdGain();
      expect(cancelSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('setZeroGain', () => {
    it('should set gain to nearly zero', () => {
      playlistAudiotrack.setZeroGain();
      expect(playlistAudiotrack.gainNode.gain.value).toBe(0.0001);
    });
  });

  describe('fadeIn', () => {
    it('should return false if no current asset', () => {
      playlistAudiotrack.currentAsset = null;
      expect(playlistAudiotrack.fadeIn(1)).toBe(false);
    });

    it('should ramp gain up over duration', () => {
      playlistAudiotrack.currentAsset = {
        volume: 1
      } as IDecoratedAsset;
      const result = playlistAudiotrack.fadeIn(2);
      expect(result).toBe(true);
    });
  });

  describe('fadeOut', () => {
    it('should ramp gain down to zero', () => {
      const result = playlistAudiotrack.fadeOut(1);
      expect(result).toBe(true);
    });
  });

  describe('playAudio', () => {
    it('should resume audio context and play audio element', async () => {
      await playlistAudiotrack.playAudio();
      expect(mockAudioContext.resume).toHaveBeenCalled();
      expect(mockAudioElement.play).toHaveBeenCalled();
    });
  });

  describe('pauseAudio', () => {
    it('should pause audio if not already paused', () => {
      playlistAudiotrack.pauseAudio();
      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    it('should not pause if already paused', () => {
      Object.defineProperty(mockAudioElement, 'paused', { value: true });
      playlistAudiotrack.pauseAudio();
      expect(mockAudioElement.pause).not.toHaveBeenCalled();
    });
  });

  describe('skip', () => {
    it('should fade out and transition to new state', () => {
      jest.useFakeTimers();
      playlistAudiotrack.skip();
      // Only advance timers once to avoid infinite loop
      jest.advanceTimersByTime(1000);
      expect(mockAudioElement.pause).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('replay', () => {
    it('should call replay on current state', () => {
      playlistAudiotrack.replay();
      expect((playlistAudiotrack.state as any).replay).toHaveBeenCalled();
    });
  });

  describe('transition', () => {
    it('should finish current state and set new state', () => {
      const newState = {
        play: jest.fn(),
        pause: jest.fn(),
        finish: jest.fn(),
        skip: jest.fn(),
        replay: jest.fn(),
        updateParams: jest.fn(),
        toString: jest.fn()
      };
      playlistAudiotrack.transition(newState as any);
      expect((playlistAudiotrack.state as any).finish).toHaveBeenCalled();
      expect(playlistAudiotrack.state).toBe(newState);
    });
  });
});
