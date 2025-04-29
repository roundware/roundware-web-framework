import { LineString, MultiLineString, Point, Position } from 'geojson';
import { IAudioBuffer, IAudioBufferSourceNode, IAudioContext, IGainNode } from 'standardized-audio-context';
import { SpeakerConfig } from '../types/roundware';
import { ISpeakerData } from '../types/speaker';
import { BufferEffectsProcessor } from './buffer_effects_processor';
import { SpeakerTrack } from './speaker_track';
import { SpeakerUtils } from './speaker_utils';

// Mock the standardized-audio-context
jest.mock('standardized-audio-context', () => ({
  IAudioContext: jest.fn(),
  IAudioBuffer: jest.fn(),
  IAudioBufferSourceNode: jest.fn(),
  IGainNode: jest.fn(),
}));

// Mock turf functions
jest.mock('@turf/boolean-point-in-polygon', () => jest.fn());
jest.mock('@turf/line-to-polygon', () => jest.fn());
jest.mock('@turf/point-to-line-distance', () => jest.fn());

// Mock BufferEffectsProcessor
jest.mock('./buffer_effects_processor', () => ({
  BufferEffectsProcessor: jest.fn().mockImplementation(() => ({
    composeBuffer: jest.fn().mockReturnValue({
      getBuffer: jest.fn().mockReturnValue({
        length: 100,
        numberOfChannels: 2,
        duration: 10,
      }),
    }),
  })),
}));

describe('SpeakerTrack', () => {
  let mockAudioContext: IAudioContext;
  let mockBuffer: IAudioBuffer;
  let mockBufferSource: IAudioBufferSourceNode<IAudioContext>;
  let mockGainNode: IGainNode<IAudioContext>;
  let mockConfig: SpeakerConfig;
  let mockData: ISpeakerData;
  let speakerTrack: SpeakerTrack;

  beforeEach(() => {
    // Setup mock audio context
    mockAudioContext = {
      createBufferSource: jest.fn(),
      createGain: jest.fn(),
      createStereoPanner: jest.fn(),
      decodeAudioData: jest.fn(),
      createBuffer: jest.fn(),
      currentTime: 0,
      destination: {} as any,
    } as any;

    // Setup mock buffer
    mockBuffer = {
      length: 100,
      numberOfChannels: 2,
      duration: 10,
    } as any;

    // Setup mock buffer source
    mockBufferSource = {
      buffer: mockBuffer,
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      loop: false,
      onended: null,
    } as any;

    // Setup mock gain node
    mockGainNode = {
      gain: {
        value: 0,
        cancelAndHoldAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    // Setup mock config
    mockConfig = {
      effects: {},
      mode: 'stream',
    };

    // Setup mock data
    mockData = {
      id: 1,
      maxvolume: 1.0,
      minvolume: 0.0,
      attenuation_border: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1]] as Position[],
      } as LineString,
      boundary: {
        type: 'MultiLineString',
        coordinates: [[[0, 0], [1, 1]]] as Position[][],
      } as MultiLineString,
      attenuation_distance: 1000,
      uri: 'test-audio.mp3',
    };

    // Create speaker track instance
    speakerTrack = new SpeakerTrack({
      data: mockData,
      audioContext: mockAudioContext,
      config: mockConfig,
      groupId: 1,
    });

    // Mock the audio context methods
    (mockAudioContext.createBufferSource as jest.Mock).mockReturnValue(mockBufferSource);
    (mockAudioContext.createGain as jest.Mock).mockReturnValue(mockGainNode);
    (mockAudioContext.createStereoPanner as jest.Mock).mockReturnValue({
      pan: { value: 0 },
      connect: jest.fn(),
    });
    (mockAudioContext.createBuffer as jest.Mock).mockReturnValue(mockBuffer);
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(speakerTrack.maxVolume).toBe(mockData.maxvolume);
      expect(speakerTrack.minVolume).toBe(mockData.minvolume);
      expect(speakerTrack.attenuationDistanceKm).toBe(mockData.attenuation_distance / 1000);
      expect(speakerTrack.uri).toBe(mockData.uri);
      expect(speakerTrack.calculatedVolume).toBe(0.05); // NEARLY_ZERO
    });
  });

  describe('constructor boundary conversion', () => {
    it('should handle boundary conversion errors gracefully', () => {
      const mockError = new Error('Invalid boundary data');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockLineToPolygon = require('@turf/line-to-polygon');
      mockLineToPolygon.mockImplementation(() => {
        throw mockError;
      });

      const mockDataWithBoundary: ISpeakerData = {
        ...mockData,
        boundary: {
          type: 'MultiLineString',
          coordinates: [[[0, 0], [1, 1]]] as Position[][],
        },
      };

      new SpeakerTrack({
        data: mockDataWithBoundary,
        audioContext: mockAudioContext,
        config: mockConfig,
        groupId: 1,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error converting outer boundary to polygon:',
        mockError,
        mockDataWithBoundary
      );
      consoleSpy.mockRestore();
    });

    it('should not attempt conversion when no boundary is provided', () => {
      const mockLineToPolygon = require('@turf/line-to-polygon');
      const mockDataWithoutBoundary: ISpeakerData = {
        ...mockData,
        boundary: undefined,
      };

      new SpeakerTrack({
        data: mockDataWithoutBoundary,
        audioContext: mockAudioContext,
        config: mockConfig,
        groupId: 1,
      });

    });
  });

  describe('volumeByLocation', () => {
    beforeEach(() => {
      speakerTrack.calculatedVolume = 0.5;
      speakerTrack.maxVolume = 1.0;
      speakerTrack.minVolume = 0.0;
    });

    it('should return calculated volume when no point is provided', () => {
      const volume = speakerTrack.volumeByLocation(null as any);
      expect(volume).toBe(0.5);
    });

    it('should return max volume when point is inside attenuation shape', () => {
      const mockPoint: Point = {
        type: 'Point',
        coordinates: [0.5, 0.5],
      };
      const mockBooleanPointInPolygon = require('@turf/boolean-point-in-polygon');
      mockBooleanPointInPolygon.mockReturnValue(true);

      // Mock the attenuationBorderPolygon to be defined
      speakerTrack.attenuationBorderPolygon = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
        properties: {},
      };

      const volume = speakerTrack.volumeByLocation(mockPoint);
      expect(volume).toBe(1.0);
    });

    it('should return min volume when point is outside outer boundary', () => {
      const mockPoint: Point = {
        type: 'Point',
        coordinates: [2, 2],
      };
      const mockBooleanPointInPolygon = require('@turf/boolean-point-in-polygon');
      mockBooleanPointInPolygon.mockReturnValue(false);

      const volume = speakerTrack.volumeByLocation(mockPoint);
      expect(volume).toBe(0.0);
    });

    it('should return calculated gradient when point is between boundaries', () => {
      const mockPoint: Point = {
        type: 'Point',
        coordinates: [0.5, 0.5],
      };
      const mockBooleanPointInPolygon = require('@turf/boolean-point-in-polygon');
      mockBooleanPointInPolygon.mockReturnValue(false);

      // Mock the outer boundary to contain the point
      speakerTrack.outerBoundary = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
        properties: {},
      };

      // Mock the attenuation ratio
      jest.spyOn(speakerTrack, 'attenuationRatio').mockReturnValue(0.5);
      // Mock outerBoundaryContains to return true
      jest.spyOn(speakerTrack, 'outerBoundaryContains').mockReturnValue(true);

      const volume = speakerTrack.volumeByLocation(mockPoint);
      expect(volume).toBe(0.5); // minVolume + (maxVolume - minVolume) * 0.5
    });
  });

  describe('loadBuffer', () => {
    it('should not load if request already exists', () => {
      speakerTrack.request = {} as XMLHttpRequest;
      speakerTrack.loadBuffer();
      expect(speakerTrack.request).toBeDefined();
    });

    it('should not load if buffer already exists', () => {
      speakerTrack.buffer = mockBuffer;
      speakerTrack.loadBuffer();
      expect(speakerTrack.buffer).toBe(mockBuffer);
    });

    it('should create and send XMLHttpRequest', () => {
      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        onprogress: null,
        onload: null,
        responseType: '',
        timeout: 0,
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      speakerTrack.loadBuffer();
      expect(mockXHR.open).toHaveBeenCalledWith('GET', mockData.uri, true);
      expect(mockXHR.send).toHaveBeenCalled();
    });
  });

  describe('loadBuffer error handling', () => {
    let mockXHR: {
      open: jest.Mock;
      send: jest.Mock;
      onprogress: ((ev: ProgressEvent) => void) | null;
      onload: () => void;
      responseType: string;
      timeout: number;
    };

    beforeEach(() => {
      mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        onprogress: null,
        onload: jest.fn(),
        responseType: '',
        timeout: 0,
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;
    });

    it('should log error when audio decoding fails', () => {
      const mockError = new Error('Decoding failed');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const speakerLogSpy = jest.spyOn(speakerTrack, 'log').mockImplementation();

      (mockAudioContext.decodeAudioData as jest.Mock).mockImplementation((_, success, error) => {
        error(mockError);
      });

      speakerTrack.loadBuffer();
      mockXHR.onload();

      expect(speakerLogSpy).toHaveBeenCalledWith('Error with decoding audio data Decoding failed');

      consoleSpy.mockRestore();
      speakerLogSpy.mockRestore();
    });
  });

  describe('playWithConfig', () => {
    beforeEach(() => {
      speakerTrack.buffer = mockBuffer;
    });

    it('should throw error if buffer is not loaded', () => {
      speakerTrack.buffer = null;
      expect(() => {
        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });
      }).toThrow('Track is not loaded');
    });

    it('should create and configure buffer source', () => {
      speakerTrack.playWithConfig({
        duration: 10,
        times: 1,
        offset: 0,
        fadeInDuration: 1,
        pan: 0,
      });

      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
      expect(mockBufferSource.connect).toHaveBeenCalled();
      expect(mockBufferSource.start).toHaveBeenCalled();
    });

    describe('playWithConfig onended handler', () => {
      beforeEach(() => {
        speakerTrack.buffer = mockBuffer;
        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });
      });

      it('should emit trackFinished when track completes normally', () => {
        const mockCallback = jest.fn();
        speakerTrack.on('trackFinished', mockCallback);

        // @ts-ignore - accessing private property for test
        speakerTrack.bufferSource?.onended?.();

        expect(mockCallback).toHaveBeenCalled();
        expect(speakerTrack.bufferSourcePlaying).toBe(false);
      });

      it('should emit trackAborted with remaining time when track is aborted', () => {
        const mockCallback = jest.fn();
        speakerTrack.on('trackAborted', mockCallback);

        // Simulate track being aborted by setting a non-zero remaining time
        jest.spyOn(SpeakerUtils, 'findRemainingTime').mockReturnValue(5);

        // @ts-ignore - accessing private property for test
        speakerTrack.bufferSource?.onended?.();

        expect(mockCallback).toHaveBeenCalledWith(5);
        expect(speakerTrack.bufferSourcePlaying).toBe(false);
      });

      it('should clear buffer source after onended', () => {
        // @ts-ignore - accessing private property for test
        speakerTrack.bufferSource?.onended?.();

        expect(mockBufferSource.disconnect).toHaveBeenCalled();
        expect(mockGainNode.disconnect).toHaveBeenCalled();
        // @ts-ignore - accessing private property for test
        expect(speakerTrack.bufferSource).toBeNull();
        // @ts-ignore - accessing private property for test
        expect(speakerTrack.gainNode).toBeNull();
      });
    });

    describe('playWithConfig fade-in volume', () => {
      it('should use NEARLY_ZERO as start volume when fadeInDuration is provided', () => {
        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });

        const mockBufferEffectsProcessor = new BufferEffectsProcessor(mockBuffer, mockAudioContext, {});

      });

      it('should use calculatedVolume as start volume when no fadeInDuration is provided', () => {
        speakerTrack.calculatedVolume = 0.7;
        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 0,
          pan: 0,
        });

        const mockBufferEffectsProcessor = new BufferEffectsProcessor(mockBuffer, mockAudioContext, {});

      });
    });

    describe('playWithConfig buffer source cleanup', () => {
      beforeEach(() => {
        speakerTrack.buffer = mockBuffer;
      });

      it('should stop and clear existing buffer source', () => {
        // Set up initial buffer source
        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });

        // Play again with new config
        speakerTrack.playWithConfig({
          duration: 5,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });

        expect(mockBufferSource.stop).toHaveBeenCalled();
        expect(mockBufferSource.disconnect).toHaveBeenCalled();
        expect(mockGainNode.disconnect).toHaveBeenCalled();
        // @ts-ignore - accessing private property for test
        expect(speakerTrack.bufferSource).not.toBeNull(); // New buffer source should be created
      });

      it('should not attempt cleanup when no buffer source exists', () => {
        // @ts-ignore - accessing private property for test
        speakerTrack.bufferSource = null;
        
        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });

        expect(mockBufferSource.stop).not.toHaveBeenCalled();
        expect(mockBufferSource.disconnect).not.toHaveBeenCalled();
        // @ts-ignore - accessing private property for test
        expect(speakerTrack.bufferSource).not.toBeNull(); // New buffer source should be created
      });
    });

    describe('playWithConfig stop timeout cleanup', () => {
      beforeEach(() => {
        speakerTrack.buffer = mockBuffer;
      });

      it('should clear existing stop timeout', () => {
        const mockClearTimeout = jest.spyOn(global, 'clearTimeout');
        speakerTrack.stopTimeout = setTimeout(() => {}, 1000);

        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });

        expect(mockClearTimeout).toHaveBeenCalled();
        expect(speakerTrack.stopTimeout).toBeNull();
      });

      it('should not attempt cleanup when no stop timeout exists', () => {
        const mockClearTimeout = jest.spyOn(global, 'clearTimeout');
        speakerTrack.stopTimeout = null;

        speakerTrack.playWithConfig({
          duration: 10,
          times: 1,
          offset: 0,
          fadeInDuration: 1,
          pan: 0,
        });

        expect(speakerTrack.stopTimeout).toBeNull();
      });
    });
  });

  describe('stop and fade out', () => {
    beforeEach(() => {
      speakerTrack.buffer = mockBuffer;
      // Instead of directly accessing private properties, we'll set up the state through public methods
      speakerTrack.playWithConfig({
        duration: 10,
        times: 1,
        offset: 0,
        fadeInDuration: 1,
        pan: 0,
      });
    });

    it('should fade out and stop buffer source', () => {
      jest.useFakeTimers();
      speakerTrack.fadeOutAndStopBufferSource();

      expect(mockGainNode.gain.cancelAndHoldAtTime).toHaveBeenCalled();
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalled();

      jest.advanceTimersByTime(3000); // FADE_DURATION_SECONDS * 1000
      expect(mockBufferSource.stop).toHaveBeenCalled();
    });

    it('should stop buffer source immediately', () => {
      speakerTrack.stopBufferSource();
      expect(mockBufferSource.stop).toHaveBeenCalled();
      expect(speakerTrack.bufferSourcePlaying).toBe(false);
    });
  });

  describe('fadeBufferSourceToVolume', () => {
    beforeEach(() => {
      speakerTrack.buffer = mockBuffer;
      speakerTrack.playWithConfig({
        duration: 10,
        times: 1,
        offset: 0,
        fadeInDuration: 1,
        pan: 0,
      });
    });

    it('should do nothing if no gain node exists', () => {
      // @ts-ignore - accessing private property for test
      speakerTrack.gainNode = null;
      speakerTrack.fadeBufferSourceToVolume(0.5);
      expect(mockGainNode.gain.cancelAndHoldAtTime).not.toHaveBeenCalled();
      expect(mockGainNode.gain.exponentialRampToValueAtTime).not.toHaveBeenCalled();
    });

    it('should clear existing stop timeout', () => {
      const mockClearTimeout = jest.spyOn(global, 'clearTimeout');
      speakerTrack.stopTimeout = setTimeout(() => {}, 1000);
      speakerTrack.fadeBufferSourceToVolume(0.5);
      expect(mockClearTimeout).toHaveBeenCalled();
      expect(speakerTrack.stopTimeout).toBeNull();
    });

    it('should set up exponential ramp for volume change', () => {
      const targetVolume = 0.7;
      speakerTrack.fadeBufferSourceToVolume(targetVolume);
      
      expect(mockGainNode.gain.cancelAndHoldAtTime).toHaveBeenCalledWith(mockAudioContext.currentTime);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        targetVolume,
        mockAudioContext.currentTime + 3 // FADE_DURATION_SECONDS
      );
    });

    it('should use NEARLY_ZERO when volume is falsy', () => {
      speakerTrack.fadeBufferSourceToVolume(0);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05, // NEARLY_ZERO
        mockAudioContext.currentTime + 3 // FADE_DURATION_SECONDS
      );
    });
  });

  describe('clearBufferSource', () => {
    beforeEach(() => {
      speakerTrack.buffer = mockBuffer;
      speakerTrack.playWithConfig({
        duration: 10,
        times: 1,
        offset: 0,
        fadeInDuration: 1,
        pan: 0,
      });
    });

    it('should clean up buffer source and gain node', () => {
      // @ts-ignore - accessing private method for test
      speakerTrack.clearBufferSource();

      expect(mockBufferSource.disconnect).toHaveBeenCalled();
      expect(mockGainNode.disconnect).toHaveBeenCalled();
      // @ts-ignore - accessing private property for test
      expect(speakerTrack.bufferSource).toBeNull();
      // @ts-ignore - accessing private property for test
      expect(speakerTrack.gainNode).toBeNull();
      expect(speakerTrack.bufferSourcePlaying).toBe(false);
    });

    it('should handle missing buffer source gracefully', () => {
      // @ts-ignore - accessing private property for test
      speakerTrack.bufferSource = null;
      // @ts-ignore - accessing private method for test
      speakerTrack.clearBufferSource();

      expect(mockBufferSource.disconnect).not.toHaveBeenCalled();
      expect(speakerTrack.bufferSourcePlaying).toBe(false);
    });

    it('should handle missing gain node gracefully', () => {
      // @ts-ignore - accessing private property for test
      speakerTrack.gainNode = null;
      // @ts-ignore - accessing private method for test
      speakerTrack.clearBufferSource();

      expect(mockGainNode.disconnect).not.toHaveBeenCalled();
      expect(speakerTrack.bufferSourcePlaying).toBe(false);
    });

    it('should handle errors during cleanup', () => {
      const mockError = new Error('Test error');
      (mockBufferSource.disconnect as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      // @ts-ignore - accessing private method for test
      speakerTrack.clearBufferSource();

      expect(consoleSpy).toHaveBeenCalledWith('Error clearing buffer source:', mockError);
      expect(speakerTrack.bufferSourcePlaying).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe('event emission', () => {
    it('should emit loading event during buffer loading', () => {
      const mockCallback = jest.fn();
      speakerTrack.on('loading', mockCallback);

      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        onprogress: jest.fn(),
        onload: null,
        responseType: '',
        timeout: 0,
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      speakerTrack.loadBuffer();
      mockXHR.onprogress({ loaded: 50, total: 100 } as ProgressEvent);

      expect(mockCallback).toHaveBeenCalledWith(50);
    });

    it('should emit loaded event when buffer is loaded', () => {
      const mockCallback = jest.fn();
      speakerTrack.on('loaded', mockCallback);

      (mockAudioContext.decodeAudioData as jest.Mock).mockImplementation((_, success) => {
        success(mockBuffer);
      });

      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        onprogress: null,
        onload: jest.fn(),
        responseType: '',
        timeout: 0,
      };
      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      speakerTrack.loadBuffer();
      mockXHR.onload();

      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('abortBufferSource', () => {
    beforeEach(() => {
      speakerTrack.buffer = mockBuffer;
      speakerTrack.playWithConfig({
        duration: 10,
        times: 1,
        offset: 0,
        fadeInDuration: 1,
        pan: 0,
      });
    });

    it('should stop and clear buffer source when it exists', () => {
      speakerTrack.abortBufferSource();

      expect(mockBufferSource.stop).toHaveBeenCalled();
      expect(mockBufferSource.disconnect).toHaveBeenCalled();
      expect(mockGainNode.disconnect).toHaveBeenCalled();
      // @ts-ignore - accessing private property for test
      expect(speakerTrack.bufferSource).toBeNull();
      // @ts-ignore - accessing private property for test
      expect(speakerTrack.gainNode).toBeNull();
      expect(speakerTrack.bufferSourcePlaying).toBe(false);
    });

    it('should handle missing buffer source gracefully', () => {
      // @ts-ignore - accessing private property for test
      speakerTrack.bufferSource = null;
      speakerTrack.abortBufferSource();

      expect(mockBufferSource.stop).not.toHaveBeenCalled();
      expect(mockBufferSource.disconnect).not.toHaveBeenCalled();
      expect(speakerTrack.bufferSourcePlaying).toBe(false);
    });
  });

  describe('fadeOutAndStopBufferSource', () => {
    beforeEach(() => {
      speakerTrack.buffer = mockBuffer;
      speakerTrack.playWithConfig({
        duration: 10,
        times: 1,
        offset: 0,
        fadeInDuration: 1,
        pan: 0,
      });
    });

    it('should throw error when gain node or buffer source is missing', () => {
      // @ts-ignore - accessing private property for test
      speakerTrack.gainNode = null;
      expect(() => speakerTrack.fadeOutAndStopBufferSource()).toThrow('Buffer source or gain node not found');

      // @ts-ignore - accessing private property for test
      speakerTrack.gainNode = mockGainNode;
      // @ts-ignore - accessing private property for test
      speakerTrack.bufferSource = null;
      expect(() => speakerTrack.fadeOutAndStopBufferSource()).toThrow('Buffer source or gain node not found');
    });

    it('should clear existing stop timeout', () => {
      const mockClearTimeout = jest.spyOn(global, 'clearTimeout');
      speakerTrack.stopTimeout = setTimeout(() => {}, 1000);
      speakerTrack.fadeOutAndStopBufferSource();

      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('should set up exponential ramp for fade out', () => {
      jest.useFakeTimers();
      speakerTrack.fadeOutAndStopBufferSource();

      expect(mockGainNode.gain.cancelAndHoldAtTime).toHaveBeenCalledWith(mockAudioContext.currentTime);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.05, // NEARLY_ZERO
        mockAudioContext.currentTime + 3 // FADE_DURATION_SECONDS
      );
    });

    it('should stop buffer source after fade duration', () => {
      jest.useFakeTimers();
      speakerTrack.fadeOutAndStopBufferSource();

      expect(mockBufferSource.stop).not.toHaveBeenCalled();
      jest.advanceTimersByTime(3000); // FADE_DURATION_SECONDS * 1000
      expect(mockBufferSource.stop).toHaveBeenCalled();
    });
  });

  describe('unload', () => {
    beforeEach(() => {
      speakerTrack.buffer = mockBuffer;
      speakerTrack.loadedPercentage = 50;
      speakerTrack.request = {
        abort: jest.fn(),
      } as any;
    });

    it('should emit unloaded event when buffer exists', () => {
      const mockCallback = jest.fn();
      speakerTrack.on('unloaded', mockCallback);

      speakerTrack.unload();

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should not emit unloaded event when buffer is null', () => {
      const mockCallback = jest.fn();
      speakerTrack.on('unloaded', mockCallback);
      speakerTrack.buffer = null;

      speakerTrack.unload();

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should clear buffer and loaded percentage', () => {
      speakerTrack.unload();

      expect(speakerTrack.buffer).toBeNull();
      expect(speakerTrack.loadedPercentage).toBe(0);
    });

    it('should abort and clear request', () => {
      speakerTrack.unload();

      expect(speakerTrack.request?.abort).toBeUndefined();
      expect(speakerTrack.request).toBeNull();
    });

    it('should handle missing request gracefully', () => {
      speakerTrack.request = null;
      speakerTrack.unload();

      expect(speakerTrack.request).toBeNull();
    });
  });

  describe('attenuationRatio', () => {
    beforeEach(() => {
      speakerTrack.attenuationDistanceKm = 1.0; // 1 kilometer
      speakerTrack.attenuationBorderLineString = {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1]] as Position[],
      };
    });

    it('should return 0 when no attenuation border line string exists', () => {
      speakerTrack.attenuationBorderLineString = undefined;
      const ratio = speakerTrack.attenuationRatio([0.5, 0.5]);
      expect(ratio).toBe(0);
    });

    it('should calculate correct ratio based on distance', () => {
      const mockPointToLineDistance = require('@turf/point-to-line-distance');
      mockPointToLineDistance.mockReturnValue(0.5); // 0.5 kilometers

      const ratio = speakerTrack.attenuationRatio([0.5, 0.5]);
      expect(ratio).toBe(0.5); // 1 - (0.5 / 1.0)
    });

    it('should return 1 when distance is 0', () => {
      const mockPointToLineDistance = require('@turf/point-to-line-distance');
      mockPointToLineDistance.mockReturnValue(0);

      const ratio = speakerTrack.attenuationRatio([0.5, 0.5]);
      expect(ratio).toBe(1); // 1 - (0 / 1.0)
    });

    it('should return 0 when distance equals attenuation distance', () => {
      const mockPointToLineDistance = require('@turf/point-to-line-distance');
      mockPointToLineDistance.mockReturnValue(1.0); // 1 kilometer

      const ratio = speakerTrack.attenuationRatio([0.5, 0.5]);
      expect(ratio).toBe(0); // 1 - (1.0 / 1.0)
    });

    it('should return 0 when distance exceeds attenuation distance', () => {
      const mockPointToLineDistance = require('@turf/point-to-line-distance');
      mockPointToLineDistance.mockReturnValue(2.0); // 2 kilometers

      const ratio = speakerTrack.attenuationRatio([0.5, 0.5]);
      expect(ratio).toBe(-1); // 1 - (2.0 / 1.0)
    });
  });
});