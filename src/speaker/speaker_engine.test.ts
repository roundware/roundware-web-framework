// src/speaker/speaker_engine.test.ts
import { SpeakerEngine } from './speaker_engine';
import { SpeakerTrack } from './speaker_track';
import { SpeakerVolumeProcessor } from './speaker_volume_processor';
import { IAudioContext } from 'standardized-audio-context';
import { IMixParams } from '../types'; // Assuming the interface is in this relative path
import { SpeakerPrefetchSyncPlayer } from './players/SpeakerPrefetchSyncPlayer';

// Mock dependencies
jest.mock('./speaker_track', () => {
  return {
    SpeakerTrack: jest.fn().mockImplementation((options: any) => {
      return {
        player: {
          onEnd: jest.fn(),
          fadeOutAndPause: jest.fn(),
          removeEventListener: jest.fn(),
          addEventListener: jest.fn(),
          timerStart: jest.fn(),
          timerStop: jest.fn(),
          pause: jest.fn(),
          replay: jest.fn(),
        },
        updateVolume: jest.fn(),
        play: jest.fn(),
        speakerId: 1, // Mock speakerId
      };
    }),
  };
});

jest.mock('./speaker_volume_processor', () => {
  const mockVolumeProcessor = {
    clearHolds: jest.fn().mockReturnThis(),
    byLocation: jest.fn().mockReturnThis(),
    holdMinVolumes: jest.fn().mockReturnThis(),
    holdRoot: jest.fn().mockReturnThis(),
    restToZero: jest.fn().mockReturnThis(),
    maxNRandom: jest.fn(),
    logHoldlist: jest.fn(),
    holdList: [],
  };
  return {
    SpeakerVolumeProcessor: jest.fn(() => mockVolumeProcessor),
    mockVolumeProcessor // Export the mock instance for assertions
  };
});

jest.mock('../helpers/Logger');

describe('SpeakerEngine', () => {
  let speakerEngine: SpeakerEngine;
  let mockAudioContext: IAudioContext;
  let mockSpeakers: any[];
  let mockMixParams: IMixParams;
  let SpeakerTrackMock: jest.Mock;
  let SpeakerVolumeProcessorMock: jest.Mock;
  let mockVolumeProcessor: any;

  beforeEach(() => {
    // Setup mock data
    mockAudioContext = {
      // Add required AudioContext mock properties
    } as IAudioContext;

    mockSpeakers = [
      { id: 1, name: 'speaker1' },
      { id: 2, name: 'speaker2' }
    ];

    mockMixParams = {
      listenerPoint: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {}
      },
      speakerConfig: {
        mode: 'stream-sync',
        loop: false
      }
    };

    SpeakerTrackMock = SpeakerTrack as jest.Mock; // Get the mock constructor
    SpeakerVolumeProcessorMock = SpeakerVolumeProcessor as jest.Mock;
    mockVolumeProcessor = (require('./speaker_volume_processor') as any).mockVolumeProcessor; // Access the mock instance
    jest.clearAllMocks(); // Clear mocks before each test
    speakerEngine = new SpeakerEngine(mockSpeakers, mockAudioContext, mockMixParams);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(speakerEngine.playing).toBeFalsy();
      expect(speakerEngine.endedSpeakersLength).toBe(0);
      expect(speakerEngine.speakerTracks).toBeDefined();
      expect(speakerEngine.volumeProcessor).toBeDefined();
    });

    it('should create speaker tracks for each speaker', () => {
      expect(speakerEngine.speakerTracks?.length).toBe(mockSpeakers.length);
      expect(SpeakerTrackMock).toHaveBeenCalledTimes(mockSpeakers.length);
    });
  });

  describe('updateParams', () => {
    it('should update playing state and mix parameters', () => {
      const newParams: IMixParams = {
        listenerPoint: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [1, 1]
          },
          properties: {}
        }
      };

      speakerEngine.updateParams(true, newParams);

      expect(speakerEngine.playing).toBeTruthy();
      expect(speakerEngine.listenerPoint).toBe(newParams.listenerPoint?.geometry);
    });
  });

  describe('updateVolumes', () => {
    it('should fade out and pause tracks when not playing', () => {
      const mockFadeOutAndPause = jest.fn();
      (speakerEngine.speakerTracks as any) = [
        { player: { fadeOutAndPause: mockFadeOutAndPause } }
      ];
      speakerEngine.playing = false;

      speakerEngine.updateVolumes();

      expect(mockFadeOutAndPause).toHaveBeenCalled();
    });

    it('should update volumes when playing', () => {
      speakerEngine.playing = true;
      speakerEngine.updateVolumes();

      // Assert that the methods were called on the mock instance
      expect(mockVolumeProcessor.clearHolds).toHaveBeenCalled();
      expect(mockVolumeProcessor.byLocation).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('loop listeners', () => {
    let mockTrack: any;

    beforeEach(() => {
      mockTrack = {
        player: {
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        }
      };
    });

    it('should add loop listener correctly', () => {
      speakerEngine.addLoopListener(mockTrack);

      expect(mockTrack.player.addEventListener).toHaveBeenCalledWith(
        'loop',
        expect.any(Function)
      );
      expect(speakerEngine.loopListening).toContain(mockTrack);
    });

    it('should remove all loop listeners', () => {
      speakerEngine.loopListening = [mockTrack];
      speakerEngine.removeAllLoopListeners();

      expect(mockTrack.player.removeEventListener).toHaveBeenCalledWith(
        'loop',
        expect.any(Function)
      );
    });
  });

  describe('handleSpeakerEnd', () => {
    it('should increment endedSpeakersLength', () => {
      speakerEngine.handleSpeakerEnd();
      expect(speakerEngine.endedSpeakersLength).toBe(1);
    });

    it('should call allSpeakersEndCallback when all speakers end', () => {
      const mockCallback = jest.fn();
      speakerEngine.onAllSpeakersEnd(mockCallback);
      speakerEngine.speakerTracks = [{}, {}] as any;
      
      speakerEngine.handleSpeakerEnd();
      speakerEngine.handleSpeakerEnd();

      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('playback controls', () => {
    beforeEach(() => {
      (speakerEngine.speakerTracks as any) = [
        { player: { pause: jest.fn(), replay: jest.fn(), timerStart: jest.fn(), timerStop: jest.fn() }, play: jest.fn(), pause: jest.fn() }
      ];
    });

    it('should handle replay correctly', () => {
      speakerEngine.replay();
      
      expect(speakerEngine.endedSpeakersLength).toBe(0);
      expect((speakerEngine.speakerTracks as any)[0].player.pause).toHaveBeenCalled();
      expect((speakerEngine.speakerTracks as any)[0].player.replay).toHaveBeenCalled();
    });

    it('should handle play correctly', () => {
      speakerEngine.play();
      
      expect((speakerEngine.speakerTracks as any)[0].player.timerStart).toHaveBeenCalled();
      expect((speakerEngine.speakerTracks as any)[0].play).toHaveBeenCalled();
    });

    it('should handle stop correctly', () => {
      speakerEngine.stop();
      
      expect((speakerEngine.speakerTracks as any)[0].player.timerStop).toHaveBeenCalled();
      expect((speakerEngine.speakerTracks as any)[0].pause).toHaveBeenCalled();
    });
  });
  

});