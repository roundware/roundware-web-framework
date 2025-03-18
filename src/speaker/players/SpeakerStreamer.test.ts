import { SpeakerStreamer } from './SpeakerStreamer';
import { cleanAudioURL, silenceAudioBase64, speakerLog } from '../../utils';
import { log } from 'loglevel';

// Mock dependencies
jest.mock('../../utils', () => ({
  cleanAudioURL: jest.fn((url) => url),
  silenceAudioBase64: 'data:audio/wav;base64,mock',
  speakerLog: jest.fn(),
}));

describe('SpeakerStreamer', () => {
  let speakerStreamer: SpeakerStreamer;
  let mockAudioContext: any;
  let mockGainNode: any;
  let mockMediaElementSource: any;
  let mockAudioElement: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Audio element
    mockAudioElement = {
      addEventListener: jest.fn(),
      load: jest.fn(),
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      crossOrigin: '',
      preload: '',
      src: '',
      loop: false,
      autoplay: false,
      currentTime: 0,
      onended: null,
    };
    global.Audio = jest.fn().mockImplementation(() => mockAudioElement);

    // Mock AudioContext and related objects
    mockGainNode = {
      connect: jest.fn(),
      gain: {
        value: 0,
        linearRampToValueAtTime: jest.fn(),
        cancelScheduledValues: jest.fn()
      },
    };

    mockMediaElementSource = {
      connect: jest.fn(),
    };

    mockAudioContext = {
      createGain: jest.fn(() => mockGainNode),
      createMediaElementSource: jest.fn(() => mockMediaElementSource),
      destination: {},
      state: 'running',
      resume: jest.fn().mockResolvedValue(undefined),
    };

    // Create instance
    speakerStreamer = new SpeakerStreamer({
      audioContext: mockAudioContext,
      uri: 'test-uri',
      id: 1,
      config: {
        mode: "prefetch"
      },
    });

    
  });

  describe('constructor', () => {
    it('should initialize with correct default values', () => {
      expect(speakerStreamer.playing).toBeFalsy();
      expect(speakerStreamer.fading).toBeFalsy();
      expect(speakerStreamer.id).toBe(1);
      expect(speakerStreamer.isSafeToPlay).toBeFalsy();
      expect(speakerStreamer.loaded).toBeTruthy();
      expect(speakerStreamer.loadedPercentage).toBe(100);
    });

    it('should set up audio element correctly', () => {
      expect(speakerStreamer.audio.crossOrigin).toBe('anonymous');
      expect(speakerStreamer.audio.preload).toBe('none');
      expect(speakerStreamer.audio.src).toBe(silenceAudioBase64);
      expect(speakerStreamer.audio.loop).toBeTruthy();
      expect(speakerStreamer.audio.autoplay).toBeFalsy();
    });

    it('should attach event listeners to the audio element', () => {
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('playing', expect.any(Function));
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('pause', expect.any(Function));
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('about', expect.any(Function));
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('waiting', expect.any(Function));
    });

    it('should handle the playing event', () => {
      const calls = (speakerStreamer.audio.addEventListener as jest.Mock).mock.calls;
      const playingCall = calls.find(call => call[0] === 'playing');

      if (playingCall) {
        const playingCallback = playingCall[1];
        speakerStreamer.isSafeToPlay = true;
        playingCallback();
        expect(speakerStreamer.playing).toBe(true);
        expect(speakerLog).toHaveBeenCalled();
      }
    });

    it('should handle the ended, error, pause, about events', () => {
      const events = ['ended', 'error', 'pause', 'about'];

      events.forEach(event => {
        const calls = (speakerStreamer.audio.addEventListener as jest.Mock).mock.calls;
        const eventCall = calls.find(call => call[0] === event);

        if (eventCall) {
          const eventCallback = eventCall[1];
          speakerStreamer.isSafeToPlay = true;
          speakerStreamer.playing = true;
          eventCallback();
          expect(speakerStreamer.playing).toBe(false);
          expect(speakerLog).toHaveBeenCalled();
        }
      });
    });

    it('should handle the load event', () => {
      // Ensure that addEventListener is a jest mock so we can inspect its calls.
      // If your FakeAudio isn’t already a jest.fn, wrap it.
      speakerStreamer.audio.addEventListener = jest.fn(
        speakerStreamer.audio.addEventListener.bind(speakerStreamer.audio)
      );
  
      // Recreate the load event listener as it was set during construction.
      // (Alternatively, you can create a new instance after setting the global Audio mock.)
      speakerStreamer = new SpeakerStreamer({
        audioContext: mockAudioContext,
        uri: 'test-uri',
        id: 1,
        config: { mode: "prefetch" },
      });
  
      // Set isSafeToPlay to true so that the log function actually calls speakerLog.
      speakerStreamer.isSafeToPlay = true;
  
      // Grab the "load" event callback from the spy call.
      const calls = (speakerStreamer.audio.addEventListener as jest.Mock).mock.calls;
      const loadCall = calls.find((call) => call[0] === 'load');
      if (loadCall) {
        const loadCallback = loadCall[1];
        // Invoke the callback – it should call this.log which will then call speakerLog
        loadCallback();
        expect(speakerLog).toHaveBeenCalledWith('1: loading audio...');
      } else {
        fail('Load event listener was not added');
      }
    });

    it('should handle the waiting event', () => {
      // Set to true so that the log() function actually logs via speakerLog.
      speakerStreamer.isSafeToPlay = true;
    
      // Get the registered waiting event listener from addEventListener calls.
      const calls = (speakerStreamer.audio.addEventListener as jest.Mock).mock.calls;
      const waitingCall = calls.find(call => call[0] === 'waiting');
      
      if (waitingCall) {
        const waitingCallback = waitingCall[1];
        waitingCallback();
        // Since speakerLog prepends "1: " (the speaker id) to the message, verify the full string.
        expect(speakerLog).toHaveBeenCalledWith(`1: waiting to load... ${speakerStreamer.audio.src}`);
      } else {
        fail('Waiting event listener was not added');
      }
    });
    
  });

  describe('play', () => {
    it('should return false if not safe to play', async () => {
      speakerStreamer.isSafeToPlay = false;
      const result = await speakerStreamer.play();
      expect(result).toBeFalsy();
    });

    it('should return false if already trying to play', async () => {
      speakerStreamer.isSafeToPlay = true;
      speakerStreamer['_alreadyTryingToPlay'] = true;
      const result = await speakerStreamer.play();
      expect(result).toBeFalsy();
    });

    it('should return true if already playing', async () => {
      speakerStreamer.isSafeToPlay = true;
      speakerStreamer.playing = true;
      const result = await speakerStreamer.play();
      expect(result).toBeTruthy();
    });

    it('should successfully play audio', async () => {
      speakerStreamer.isSafeToPlay = true;
      const result = await speakerStreamer.play();
      expect(result).toBeTruthy();
      expect(speakerStreamer.isSafeToPlay).toBeTruthy();
    });

    it('should resume audio context if it is suspended', async () => {
      speakerStreamer.isSafeToPlay = true;
      mockAudioContext.state = 'suspended';
      await speakerStreamer.play();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should handle play error', async () => {
      speakerStreamer.isSafeToPlay = true;
      mockAudioElement.play.mockRejectedValue(new Error('Play error'));
      const result = await speakerStreamer.play();
      expect(result).toBeFalsy();
      expect(speakerStreamer['_alreadyTryingToPlay']).toBeFalsy();
      expect(speakerLog).toHaveBeenCalled();
    });
  });

  describe('volume', () => {
    it('should return current gain value', () => {
      mockGainNode.gain.value = 0.5;
      expect(speakerStreamer.volume()).toBe(0.5);
    });
  });

  describe('log', () => {
    it('should call speakerLog when isSafeToPlay is true', () => {
      speakerStreamer.isSafeToPlay = true;
      speakerStreamer.log('test message');
      expect(speakerLog).toHaveBeenCalledWith('1: test message');
    });

    it('should not call speakerLog when isSafeToPlay is false', () => {
      speakerStreamer.isSafeToPlay = false;
      speakerStreamer.log('test message');
      expect(speakerLog).not.toHaveBeenCalled();
    });

    it('should call speakerLog when force is true regardless of isSafeToPlay', () => {
      speakerStreamer.isSafeToPlay = false;
      speakerStreamer.log('test message', true);
      expect(speakerLog).toHaveBeenCalledWith('1: test message');
    });

    it('should call log', () => {
      speakerStreamer.isSafeToPlay = true;
      speakerStreamer.log("Test log message");
      expect(speakerLog).toHaveBeenCalledWith("1: Test log message");
    });
  });

  describe('pause', () => {
    it('should pause audio if playing', () => {
      speakerStreamer.playing = true;
      speakerStreamer.pause();
      expect(speakerStreamer.audio.pause).toHaveBeenCalled();
      expect(speakerStreamer.playing).toBeFalsy();
    });

    it('should not call pause if not playing', () => {
      speakerStreamer.playing = false;
      speakerStreamer.pause();
      expect(speakerStreamer.audio.pause).not.toHaveBeenCalled();
    });
  });

  describe('fade', () => {
    it('should not fade if already fading to the same destination', () => {
      speakerStreamer._fadingDestination = 0.5;
      speakerStreamer._fading = true;
      speakerStreamer.fade(0.5);
      expect(mockGainNode.gain.cancelScheduledValues).not.toHaveBeenCalled();
    });

    it('should not fade if volume is close to destination', () => {
      mockGainNode.gain.value = 0.52;
      speakerStreamer.fade(0.5);
      expect(mockGainNode.gain.cancelScheduledValues).not.toHaveBeenCalled();
    });

    it('should fade when playing and safe to play', () => {
      speakerStreamer.playing = true;
      speakerStreamer.isSafeToPlay = true;
      speakerStreamer.fade(0.5, 2);
      expect(mockGainNode.gain.cancelScheduledValues).toHaveBeenCalledWith(0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, expect.any(Number));
    });

    it('should schedule fade when not playing or not safe to play', () => {
      speakerStreamer.playing = false;
      speakerStreamer.isSafeToPlay = false;
      speakerStreamer.fade(0.5, 2);
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('playing', expect.any(Function), { once: true });
    });
  });

  describe('fadeOutAndPause', () => {
    it('should not fade out and pause if not playing', () => {
      speakerStreamer.playing = false;
      speakerStreamer.fadeOutAndPause();
      expect(mockGainNode.gain.linearRampToValueAtTime).not.toHaveBeenCalled();
      expect(speakerStreamer.audio.pause).not.toHaveBeenCalled();
    });

    it('should not fade out and pause if volume is already low', () => {
      speakerStreamer.playing = true;
      mockGainNode.gain.value = 0.01;
      speakerStreamer.fadeOutAndPause();
      expect(mockGainNode.gain.linearRampToValueAtTime).not.toHaveBeenCalled();
      expect(speakerStreamer.audio.pause).toHaveBeenCalled();
    });

    it('should fade out and pause after duration', () => {
      speakerStreamer.playing = true;
      mockGainNode.gain.value = 0.5;
      jest.useFakeTimers();
      const linearRampToValueAtTimeMock = mockGainNode.gain.linearRampToValueAtTime.mockImplementation(() => {
        // Simulate the gain reaching 0 after the ramp
        mockGainNode.gain.value = 0;
      });
      speakerStreamer.fadeOutAndPause();
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
      jest.advanceTimersByTime(3000);
      expect(speakerStreamer.audio.pause).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should retry fadeOutAndPause if volume is not low after duration', () => {
      speakerStreamer.playing = true;
      mockGainNode.gain.value = 0.5;
      const initialVolume = 0.5; // Set the initial volume
      mockGainNode.gain.value = initialVolume; // Set the initial volume
      mockGainNode.gain.linearRampToValueAtTime.mockImplementation(() => {
        // Simulate the gain not reaching 0 after the ramp
        mockGainNode.gain.value = initialVolume / 2;
      });
      jest.useFakeTimers();
      speakerStreamer.fadeOutAndPause();

      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
      jest.advanceTimersByTime(3000);
      expect(speakerStreamer.audio.pause).not.toHaveBeenCalled();
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
  });

  describe('cancelFadeOutAndPause', () => {
    it('should clear the fade out and pause timeout', () => {
      speakerStreamer._fadeOutAndPauseTimeout = setTimeout(() => {}, 1000);
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      speakerStreamer.cancelFadeOutAndPause();
      expect(clearTimeoutSpy).toHaveBeenCalledWith(speakerStreamer._fadeOutAndPauseTimeout);
    });

    it('should not throw an error if no timeout is set', () => {
      speakerStreamer._fadeOutAndPauseTimeout = null;
      expect(() => speakerStreamer.cancelFadeOutAndPause()).not.toThrow();
    });
  });

  describe('timerStart', () => {
    it('should not start timer if already started or already trying to play', () => {
      speakerStreamer.started = true;
      speakerStreamer.timerStart();
      expect(speakerStreamer.audio.play).not.toHaveBeenCalled();
      speakerStreamer.started = false;
      speakerStreamer._alreadyTryingToPlay = true;
      speakerStreamer.timerStart();
      
      expect(speakerStreamer.audio.play).not.toHaveBeenCalled();
      speakerStreamer._alreadyTryingToPlay = false;
    });

    it('should start timer and set up audio element', async () => {
      const playPromise = Promise.resolve();
      mockAudioElement.play.mockReturnValue(playPromise);
      speakerStreamer.timerStart();
      expect(speakerStreamer.audio.src).toBe(silenceAudioBase64);
      expect(speakerStreamer['_alreadyTryingToPlay']).toBe(true);

      await playPromise;

      expect(speakerStreamer.audio.play).toHaveBeenCalled();
      expect(speakerStreamer.audio.pause).toHaveBeenCalled();
      expect(speakerStreamer.isSafeToPlay).toBe(true);
      expect(speakerStreamer['_alreadyTryingToPlay']).toBe(false);
      expect(speakerStreamer.started).toBe(true);
    });
    it('should set currentTime to 0 on loadedmetadata', async () => {
      const playPromise = Promise.resolve();
      mockAudioElement.play.mockReturnValue(playPromise);
      speakerStreamer.timerStart();
      expect(speakerStreamer.audio.src).toBe(silenceAudioBase64);
      expect(speakerStreamer['_alreadyTryingToPlay']).toBe(true);

      await playPromise;
      expect(speakerStreamer.audio.addEventListener).toHaveBeenCalledWith('loadedmetadata', expect.any(Function), { once: true });

    });
  });

  describe('timerStop', () => {
    it('should define timerStop function', () => {
      expect(speakerStreamer.timerStop).toBeDefined();
    });
  });

  describe('onLoadingProgress', () => {
    it('should call the callback with 100', () => {
      const callback = jest.fn();
      speakerStreamer.onLoadingProgress(callback);
      expect(callback).toHaveBeenCalledWith(100);
    });
  });

  describe('onEnd', () => {
    it('should set the audio.onended callback', () => {
      const callback = jest.fn();
      speakerStreamer.onEnd(callback);
      expect(speakerStreamer.audio.onended).toBe(callback);

      // Simulate the onended event
      if (typeof speakerStreamer.audio.onended === 'function') {
        speakerStreamer.audio.onended({} as Event);
      }
    });
  });

  describe('replay', () => {
    it('should set the audio.currentTime to 0', () => {
      speakerStreamer.replay();
      expect(speakerStreamer.audio.currentTime).toBe(0);
    });
  });

  
});