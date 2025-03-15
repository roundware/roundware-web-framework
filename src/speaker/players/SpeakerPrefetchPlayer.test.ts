// SpeakerPrefetchPlayer.test.ts

import { IAudioContext, IAudioBuffer } from "standardized-audio-context";
import { SpeakerPrefetchPlayer } from "./SpeakerPrefetchPlayer";
import { SpeakerConstructor } from "../../types/speaker";
import * as utils from "../../utils";

// Mock the utils so that speakerLog is a Jest mock and NEARLY_ZERO is provided.
jest.mock("../../utils", () => ({
  speakerLog: jest.fn(),
  NEARLY_ZERO: 0.00001,
}));

// A fake XMLHttpRequest to simulate progress and load events in the constructor.
class FakeXMLHttpRequest {
  onprogress: (ev: { loaded: number; total: number }) => void = () => {};
  onload: () => void = () => {};
  response: any;
  open = jest.fn();
  timeout: number = Infinity;
  responseType: string = "";
  send() {
    // Simulate asynchronous progress then load.
    setTimeout(() => {
      if (this.onprogress) {
        // This will update loadedPercentage to 50 (because (50/100)*100 = 50)
        this.onprogress({ loaded: 50, total: 100 });
      }
      // Simulate receiving an ArrayBuffer.
      this.response = new ArrayBuffer(8);
      if (this.onload) {
        this.onload();
      }
    }, 10);
  }
  setRequestHeader = jest.fn();
}

describe("SpeakerPrefetchPlayer", () => {
  let mockAudioContext: IAudioContext;
  let mockAudioBuffer: IAudioBuffer;
  let mockConstructor: SpeakerConstructor;

  beforeEach(() => {
    jest.useFakeTimers();
    // Override global.XMLHttpRequest so that the player's constructor uses our fake.
    (global as any).XMLHttpRequest = FakeXMLHttpRequest;
    (global as any)._roundwareTotalAudioBufferSize = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  
  beforeEach(() => {
    let internalState = "running";
  
    mockAudioContext = {
      createGain: jest.fn().mockReturnValue({
        gain: {
          value: utils.NEARLY_ZERO,
          cancelScheduledValues: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        disconnect: jest.fn(),
      }),
      createBufferSource: jest.fn().mockReturnValue({
        start: jest.fn(),
        stop: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        buffer: null,
        loop: false,
        loopEnd: 0,
      }),
      // Simulate asynchronous decode success.
      decodeAudioData: jest.fn((data, successCallback) => {
         setTimeout(() => {
           successCallback(mockAudioBuffer);
         }, 10);
      }),
      currentTime: 0,
      get state() {
        return internalState;
      },
      set state(newState: string) {
        internalState = newState;
      },
      resume: jest.fn(() => Promise.resolve()),
    } as unknown as IAudioContext;
  
    mockAudioBuffer = {
      length: 1000,
      duration: 10,
      numberOfChannels: 2,
    } as unknown as IAudioBuffer;
  
    mockConstructor = {
      audioContext: mockAudioContext,
      id: 1,
      uri: "mock-uri",
      config: {
        loop: false,
        length: undefined,
        mode: "stream",
      },
    };
  });
  
  // --- New test cases for uncovered lines (XHR progress, decode callbacks, fade) ---
  
  test("should update loadedPercentage and set loaded after xhr load", async () => {
    const mockLoadingCallback = jest.fn();
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    player.onLoadingProgress(mockLoadingCallback);
  
    // Fast-forward timers to trigger the XHR onprogress and onload callbacks.
    jest.runAllTimers();
    await Promise.resolve();
  
    // onprogress should update loadedPercentage to 50.
    expect(mockLoadingCallback).toHaveBeenCalledWith(50);
  
    // Fast-forward timer for decodeAudioData callback.
    jest.runAllTimers();
    await Promise.resolve();
  
    expect(player.loaded).toBe(true);
    expect(player.buffer).toEqual(mockAudioBuffer);
    // The global _roundwareTotalAudioBufferSize should be increased by (length * numberOfChannels * 4)
    expect((global as any)._roundwareTotalAudioBufferSize).toBe(
      mockAudioBuffer.length * mockAudioBuffer.numberOfChannels * 4
    );
    // Verify that the log message for a successful load was made.
    expect(utils.speakerLog).toHaveBeenCalledWith("1] loaded successfully");
  });
  
  test("should log error on decode failure when simulateDecodeError is true", async () => {
    // Override decodeAudioData to simulate a failure.
    (mockAudioContext.decodeAudioData as jest.Mock).mockImplementation(
      (data, successCallback, failureCallback) => {
        setTimeout(() => failureCallback({ message: "Decode error" }), 10);
      }
    );
    const errorConfig = {
      ...mockConstructor.config,
      simulateDecodeError: true,
    };
    const constructorWithError = {
      ...mockConstructor,
      config: errorConfig,
    };
  
    const player = new SpeakerPrefetchPlayer(constructorWithError);
  
    jest.runAllTimers();
    await Promise.resolve();
  
    expect(utils.speakerLog).toHaveBeenCalledWith("1] Error with decoding audio data Decode error");
  });
  // --- End of new tests ---
  
  test("should call pause inside fadeOutAndPause", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
  
    player.playing = true;
    player.fade = jest.fn();
    const pauseSpy = jest.spyOn(player, "pause").mockImplementation(() => {});
  
    player.fadeOutAndPause();
  
    expect(player.fade).toHaveBeenCalledWith(0);
  
    jest.runAllTimers();
  
    expect(pauseSpy).toHaveBeenCalled();
  });
  
  test("should reset _fading to false after fade is completed", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
  
    player._fading = true;
    player._fadingTimeout = setTimeout(() => {}, 2000);
  
    player.fade(0.8, 2);
  
    expect(player._fading).toBe(true);
  
    jest.runAllTimers();
  
    expect(player._fading).toBe(false);
  });
  
  test("should correctly pause the player", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
  
    player.playing = true;
    player.lastStartedAtSeconds = 10;
    player.lastStartedAtTime = 20;
  
    const mockSource = {
      stop: jest.fn(),
      disconnect: jest.fn(),
    };
    player.source = mockSource as unknown as ReturnType<IAudioContext["createBufferSource"]>;
  
    player.gainNode.disconnect = jest.fn();
  
    Object.defineProperty(mockAudioContext, "currentTime", {
      get: jest.fn(() => 30),
    });
  
    player.pause();
  
    expect(player.gainNode.disconnect).toHaveBeenCalled();
    expect(mockSource.stop).toHaveBeenCalled();
    expect(player.playing).toBe(false);
    // elapsedSeconds = 30 - 20 = 10, so pausedAtSeconds = lastStartedAtSeconds (10) + 10 = 20.
    expect(player.pausedAtSeconds).toBe(20);
    expect(player.source).toBeUndefined();
  });
  
  test("should fade and return true if already playing", async () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
  
    player.playing = true;
    player.fade = jest.fn();
    player.loaded = true;
    player.source = mockAudioContext.createBufferSource();
  
    const result = await player.play();
  
    expect(player.fade).toHaveBeenCalled();
    expect(result).toBe(true);
  });
  
  test("should reset playing state and initialize source in replay", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
  
    player.initializeSource = jest.fn();
    player.timerStart = jest.fn();
  
    player.playing = true;
  
    player.replay();
  
    expect(player.playing).toBe(false);
    expect(player.initializeSource).toHaveBeenCalled();
    expect(player.timerStart).toHaveBeenCalled();
  });
  
  describe("timerStart", () => {
    it("should resume audio context if suspended", async () => {
      const player = new SpeakerPrefetchPlayer(mockConstructor);
      (mockAudioContext as any).state = "suspended";
      player.context = mockAudioContext;
      player.source = mockAudioContext.createBufferSource();
  
      await player.timerStart();
  
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
  
    it("should not call initializeSource or fade if source is null", async () => {
      const player = new SpeakerPrefetchPlayer(mockConstructor);
      player.source = undefined;
      player.initializeSource = jest.fn();
      player.fade = jest.fn();
  
      await player.timerStart();
  
      expect(player.initializeSource).not.toHaveBeenCalled();
      expect(player.fade).not.toHaveBeenCalled();
    });
  
    it("should call initializeSource and fade if source exists", async () => {
      const player = new SpeakerPrefetchPlayer(mockConstructor);
      player.source = mockAudioContext.createBufferSource();
      player.initializeSource = jest.fn();
      player.fade = jest.fn();
  
      await player.timerStart();
  
      expect(player.initializeSource).toHaveBeenCalled();
      expect(player.fade).toHaveBeenCalled();
    });
  });
  
  test("should initialize correctly", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    expect(player.id).toBe(1);
    expect(player.loaded).toBe(false);
    expect(player.playing).toBe(false);
    expect(player.gainNode.gain.value).toBe(utils.NEARLY_ZERO);
    expect(player.audio).toBeDefined();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
  });
  
  test("should log on initialization", () => {
    // Instead of spying on console.log, we spy on utils.speakerLog.
    const logSpy = jest.spyOn(utils, "speakerLog");
  
    new SpeakerPrefetchPlayer(mockConstructor);
  
    // Because production calls log before assigning id, we expect "undefined] SpeakerPrefetchPlayer constructor"
    expect(logSpy).toHaveBeenCalledWith("undefined] SpeakerPrefetchPlayer constructor");
    logSpy.mockRestore();
  });
  
  test("should call initializeSource and log on play if not loaded", async () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    player.log = jest.fn();
    player.initializeSource = jest.fn();
  
    const result = await player.play();
    expect(result).toBe(false);
    expect(player.log).toHaveBeenCalledWith("not loaded or started yet");
    expect(player.initializeSource).toHaveBeenCalled();
  });
  
  test("should play when loaded and set gainNode correctly", async () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    player.loaded = true;
    player.source = mockAudioContext.createBufferSource();
    player.gainNode.connect = jest.fn();
  
    const result = await player.play();
    expect(result).toBe(true);
    expect(player.gainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    expect(player.playing).toBe(true);
  });
  
  test("should fade correctly", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    player.playing = true;
  
    player.fade(0.5, 2);
    expect(player.gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.5,
      mockAudioContext.currentTime + 2
    );
  });
  
  test("should handle loading progress callback", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    const mockCallback = jest.fn();
  
    player.onLoadingProgress(mockCallback);
    player.loadingCallback(50);
  
    expect(mockCallback).toHaveBeenCalledWith(50);
  });
  
  test("should handle onEnd callback", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    const mockCallback = jest.fn();
  
    player.onEnd(mockCallback);
    player.endCallback();
  
    expect(mockCallback).toHaveBeenCalled();
  });
  
  test("should fade out and pause", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
    player.playing = true;
    player.fade = jest.fn();
    player.pause = jest.fn();
  
    player.fadeOutAndPause();
  
    expect(player.fade).toHaveBeenCalledWith(0);
    jest.advanceTimersByTime(3000);
    expect(player.pause).toHaveBeenCalled();
  });
  
  test("should cancel fade out and pause", () => {
    const player = new SpeakerPrefetchPlayer(mockConstructor);
  
    const mockTimeout = setTimeout(() => {}, 3000);
    player._fadeOutAndPauseTimeout = mockTimeout;
  
    jest.spyOn(global, "clearTimeout");
    player.cancelFadeOutAndPause();
  
    expect(clearTimeout).toHaveBeenCalledWith(mockTimeout);
  });
  
});
