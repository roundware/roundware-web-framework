import { SpeakerTrack } from './speaker_track';
import { IAudioContext, IAudioBuffer, IAudioBufferSourceNode, IGainNode } from 'standardized-audio-context';
import { ISpeakerData } from '../types/speaker';
import { SpeakerConfig } from '../types/roundware';
import { Point, LineString, MultiLineString, Polygon, MultiPolygon } from 'geojson';

// Mock XMLHttpRequest
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  timeout: 0,
  responseType: '',
  onprogress: null as ((event: any) => void) | null,
  onload: null as (() => void) | null,
  abort: jest.fn(),
};
const MockXMLHttpRequest = jest.fn(() => mockXHR as any) as any;
MockXMLHttpRequest.UNSENT = 0;
MockXMLHttpRequest.OPENED = 1;
MockXMLHttpRequest.HEADERS_RECEIVED = 2;
MockXMLHttpRequest.LOADING = 3;
MockXMLHttpRequest.DONE = 4;
window.XMLHttpRequest = MockXMLHttpRequest;

// Mock standardized-audio-context
jest.mock('standardized-audio-context', () => {
  const mockCallbacks = {
    successCallback: null as any,
    errorCallback: null as any,
  };

  return {
    AudioContext: jest.fn().mockImplementation(() => ({
      currentTime: 0,
      createBufferSource: jest.fn().mockReturnValue({
        loop: false,
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn(),
        onended: null,
      }),
      createGain: jest.fn().mockReturnValue({
        gain: {
          value: 0,
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: jest.fn(),
      }),
      decodeAudioData: jest.fn().mockImplementation((data, successCallback, errorCallback) => {
        mockCallbacks.successCallback = successCallback;
        mockCallbacks.errorCallback = errorCallback;
      }),
      destination: {},
    })),
    mockCallbacks,
  };
});

describe('SpeakerTrack', () => {
  let speakerTrack: SpeakerTrack;
  let mockAudioContext: jest.Mocked<IAudioContext>;
  let mockSpeakerData: ISpeakerData;
  let mockConfig: SpeakerConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioContext = new (require('standardized-audio-context').AudioContext)() as jest.Mocked<IAudioContext>;
    mockSpeakerData = {
      id: 1,
      maxvolume: 1.0,
      minvolume: 0.1,
      attenuation_distance: 100,
      uri: 'test-audio.mp3',
      attenuation_border: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]],
      } as LineString,
      boundary: {
        type: 'MultiLineString',
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
      } as MultiLineString,
    };
    mockConfig = {
      effects: {},
      mode: 'stream',
    };

    speakerTrack = new SpeakerTrack({
      data: mockSpeakerData,
      audioContext: mockAudioContext,
      config: mockConfig,
    });
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(speakerTrack.maxVolume).toBe(1.0);
      expect(speakerTrack.minVolume).toBe(0.1);
      expect(speakerTrack.attenuationDistanceKm).toBe(0.1);
      expect(speakerTrack.uri).toBe('test-audio.mp3');
      expect(speakerTrack.calculatedVolume).toBe(0.05); // NEARLY_ZERO
    });

    it('should initialize without boundary', () => {
      const speakerDataWithoutBoundary = {
        ...mockSpeakerData,
        boundary: undefined
      };
      const speakerTrackWithoutBoundary = new SpeakerTrack({
        data: speakerDataWithoutBoundary,
        audioContext: mockAudioContext,
        config: mockConfig,
      });
      expect(speakerTrackWithoutBoundary.outerBoundary).toBeUndefined();
    });

    it('should initialize without attenuation border', () => {
      const speakerDataWithoutAttenuation = {
        ...mockSpeakerData,
        attenuation_border: undefined
      };
      const speakerTrackWithoutAttenuation = new SpeakerTrack({
        data: speakerDataWithoutAttenuation,
        audioContext: mockAudioContext,
        config: mockConfig,
      });
      expect(speakerTrackWithoutAttenuation.attenuationBorderPolygon).toBeUndefined();
      expect(speakerTrackWithoutAttenuation.attenuationBorderLineString).toBeUndefined();
    });
  });

  describe('outerBoundaryContains', () => {
    it('should return true for point inside boundary', () => {
      const point: Point = {
        type: 'Point',
        coordinates: [1, 1],
      };
      expect(speakerTrack.outerBoundaryContains(point)).toBe(true);
    });

    it('should return false for point outside boundary', () => {
      const point: Point = {
        type: 'Point',
        coordinates: [3, 3],
      };
      expect(speakerTrack.outerBoundaryContains(point)).toBe(false);
    });
  });

  describe('attenuationShapeContains', () => {
    it('should return true for point inside attenuation shape', () => {
      const point: Point = {
        type: 'Point',
        coordinates: [0.5, 0.5],
      };
      expect(speakerTrack.attenuationShapeContains(point)).toBe(true);
    });

    it('should return false for point outside attenuation shape', () => {
      const point: Point = {
        type: 'Point',
        coordinates: [2, 2],
      };
      expect(speakerTrack.attenuationShapeContains(point)).toBe(false);
    });
  });

  describe('volumeByLocation', () => {
    it('should return calculated volume when listenerPoint is null', () => {
      expect(speakerTrack.volumeByLocation(null as any)).toBe(0.05); // NEARLY_ZERO
    });

    it('should return calculated volume when point is inside attenuation shape', () => {
      const point: Point = {
        type: 'Point',
        coordinates: [0.5, 0.5],
      };
      expect(speakerTrack.volumeByLocation(point)).toBe(1.0);
    });

    it('should return minVolume when point is outside boundary', () => {
      const point: Point = {
        type: 'Point',
        coordinates: [3, 3],
      };
      expect(speakerTrack.volumeByLocation(point)).toBe(0.1);
    });

    it('should return calculated volume when point is between shapes', () => {
      const point: Point = {
        type: 'Point',
        coordinates: [1.05, 1.05],
      };
      const volume = speakerTrack.volumeByLocation(point);
      expect(volume).toBeLessThanOrEqual(0.1);
      expect(volume).toBeLessThanOrEqual(1.0);
    });
  });

  describe('loadBuffer', () => {
    it('should not load if already loading', () => {
      speakerTrack.loadBuffer();
      const firstRequest = speakerTrack.request;
      speakerTrack.loadBuffer();
      expect(speakerTrack.request).toBe(firstRequest);
    });

    it('should not load if already loaded', () => {
      speakerTrack.buffer = {} as IAudioBuffer;
      speakerTrack.loadBuffer();
      expect(speakerTrack.request).toBeNull();
    });

    it('should emit loading events', () => {
      const loadingSpy = jest.fn();
      speakerTrack.on('loading', loadingSpy);

      speakerTrack.loadBuffer();
      
      // Simulate progress event
      if (mockXHR.onprogress) {
        mockXHR.onprogress({ loaded: 50, total: 100 });
      }

      expect(speakerTrack.request).not.toBeNull();
      expect(loadingSpy).toHaveBeenCalledWith(50);
    });

    it('should handle request being null in onload callback', () => {
      speakerTrack.loadBuffer();
      speakerTrack.request = null;
      
      // Simulate load event
      if (mockXHR.onload) {
        mockXHR.onload();
      }

      // Verify no error occurred
      expect(speakerTrack.buffer).toBeNull();
    });

    it('should handle audio data decoding success and update global buffer size', () => {
      const loadedSpy = jest.fn();
      speakerTrack.on('loaded', loadedSpy);

      // Mock global._roundwareTotalAudioBufferSize
      (global as any)._roundwareTotalAudioBufferSize = 0;

      speakerTrack.loadBuffer();
      
      // Simulate successful load
      if (mockXHR.onload) {
        mockXHR.onload();
      }

      // Get the decodeAudioData callback
      const decodeCallback = (require('standardized-audio-context').mockCallbacks.successCallback);
      
      // Call it with a mock buffer
      const mockBuffer = { length: 1000, numberOfChannels: 2 } as IAudioBuffer;
      decodeCallback(mockBuffer);

      expect(loadedSpy).toHaveBeenCalled();
      expect(speakerTrack.buffer).toBe(mockBuffer);
      expect((global as any)._roundwareTotalAudioBufferSize).toBe(8000); // 1000 * 2 * 4
      expect(speakerTrack.request).toBeNull(); // Verify request is cleared
    });

    it('should handle audio data decoding error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      speakerTrack.loadBuffer();
      
      // Simulate successful load
      if (mockXHR.onload) {
        mockXHR.onload();
      }

      // Get the error callback
      const errorCallback = (require('standardized-audio-context').mockCallbacks.errorCallback);
      
      // Call it with an error
      errorCallback(new Error('Decoding failed'));

      expect(speakerTrack.buffer).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('unload', () => {
    it('should clear all resources', () => {
      speakerTrack.buffer = {} as IAudioBuffer;
      speakerTrack.bufferSource = {} as IAudioBufferSourceNode<IAudioContext>;
      speakerTrack.gainNode = {} as IGainNode<IAudioContext>;
      speakerTrack.loadedPercentage = 50;
      speakerTrack.request = new XMLHttpRequest();

      const unloadedSpy = jest.fn();
      speakerTrack.on('unloaded', unloadedSpy);

      speakerTrack.unload();

      expect(speakerTrack.buffer).toBeNull();
      expect(speakerTrack.bufferSource).toBeNull();
      expect(speakerTrack.gainNode).toBeNull();
      expect(speakerTrack.loadedPercentage).toBe(0);
      expect(speakerTrack.request).toBeNull();
      expect(unloadedSpy).toHaveBeenCalled();
    });

    it('should not emit unloaded event when buffer is null', () => {
      speakerTrack.buffer = null;
      speakerTrack.bufferSource = {} as IAudioBufferSourceNode<IAudioContext>;
      speakerTrack.gainNode = {} as IGainNode<IAudioContext>;
      speakerTrack.loadedPercentage = 50;
      speakerTrack.request = new XMLHttpRequest();

      const unloadedSpy = jest.fn();
      speakerTrack.on('unloaded', unloadedSpy);

      speakerTrack.unload();

      expect(speakerTrack.buffer).toBeNull();
      expect(speakerTrack.bufferSource).toBeNull();
      expect(speakerTrack.gainNode).toBeNull();
      expect(speakerTrack.loadedPercentage).toBe(0);
      expect(speakerTrack.request).toBeNull();
      expect(unloadedSpy).not.toHaveBeenCalled();
    });
  });

  describe('playAsBaseTrack', () => {
    beforeEach(() => {
      speakerTrack.buffer = {} as IAudioBuffer;
    });

    it('should throw error if track is not loaded', () => {
      speakerTrack.buffer = null;
      expect(() => speakerTrack.playAsBaseTrack()).toThrow('Track is not loaded');
    });

    it('should throw error if track is already playing', () => {
      speakerTrack.bufferSource = {} as IAudioBufferSourceNode<IAudioContext>;
      expect(() => speakerTrack.playAsBaseTrack()).toThrow('Track is already playing');
    });

    it('should handle stopTimeout without bufferSource', () => {
      speakerTrack.stopTimeout = setTimeout(() => {}, 1000);
      speakerTrack.bufferSource = null;
      expect(() => speakerTrack.playAsBaseTrack()).not.toThrow();
    });

    it('should emit playing event', () => {
      const playingSpy = jest.fn();
      speakerTrack.on('playing', playingSpy);

      speakerTrack.playAsBaseTrack();
      expect(playingSpy).toHaveBeenCalled();
    });

    it('should handle onended event', () => {
      const baseTrackEndedSpy = jest.fn();
      speakerTrack.on('baseTrackEnded', baseTrackEndedSpy);

      // Mock bufferSource with onended callback
      const mockBufferSource = {
        loop: false,
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn(),
        onended: null as ((event: Event) => void) | null,
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      // Mock the AudioContext's createBufferSource
      const mockAudioContext = {
        currentTime: 0,
        createBufferSource: jest.fn().mockReturnValue(mockBufferSource),
        createGain: jest.fn().mockReturnValue({
          gain: {
            value: 0,
            cancelAndHoldAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
          },
          connect: jest.fn(),
          disconnect: jest.fn(),
        }),
        destination: {},
      } as unknown as IAudioContext;

      // Replace the speakerTrack's audioContext with our mock
      speakerTrack.audioContext = mockAudioContext;

      speakerTrack.playAsBaseTrack();

      // Verify onended was set
      expect(mockBufferSource.onended).not.toBeNull();

      // Trigger the onended callback with an event
      if (mockBufferSource.onended) {
        mockBufferSource.onended(new Event('ended'));
      }

      // Verify baseTrackEnded event was emitted
      expect(baseTrackEndedSpy).toHaveBeenCalled();
      expect(speakerTrack.bufferSource).toBeNull();
      expect(speakerTrack.gainNode).toBeNull();
    });

    it('should properly setup buffer source and gain node', () => {
      const mockBufferSource = {
        loop: false,
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn(),
        onended: null,
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      const mockGainNode = {
        gain: {
          value: 0,
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as IGainNode<IAudioContext>;

      const mockAudioContext = {
        currentTime: 0,
        createBufferSource: jest.fn().mockReturnValue(mockBufferSource),
        createGain: jest.fn().mockReturnValue(mockGainNode),
        destination: {},
      } as unknown as IAudioContext;

      speakerTrack.audioContext = mockAudioContext;
      speakerTrack.buffer = {} as IAudioBuffer;
      speakerTrack.calculatedVolume = 0.5;

      speakerTrack.playAsBaseTrack();

      // Verify buffer source setup
      expect(mockBufferSource.loop).toBe(false);
      expect(mockBufferSource.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockBufferSource.start).toHaveBeenCalled();

      // Verify gain node setup
      expect(mockGainNode.gain.cancelAndHoldAtTime).toHaveBeenCalledWith(0);
      expect(mockGainNode.gain.value).toBe(0.05); // NEARLY_ZERO
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.5, 3); // calculatedVolume, FADE_DURATION_SECONDS
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });

    it('should reuse existing gain node if available', () => {
      const mockGainNode = {
        gain: {
          value: 0,
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.gainNode = mockGainNode;
      speakerTrack.buffer = {} as IAudioBuffer;

      speakerTrack.playAsBaseTrack();

      // Verify existing gain node was used
      expect(speakerTrack.audioContext.createGain).not.toHaveBeenCalled();
    
    });

    it('should handle BufferEffectsProcessor setup', () => {
      const mockBufferSource = {
        loop: false,
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn(),
        onended: null,
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      const mockAudioContext = {
        currentTime: 0,
        createBufferSource: jest.fn().mockReturnValue(mockBufferSource),
        createGain: jest.fn().mockReturnValue({
          gain: {
            value: 0,
            cancelAndHoldAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
          },
          connect: jest.fn(),
          disconnect: jest.fn(),
        }),
        destination: {},
      } as unknown as IAudioContext;

      speakerTrack.audioContext = mockAudioContext;
      speakerTrack.buffer = {} as IAudioBuffer;
      speakerTrack.config = {
        effects: {
          microFadeInDurationInMs: 100,
          fadeInDurationInMs: 200,
          delayTimeInMs: 300,
          feedback: 0.5,
          reverb: 0.3,
          pan: [0.5, 0.5]
        },
        mode: 'stream',
      };

      speakerTrack.playAsBaseTrack();

      // Verify buffer was set with effects
      expect(mockBufferSource.buffer).not.toBeNull();
    });

    it('should handle BufferEffectsProcessor setup with empty effects', () => {
      const mockBufferSource = {
        loop: false,
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn(),
        onended: null,
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      const mockAudioContext = {
        currentTime: 0,
        createBufferSource: jest.fn().mockReturnValue(mockBufferSource),
        createGain: jest.fn().mockReturnValue({
          gain: {
            value: 0,
            cancelAndHoldAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
          },
          connect: jest.fn(),
          disconnect: jest.fn(),
        }),
        destination: {},
      } as unknown as IAudioContext;

      speakerTrack.audioContext = mockAudioContext;
      speakerTrack.buffer = {} as IAudioBuffer;
      speakerTrack.config = {
        effects: undefined,
        mode: 'stream',
      };

      speakerTrack.playAsBaseTrack();

      // Verify buffer was set with empty effects
      expect(mockBufferSource.buffer).not.toBeNull();
    });
  });

  describe('fadeOutAndStopBufferSource', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle existing stopTimeout', () => {
      const mockStop = jest.fn();
      const mockDisconnect = jest.fn();
      
      speakerTrack.gainNode = {
        gain: {
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: mockDisconnect,
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.bufferSource = {
        stop: mockStop,
        disconnect: mockDisconnect,
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      // Set up an existing timeout
      speakerTrack.stopTimeout = setTimeout(() => {}, 1000);

      speakerTrack.fadeOutAndStopBufferSource();
      
      // Verify the existing timeout was cleared and new one was set
      expect(speakerTrack.stopTimeout).not.toBeNull();
      
      // Fast forward past the fade duration
      jest.advanceTimersByTime(3000);
      
      // Verify cleanup was performed
      expect(mockStop).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalledTimes(2);
      expect(speakerTrack.bufferSource).toBeNull();
      expect(speakerTrack.gainNode).toBeNull();
    });

    it('should not perform fade out if gainNode is missing', () => {
      speakerTrack.bufferSource = {} as IAudioBufferSourceNode<IAudioContext>;
      speakerTrack.gainNode = null;
      const fadingOutSpy = jest.fn();
      speakerTrack.on('fadingOut', fadingOutSpy);

      speakerTrack.fadeOutAndStopBufferSource();
      expect(fadingOutSpy).not.toHaveBeenCalled();
    });

    it('should not perform fade out if bufferSource is missing', () => {
      speakerTrack.gainNode = {} as IGainNode<IAudioContext>;
      speakerTrack.bufferSource = null;
      const fadingOutSpy = jest.fn();
      speakerTrack.on('fadingOut', fadingOutSpy);

      speakerTrack.fadeOutAndStopBufferSource();
      expect(fadingOutSpy).not.toHaveBeenCalled();
    });

    it('should emit fadingOut event and schedule cleanup', () => {
      const mockStop = jest.fn();
      const mockDisconnect = jest.fn();
      
      speakerTrack.gainNode = {
        gain: {
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: mockDisconnect,
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.bufferSource = {
        stop: mockStop,
        disconnect: mockDisconnect,
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      const fadingOutSpy = jest.fn();
      speakerTrack.on('fadingOut', fadingOutSpy);

      speakerTrack.fadeOutAndStopBufferSource();
      
      // Verify fadingOut event was emitted
      expect(fadingOutSpy).toHaveBeenCalled();
      
      // Verify gain node was configured for fade out
      expect(speakerTrack.gainNode?.gain.cancelAndHoldAtTime).toHaveBeenCalled();
      expect(speakerTrack.gainNode?.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.05, expect.any(Number));
      
      // Fast forward past the fade duration
      jest.advanceTimersByTime(3000);
      
      // Verify cleanup was performed
      expect(mockStop).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalledTimes(2);
      expect(speakerTrack.bufferSource).toBeNull();
      expect(speakerTrack.gainNode).toBeNull();
    });

    it('should handle stopTimeout being null', () => {
      const mockStop = jest.fn();
      const mockDisconnect = jest.fn();
      
      speakerTrack.gainNode = {
        gain: {
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: mockDisconnect,
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.bufferSource = {
        stop: mockStop,
        disconnect: mockDisconnect,
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      speakerTrack.stopTimeout = null;

      speakerTrack.fadeOutAndStopBufferSource();
      
      // Verify new timeout was set
      expect(speakerTrack.stopTimeout).not.toBeNull();
      
      // Fast forward past the fade duration
      jest.advanceTimersByTime(3000);
      
      // Verify cleanup was performed
      expect(mockStop).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalledTimes(2);
      expect(speakerTrack.bufferSource).toBeNull();
      expect(speakerTrack.gainNode).toBeNull();
    });
  });

  describe('stopUrgently', () => {
    it('should stop and clear buffer source', () => {
      speakerTrack.bufferSource = {
        stop: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      speakerTrack.stopUrgently();
      expect(speakerTrack.bufferSource).toBeNull();
    });

    it('should not throw when bufferSource is null', () => {
      speakerTrack.bufferSource = null;
      expect(() => speakerTrack.stopUrgently()).not.toThrow();
    });
  });

  describe('fadeBufferSourceToVolume', () => {
    it('should not fade if gainNode is not available', () => {
      speakerTrack.fadeBufferSourceToVolume(0.5);
      expect(speakerTrack.gainNode).toBeNull();
    });

    it('should fade to specified volume', () => {
      const mockGainNode = {
        gain: {
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.gainNode = mockGainNode;
      speakerTrack.fadeBufferSourceToVolume(0.5);

      expect(mockGainNode.gain.cancelAndHoldAtTime).toHaveBeenCalled();
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.5, expect.any(Number));
    });

    it('should use NEARLY_ZERO when volume is falsy', () => {
      const mockGainNode = {
        gain: {
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.gainNode = mockGainNode;
      speakerTrack.fadeBufferSourceToVolume(0);

      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.05, expect.any(Number));
    });

    it('should handle falsy volume values', () => {
      const mockGainNode = {
        gain: {
          cancelAndHoldAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.gainNode = mockGainNode;
      speakerTrack.fadeBufferSourceToVolume(0);

      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.05, expect.any(Number));
    });
  });

  describe('toString', () => {
    it('should return correct string representation', () => {
      expect(speakerTrack.toString()).toBe('SpeakerTrack (1)');
    });

    it('should handle undefined speaker ID', () => {
      const speakerDataWithoutId = {
        ...mockSpeakerData,
        id: 0
      };
      const speakerTrackWithoutId = new SpeakerTrack({
        data: speakerDataWithoutId,
        audioContext: mockAudioContext,
        config: mockConfig,
      });
      expect(speakerTrackWithoutId.toString()).toBe('SpeakerTrack (0)');
    });
  });

  describe('stopAndClearBufferSource', () => {
    it('should handle errors during cleanup', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      speakerTrack.bufferSource = {
        stop: jest.fn().mockImplementation(() => { throw new Error('Stop failed'); }),
        disconnect: jest.fn(),
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      speakerTrack.gainNode = {
        disconnect: jest.fn(),
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.stopAndClearBufferSource();
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle errors during disconnect', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      speakerTrack.bufferSource = {
        stop: jest.fn(),
        disconnect: jest.fn().mockImplementation(() => { throw new Error('Disconnect failed'); }),
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      speakerTrack.gainNode = {
        disconnect: jest.fn().mockImplementation(() => { throw new Error('Disconnect failed'); }),
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.stopAndClearBufferSource();
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle errors during stop and disconnect', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      speakerTrack.bufferSource = {
        stop: jest.fn().mockImplementation(() => { throw new Error('Stop failed'); }),
        disconnect: jest.fn().mockImplementation(() => { throw new Error('Disconnect failed'); }),
      } as unknown as IAudioBufferSourceNode<IAudioContext>;

      speakerTrack.gainNode = {
        disconnect: jest.fn().mockImplementation(() => { throw new Error('Disconnect failed'); }),
      } as unknown as IGainNode<IAudioContext>;

      speakerTrack.stopAndClearBufferSource();
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('attenuationRatio', () => {
    it('should return 0 when attenuationBorderLineString is not set', () => {
      const speakerDataWithoutAttenuation = {
        ...mockSpeakerData,
        attenuation_border: undefined
      };
      const speakerTrackWithoutAttenuation = new SpeakerTrack({
        data: speakerDataWithoutAttenuation,
        audioContext: mockAudioContext,
        config: mockConfig,
      });
      const point: Point = {
        type: 'Point',
        coordinates: [0.5, 0.5],
      };
      expect(speakerTrackWithoutAttenuation.attenuationRatio(point)).toBe(0);
    });
  });
});
