import { IAudioContext, IGainNode } from 'standardized-audio-context';
import { SpeakerSyncStreamer } from './SpeakerSyncStreamer';

describe('SpeakerSyncStreamer', () => {
  let mockAudioContext: any;
  let mockGainNode: any;
  let mockMediaSource: any;
  let mockAudio: any;
  let speakerStreamer: SpeakerSyncStreamer;
  let mockLog: jest.SpyInstance;

  beforeEach(() => {
    // Mock Audio API
    mockAudio = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      addEventListener: jest.fn(),
      preload: '',
      loop: false,
      crossOrigin: '',
      currentTime: 10, // Important: Set initial currentTime to non-zero
    };
    global.Audio = jest.fn().mockImplementation(() => mockAudio);

    // Mock AudioContext and related interfaces
    mockGainNode = {
      gain: {
        value: 0,
        exponentialRampToValueAtTime: jest.fn(),
        cancelScheduledValues: jest.fn()
      },
      connect: jest.fn().mockReturnThis(),
    };

    mockMediaSource = {
      connect: jest.fn().mockReturnThis(),
    };

    mockAudioContext = {
      createGain: jest.fn().mockReturnValue(mockGainNode),
      createMediaElementSource: jest.fn().mockReturnValue(mockMediaSource),
      state: 'running',
      currentTime: 0,
      resume: jest.fn().mockResolvedValue(undefined),
      destination: {},
    };

    // Initialize with test config
    const testConfig = {
      loop: false,
      syncCheckInterval: 1000,
      acceptableDelayMs: 50
    };

    speakerStreamer = new SpeakerSyncStreamer({
      audioContext: mockAudioContext,
      config: {
        mode: 'prefetch',
      },

      uri: 'test-audio.mp3',
      id: 1
    });

    mockLog = jest.spyOn(speakerStreamer, 'log');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(speakerStreamer.isSafeToPlay).toBe(true);
      expect(speakerStreamer.playing).toBe(false);
      expect(speakerStreamer.loaded).toBe(true);
      expect(speakerStreamer.loadedPercentage).toBe(100);
      expect(speakerStreamer.id).toBe(1);
    });

    it('should set up audio event listeners', () => {
      expect(mockAudio.addEventListener).toHaveBeenCalledTimes(6);
    });

    it('should handle "abort", "ended", and "error" events', () => {
      const eventTypes = ['abort', 'ended', 'error'];
      eventTypes.forEach(eventType => {
        const listener = mockAudio.addEventListener.mock.calls.find(
            (          call: string[]) => call[0] === eventType
        )[1]; //listener function
        listener();

        expect(mockLog).toHaveBeenCalledWith(eventType + " event");
        expect(speakerStreamer.playing).toBe(false);
      });
    });

    it('should log other events', () => {
      const eventTypes = ['waiting', 'stalled', 'playing'];
      eventTypes.forEach(eventType => {
        const listener = mockAudio.addEventListener.mock.calls.find(
          (          call: string[]) => call[0] === eventType
        )[1];
        listener();
        expect(mockLog).toHaveBeenCalledWith(eventType + " event");
      });
    });
  });

  describe('play', () => {
    beforeEach(() => {
      // Reset the speaker streamer's state and global flags before each test.
      speakerStreamer.playing = false;
      speakerStreamer.alreadyTrying = false;
      speakerStreamer.started = false;
  
      // Reset the globals so they do not interfere between tests.
      global._roundwareSpeakerStartedAt = null;
      global._roundwareSpeakerPausedAt = null;
  
      // Optionally reset any mocks if needed.
      jest.clearAllMocks();
    });
  
    it('should return true if already playing', async () => {
      speakerStreamer.playing = true;
      const result = await speakerStreamer.play();
      expect(result).toBe(true);
      expect(mockAudio.play).not.toHaveBeenCalled();
    });
  
    it('should return false if already trying', async () => {
      // Cover the branch: "if (this.alreadyTrying) return false;"
      speakerStreamer.alreadyTrying = true;
      const result = await speakerStreamer.play();
      expect(result).toBe(false);
      expect(mockAudio.play).not.toHaveBeenCalled();
    });
  
    it('should start playback if not already playing', async () => {
      const result = await speakerStreamer.play();
      expect(result).toBe(true);
      expect(mockAudio.play).toHaveBeenCalled();
      expect(speakerStreamer.playing).toBe(true);
  
      // For a first-time play, "started" is false so it should set the global start time.
      expect(speakerStreamer.started).toBe(true);
      expect(global._roundwareSpeakerStartedAt).toBeInstanceOf(Date);
    });
  
    it('should handle context resume if needed', async () => {
      // Make the audio context state suspended so it forces a resume.
      mockAudioContext.state = 'suspended';
      await speakerStreamer.play();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  
    it('should update global start time and reset paused time when resuming after a pause', async () => {
      // Use fake timers so that the Date calculations are predictable.
      const baseTime = 1_000_000;
      jest.useFakeTimers().setSystemTime(baseTime);
  
      // Simulate that playback was already started.
      speakerStreamer.started = true;
      speakerStreamer.playing = false; // make sure "if (this.playing)" is false
  
      // Set the global start time and paused time.
      const initialStart = new Date(baseTime - 15_000); // started 15 seconds ago
      global._roundwareSpeakerStartedAt = initialStart;
      const pausedAt = new Date(baseTime - 5_000); // paused 5 seconds ago
      global._roundwareSpeakerPausedAt = pausedAt;
  
      await speakerStreamer.play();
  
      // Verify that after resuming, the paused time is cleared…
      expect(global._roundwareSpeakerPausedAt).toBeNull();
  
      // …and the start time is updated by the pause duration.
      // The logic does: newStartTime = initialStart.getTime() + (baseTime - (baseTime - 5000))
      expect(global._roundwareSpeakerStartedAt.getTime()).toEqual(initialStart.getTime() + 5000);
  
      jest.useRealTimers();
    });
  
    it('should handle errors during playback and set playing to false', async () => {
      // Force audio.play() to throw an error.
      const playError = new Error('play error');
      mockAudio.play.mockRejectedValue(playError);
  
      // Spy on console.error to check that the error is logged.
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
      const result = await speakerStreamer.play();
  
      // Even if there is an error, the method returns true
      expect(result).toBe(true);
      // But it should ensure that playing is set to false.
      expect(speakerStreamer.playing).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(playError);
  
      consoleSpy.mockRestore();
    });
  
    it('should call cancelFadeOutAndPause at the beginning', async () => {
      // Spy on cancelFadeOutAndPause to ensure it is invoked immediately.
      const cancelSpy = jest.spyOn(speakerStreamer, 'cancelFadeOutAndPause');
      await speakerStreamer.play();
      expect(cancelSpy).toHaveBeenCalled();
      cancelSpy.mockRestore();
    });
  
    it('should log and alert after starting playback', async () => {
      // Verify that after a successful play, the log and alert functions are called.
      const logSpy = jest.spyOn(speakerStreamer, 'log');
      const alertSpy = jest.spyOn(speakerStreamer, 'alert');
  
      await speakerStreamer.play();
  
      expect(logSpy).toHaveBeenCalledWith('Playing...');
      expect(alertSpy).toHaveBeenCalledWith('Started playing');
  
      logSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
  
  describe('replay', () => {
    it('should set audio.currentTime to 0', () => {
      // Arrange: Initial currentTime is set to 10 in beforeEach
      const initialTime = mockAudio.currentTime;

      // Act
      speakerStreamer.replay();

      // Assert
      expect(mockAudio.currentTime).toBe(0);
    });
  });

  describe('pause', () => {
    it('should pause playback', () => {
      speakerStreamer.playing = true;
      speakerStreamer.pause();
      expect(speakerStreamer.playing).toBe(false);
      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });

  describe('fade', () => {
    let speakerStreamer: any;
    let mockGainNode: any;

    beforeEach(() => {
      jest.useFakeTimers();

      mockGainNode = {
        gain: {
          cancelScheduledValues: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
          value: 1 // Initial value for the gain node
        }
      };

      speakerStreamer = {
        fade: function (toVolume: number, duration: number) {
          if (this._fadingTimeout) {
            clearTimeout(this._fadingTimeout);
          }

          this.fading = true;

          mockGainNode.gain.cancelScheduledValues(0);
          const endTime = this.audioContext.currentTime + duration;
          mockGainNode.gain.exponentialRampToValueAtTime(toVolume, endTime);

          this._fadingTimeout = setTimeout(() => {
            this.fading = false;
          }, duration * 1000);
        },
        fading: false,
        _fadingTimeout: null,
        audioContext: { currentTime: 0 }, // Mock audio context
        gainNode: mockGainNode // Attach mockGainNode here
      };
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers(); // Clear any outstanding timers.  Important!
    });

    it('should set up gain node fade and clear the existing timeout', () => {
      const toVolume = 0.5;
      const duration = 2;

      // Arrange: Simulate an existing timeout
      speakerStreamer._fadingTimeout = setTimeout(() => {}, 1000);
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Act
      speakerStreamer.fade(toVolume, duration);

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(mockGainNode.gain.cancelScheduledValues).toHaveBeenCalled();
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
      expect(speakerStreamer.fading).toBe(true);
    });
  });

  describe('timerStart and timerStop', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start sync interval and playback', () => {
      // Arrange
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const trackSyncSpy = jest.spyOn(speakerStreamer, 'trackSync');
      const playSpy = jest.spyOn(speakerStreamer, 'play');

      // Act
      speakerStreamer.timerStart();
      jest.advanceTimersByTime(2500); // Advance timers to trigger the interval

      // Assert
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      expect(trackSyncSpy).toHaveBeenCalled();
      expect(playSpy).toHaveBeenCalled();
      // If you know the exact interval time, you can also verify it:
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 2500); // Verify interval time

    });

    it('should stop sync interval and pause playback', () => {
      // Arrange
      speakerStreamer.timerStart();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      // Act
      speakerStreamer.timerStop();

      // Assert
      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(speakerStreamer.playing).toBe(false);
    });
  });

  describe('trackSync', () => {
    // This represents your speaker streamer object.
    // It must have the properties used in trackSync().
    // For example: playing, audio, config, gainNode, log, fade.
    // Assume speakerStreamer is already imported/instantiated.
  
    let baseTime: number;
  
// Import or declare any required types if not already imported:
// import { HTMLAudioElement } from 'dom'; // Usually globally available in TS
// import { IGainNode, IAudioContext } from './gain-node'; // Adjust the path as needed

beforeEach(() => {
  speakerStreamer.playing = true;

  // Create a dummy audio element that satisfies HTMLAudioElement.
  // We provide only the properties/methods used in our test scope.
  speakerStreamer.audio = {
    duration: 10, // seconds
    currentTime: 0, // seconds
    playbackRate: 1,
    play: jest.fn(), // method invoked by the code under test
    // Minimal stubs for required properties.
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    pause: jest.fn(),
    load: jest.fn(),
    // If any other properties are used in your tests, add them here.
  } as unknown as HTMLAudioElement;

  speakerStreamer.config = {
    acceptableDelayMs: 50, // default acceptable delay
    syncCheckInterval: 2500, // default sync check interval
    mode: "prefetch"
  };

  // Create a dummy gainNode with a 'gain' object.
  // We add the minimal implementations required by the IAudioParam interface.
  speakerStreamer.gainNode = {
    gain: {
      value: 0.5,
      defaultValue: 0.5,
      maxValue: 1,
      minValue: 0,
      cancelAndHoldAtTime: jest.fn(),
      cancelScheduledValues: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      setValueAtTime: jest.fn(),
      setTargetAtTime: jest.fn()
    }
  } as unknown as IGainNode<IAudioContext>;

  // Stub out any helper functions that your methods depend on.
  speakerStreamer.log = jest.fn();
  speakerStreamer.fade = jest.fn();

  // Reset any global variables used in your methods.
  global._roundwareSpeakerStartedAt = new Date();
});

  
    afterEach(() => {
      jest.useRealTimers();
    });
  
    it('should return early if global._roundwareSpeakerStartedAt is not a Date', () => {
      global._roundwareSpeakerStartedAt = "Not a Date" as any;
      speakerStreamer.playing = true;
      speakerStreamer.trackSync();
      expect(speakerStreamer.log).not.toHaveBeenCalled();
      expect(speakerStreamer.fade).not.toHaveBeenCalled();
    });
  
    it('should return early if not playing', () => {
      speakerStreamer.playing = false;
      global._roundwareSpeakerStartedAt = new Date();
      speakerStreamer.trackSync();
      expect(speakerStreamer.log).not.toHaveBeenCalled();
      expect(speakerStreamer.fade).not.toHaveBeenCalled();
    });
  
    it('should return early if elapsedTime is greater than audio duration', () => {
      jest.useFakeTimers();
      // Set global start time to 0 so that elapsedTime is high.
      global._roundwareSpeakerStartedAt = new Date(0);
      // Advance system time to 15,000 ms.
      jest.setSystemTime(15000);
      speakerStreamer.playing = true;
      speakerStreamer.trackSync();
      // No log or fade should occur because the elapsedTime exceeds duration.
      expect(speakerStreamer.log).not.toHaveBeenCalled();
      expect(speakerStreamer.fade).not.toHaveBeenCalled();
    });
  
    it('should set playbackRate to 1 if the difference is within acceptable delay', () => {
      jest.useFakeTimers();
      // Global start time set to 1000 ms.
      global._roundwareSpeakerStartedAt = new Date(1000);
      // Current system time is 2000 ms so elapsedTime = 1000 ms.
      jest.setSystemTime(2000);
      // Set audio.currentTime such that audioTime = 1000 ms (i.e. 1 second).
      speakerStreamer.audio.currentTime = 1;
      // The difference = 1000 - 1000 = 0 which is less than acceptableDelayMs (50 ms).
      speakerStreamer.trackSync();
      expect(speakerStreamer.log).toHaveBeenCalledWith(
        expect.stringContaining("Difference: 0 ms; Volume: 0.5")
      );
      // Expect playback rate to be reset to 1.
      expect(speakerStreamer.audio.playbackRate).toBe(1);
      // Verify that fade() was called.
      expect(speakerStreamer.fade).toHaveBeenCalled();
    });
  
    it('should seek when the difference is too high', () => {
      jest.useFakeTimers();
      // Set global start time to 1000 ms.
      global._roundwareSpeakerStartedAt = new Date(1000);
      // Set system time to 4000 ms so that elapsedTime = 3000 ms.
      jest.setSystemTime(4000);
      // Set audio.currentTime = 0 so that audioTime = 0 ms.
      speakerStreamer.audio.currentTime = 0;
      // Here the difference = 3000 - 0 = 3000 ms, which exceeds the default syncCheckInterval (2500 ms).
      speakerStreamer.trackSync();
      expect(speakerStreamer.log).toHaveBeenCalledWith(
        expect.stringContaining("Difference: 3000 ms; Volume: 0.5")
      );
      // Expect an additional log indicating a seek operation.
      expect(speakerStreamer.log).toHaveBeenCalledWith("Seeking to 3.5s");
      // The new currentTime should be set to (elapsedTime + 500) / 1000 = (3000 + 500) / 1000 = 3.5 seconds.
      expect(speakerStreamer.audio.currentTime).toBeCloseTo(3.5);
      // Playback rate should be reset to 1.
      expect(speakerStreamer.audio.playbackRate).toBe(1);
      expect(speakerStreamer.fade).toHaveBeenCalled();
    });
  
    it('should adjust playbackRate when the difference is moderate', () => {
      jest.useFakeTimers();
      // Set global start time to 1000 ms.
      global._roundwareSpeakerStartedAt = new Date(1000);
      // Set system time to 1200 ms so elapsedTime = 200 ms.
      jest.setSystemTime(1200);
      // Set audio.currentTime = 0 so that audioTime = 0 ms.
      speakerStreamer.audio.currentTime = 0;
      // The difference = 200 - 0 = 200 ms, which is moderate:
      // since 200 is not < acceptableDelayMs (50) nor > syncCheckInterval (2500).
      speakerStreamer.trackSync();
      // The expected playback rate is adjusted by: 1 + 200 / 2500 = 1.08.
      expect(speakerStreamer.audio.playbackRate).toBeCloseTo(1.08, 2);
      expect(speakerStreamer.log).toHaveBeenLastCalledWith(
        expect.stringContaining("Changing Playback rate to 1.08")
      );
      expect(speakerStreamer.fade).toHaveBeenCalled();
    });
  });
  

  
});