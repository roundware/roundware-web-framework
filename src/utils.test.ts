// __tests__/utils.test.ts
import { IAudioContext, TAudioContextState } from "standardized-audio-context";
import {
  buildAudioContext,
  cleanAudioURL,
  coordsToPoints,
  debugLogger,
  getUrlParam,
  hasOwnProperty,
  isEmpty,
  isIos,
  isNearlyEqual,
  isNearlyZero,
  makeAudioSafeToPlay,
  NEARLY_ZERO,
  NO_OP,
  normalizeCoords,
  playlistTrackLog,
  random,
  randomInt,
  speakerLog,
  timestamp,
  UNLOCK_AUDIO_EVENTS,
  unlockAudioContext
} from "./utils"; // Update this path based on your project structure

jest.mock('standardized-audio-context', () => {
  const mockAudioContext = jest.fn().mockImplementation(() => ({
    resume: jest.fn().mockReturnValue(Promise.resolve()),
    onstatechange: null,
    state: 'suspended'
  }));

  return {
    AudioContext: mockAudioContext,
    IAudioContext: jest.fn(),
    TAudioContextState: jest.fn(),
    __mockAudioContext: mockAudioContext // Expose the mock for test manipulation
  };
});

describe("cleanAudioURL", () => {
  it("should clean audio URL and replace .wav with .mp3", () => {
    const result = cleanAudioURL("//example.com/audio/test.wav");
    expect(result).toEqual("//example.com/audio/test.mp3");
  });

  it("should clean audio URL and replace .wav with .m4a on iOS", () => {
    jest.spyOn(global.navigator, "platform", "get").mockReturnValue("iPhone");
    const result = cleanAudioURL("//example.com/audio/test.wav", true);
    expect(result).toEqual("//example.com/audio/test.m4a");
  });

  it("should handle .wav files", () => {
    const result = cleanAudioURL("//example.com/test.wav");
    expect(result).toBe("//example.com/test.mp3");
  });

  it("should handle iOS devices with m4a conversion", () => {
    jest.spyOn(global.navigator, "platform", "get").mockReturnValue("iPhone");
    const result = cleanAudioURL("//example.com/test.wav", true);
    expect(result).toBe("//example.com/test.m4a");
  });
});

describe("coordsToPoints", () => {
  it("should convert coordinates to points", () => {
    const result = coordsToPoints({ latitude: 40, longitude: -75 });
    expect(result.geometry.coordinates).toEqual([-75, 40]);
  });
});

describe("random", () => {
  it("should generate a random number between given range", () => {
    const result = random(5, 10);
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(10);
  });

  it("should handle reversed range parameters", () => {
    const result = random(10, 5);
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(10);
  });

  it("should use default values when no parameters provided", () => {
    const result = random();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe("randomInt", () => {
  it("should generate a random integer between given range", () => {
    const result = randomInt(5, 10);
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(10);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("should handle reversed range parameters", () => {
    const result = randomInt(10, 5);
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(10);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("should use default values when no parameters provided", () => {
    const result = randomInt();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe("buildAudioContext", () => {
  let mockWindow: any;
  let mockConsoleInfo: jest.SpyInstance;
  let mockAudioContext: jest.Mock;

  beforeEach(() => {
    // Get the mock AudioContext implementation
    const { __mockAudioContext } = require('standardized-audio-context');
    mockAudioContext = __mockAudioContext;

    // Mock window object with document.body
    mockWindow = {
      document: {
        body: {
          addEventListener: jest.fn()
        }
      }
    };
    
    // Replace global window
    (global as any).window = mockWindow;

    // Mock console.info
    mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).window;
    mockConsoleInfo.mockRestore();
  });

  it("should create and return an AudioContext instance", () => {
    const result = buildAudioContext();
    expect(result).toBeDefined();
    expect(result.state).toBe('suspended');
  });

  it("should unlock the audio context", () => {
    buildAudioContext();
    expect(mockWindow.document.body.addEventListener).toHaveBeenCalled();
  });

  it("should set up state change listener", () => {
    const result = buildAudioContext();
    expect(result.onstatechange).toBeDefined();
    
    // Trigger state change
    const event = new Event('statechange');
    result.onstatechange!(event);
    expect(mockConsoleInfo).toHaveBeenCalledWith('[Audio Context]: suspended');
  });

  it("should handle case where AudioContext is not available", () => {
    // Clear the mock implementation
    jest.resetModules();
    // Remove the AudioContext from the window
    delete (global as any).window.AudioContext;
    // Require the module again to get a fresh instance
    const { buildAudioContext } = require('./utils');
  });

});

describe("isIos", () => {
  it("should return true on iOS platform", () => {
    jest.spyOn(global.navigator, "platform", "get").mockReturnValue("iPhone");
    const result = isIos();
    expect(result).toBe(true);
  });

  it("should return false on non-iOS platform", () => {
    jest.spyOn(global.navigator, "platform", "get").mockReturnValue("Windows");
    const result = isIos();
    expect(result).toBe(false);
  });
});

describe("normalizeCoords", () => {
  it("should normalize coordinates within the range", () => {
    const result = normalizeCoords([190, -190, 200]);
    expect(result).toEqual([-170, 170, -160]);
  });
});

describe("isEmpty", () => {
  it("should return true for an empty array", () => {
    const result = isEmpty([]);
    expect(result).toBe(true);
  });

  it("should return false for a non-empty array", () => {
    const result = isEmpty([1, 2, 3]);
    expect(result).toBe(false);
  });
});

describe("hasOwnProperty", () => {
  it("should return true if object has the property", () => {
    const obj = { key: "value" };
    const result = hasOwnProperty(obj, "key");
    expect(result).toBe(true);
  });

  it("should return false if object does not have the property", () => {
    const obj = { key: "value" };
    const result = hasOwnProperty(obj, "otherKey");
    expect(result).toBe(false);
  });
});

describe("NEARLY_ZERO", () => {
  it("should be a very small number", () => {
    expect(NEARLY_ZERO).toBeCloseTo(0, 3);
  });
});

describe("isNearlyZero", () => {
  it("should return true for values very close to zero", () => {
    expect(isNearlyZero(0.0001)).toBe(true);
  });

  it("should return false for values not close to zero", () => {
    expect(isNearlyZero(1)).toBe(false);
  });

  it("should use custom tolerance when provided", () => {
    expect(isNearlyZero(0.0001, 0.0002)).toBe(true);
  });
});

describe("isNearlyEqual", () => {
  it("should return true for values very close to each other", () => {
    expect(isNearlyEqual(0.9999, 1, 0.0001)).toBe(true);
  });

  it("should return false for values not close to each other", () => {
    expect(isNearlyEqual(0.9999, 1, 0.00001)).toBe(false);
  });

  it("should use custom tolerance when provided", () => {
    expect(isNearlyEqual(0.9999, 1, 0.0001)).toBe(true);
  });

  it("should handle very small differences", () => {
    expect(isNearlyEqual(1.0001, 1.0002, 0.0002)).toBe(true);
  });

  it("should handle larger differences", () => {
    expect(isNearlyEqual(1.0001, 1.0002, 0.00001)).toBe(false);
  });
});

describe("getUrlParam", () => {
  it("should extract parameter from URL", () => {
    const url = "https://example.com?param=value";
    const result = getUrlParam(url, "param");
    expect(result).toBe("value");
  });

  it("should return null for non-existent parameter", () => {
    const url = "https://example.com?param=value";
    const result = getUrlParam(url, "nonexistent");
    expect(result).toBeNull();
  });

  it("should handle URL with multiple parameters", () => {
    const url = "https://example.com?param1=value1&param2=value2";
    const result = getUrlParam(url, "param2");
    expect(result).toBe("value2");
  });
});

describe("NO_OP", () => {
  it("should be a function that does nothing", () => {
    expect(NO_OP).toBeDefined();
    expect(typeof NO_OP).toBe("function");
    expect(NO_OP()).toBeUndefined();
  });
});

describe("debugLogger", () => {
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it("should log debug message with red color", () => {
    const message = "test debug message";
    debugLogger(message);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Debug Info"),
      "color: red"
    );
  });
});

describe("speakerLog", () => {
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it("should log speaker message with yellow background", () => {
    const message = "test speaker message";
    speakerLog(message);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("[Speaker: test speaker message]"),
      expect.stringContaining("background: #f6ff9a")
    );
  });
});

describe("playlistTrackLog", () => {
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it("should log track message with cyan background", () => {
    const message = "test track message";
    playlistTrackLog(message);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("[Track: test track message]"),
      expect.stringContaining("background: #9cffff")
    );
  });
});

describe("timestamp", () => {
  describe("toString", () => {
    it("should format current time when no argument is provided", () => {
      const now = new Date();
      const result = timestamp.toString();
      const expected = [
        now.getHours().toString().padStart(2, "0"),
        now.getMinutes().toString().padStart(2, "0"),
        now.getSeconds().toString().padStart(2, "0"),
      ].join(":");
      expect(result).toBe(expected);
    });

    it("should format provided time correctly", () => {
      const testDate = new Date("2024-01-01T15:30:45");
      const result = timestamp.toString(testDate);
      expect(result).toBe("15:30:45");
    });

    it("should pad single digits with zeros", () => {
      const testDate = new Date("2024-01-01T05:05:05");
      const result = timestamp.toString(testDate);
      expect(result).toBe("05:05:05");
    });

    it("should handle midnight correctly", () => {
      const testDate = new Date("2024-01-01T00:00:00");
      const result = timestamp.toString(testDate);
      expect(result).toBe("00:00:00");
    });

    it("should handle noon correctly", () => {
      const testDate = new Date("2024-01-01T12:00:00");
      const result = timestamp.toString(testDate);
      expect(result).toBe("12:00:00");
    });

    it("should handle end of day correctly", () => {
      const testDate = new Date("2024-01-01T23:59:59");
      const result = timestamp.toString(testDate);
      expect(result).toBe("23:59:59");
    });
  });
});

describe("unlockAudioContext", () => {
  let mockBody: { addEventListener: jest.Mock };
  let mockAudioContext: Pick<IAudioContext, "state" | "resume">;

  beforeEach(() => {
    mockBody = {
      addEventListener: jest.fn()
    };
    mockAudioContext = {
      state: "suspended" as TAudioContextState,
      resume: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should add event listeners when audio context is suspended", () => {
    unlockAudioContext(mockBody, mockAudioContext);

    // Verify event listeners were added for each UNLOCK_AUDIO_EVENTS
    UNLOCK_AUDIO_EVENTS.forEach(event => {
      expect(mockBody.addEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
        { once: true }
      );
    });
  });

  it("should not add event listeners when audio context is not suspended", () => {
    Object.defineProperty(mockAudioContext, 'state', { value: 'running' as TAudioContextState });
    unlockAudioContext(mockBody, mockAudioContext);

    expect(mockBody.addEventListener).not.toHaveBeenCalled();
  });

  it("should call resume when an unlock event is triggered", () => {
    unlockAudioContext(mockBody, mockAudioContext);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = mockBody.addEventListener.mock.calls[0][1];
    
    // Call the unlock function
    unlockFunction();

    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it("should only add event listeners once per event", () => {
    unlockAudioContext(mockBody, mockAudioContext);

    // Verify each event has exactly one listener
    UNLOCK_AUDIO_EVENTS.forEach(event => {
      const eventListeners = mockBody.addEventListener.mock.calls.filter(
        call => call[0] === event
      );
      expect(eventListeners).toHaveLength(1);
    });
  });
});

describe("makeAudioSafeToPlay", () => {
  let mockAudioElement: HTMLAudioElement & {
    play: jest.Mock<Promise<void>, []>;
    addEventListener: jest.Mock<void, [string, EventListener, boolean | AddEventListenerOptions | undefined]>;
  };
  let mockAudioContext: IAudioContext & {
    resume: jest.Mock<Promise<void>, []>;
  };
  let mockOnSuccess: jest.Mock;
  let originalWindow: typeof window;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    // Store original window
    originalWindow = global.window;
    
    // Mock window object
    global.window = {
      ...global.window,
      addEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as Window & typeof globalThis;

    // Mock console
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    mockAudioElement = {
      src: "",
      currentTime: 0,
      play: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as HTMLAudioElement & {
      play: jest.Mock<Promise<void>, []>;
      addEventListener: jest.Mock<void, [string, EventListener, boolean | AddEventListenerOptions | undefined]>;
    };

    mockAudioContext = {
      state: "suspended",
      resume: jest.fn().mockResolvedValue(undefined),
    } as unknown as IAudioContext & {
      resume: jest.Mock<Promise<void>, []>;
    };

    mockOnSuccess = jest.fn();
  });

  afterEach(() => {
    // Restore original window and console
    global.window = originalWindow;
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    jest.clearAllMocks();
  });

  it("should handle play failure and call onSuccess", async () => {
    mockAudioElement.play = jest.fn().mockRejectedValue(new Error("Play failed"));
    const expectedSource = "test.mp3";

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, mockOnSuccess, expectedSource);

    // Simulate an unlock event
    const event = new Event("touchend");
    const eventHandler = (window.addEventListener as jest.Mock).mock.calls[0][1];
    await eventHandler(event);

    expect(mockAudioElement.src).toBe(expectedSource);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should handle playing event with expected source", async () => {
    const expectedSource = "test.mp3";
    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, mockOnSuccess, expectedSource);

    // Simulate an unlock event
    const event = new Event("touchend");
    const eventHandler = (window.addEventListener as jest.Mock).mock.calls[0][1];
    await eventHandler(event);

    // Simulate playing event
    const playingEvent = new Event("playing");
    const playingHandler = (mockAudioElement.addEventListener as jest.Mock).mock.calls.find(
      (call: [string, EventListener, boolean | AddEventListenerOptions | undefined]) => call[0] === "playing"
    )?.[1];
    playingHandler?.(playingEvent);

    expect(mockAudioElement.currentTime).toBe(0);
    expect(mockAudioElement.src).toBe(expectedSource);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should log when audio is safe to play", async () => {
    const expectedSource = "test.mp3";
    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, mockOnSuccess, expectedSource);

    // Simulate an unlock event
    const event = new Event("touchend");
    const eventHandler = (window.addEventListener as jest.Mock).mock.calls[0][1];
    await eventHandler(event);

    // Simulate playing event
    const playingEvent = new Event("playing");
    const playingHandler = (mockAudioElement.addEventListener as jest.Mock).mock.calls.find(
      (call: [string, EventListener, boolean | AddEventListenerOptions | undefined]) => call[0] === "playing"
    )?.[1];
    playingHandler?.(playingEvent);

    expect(mockConsoleLog).toHaveBeenCalledWith('safe to play later', expectedSource);
  });

  it("should not log when no expected source is provided", async () => {
    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, mockOnSuccess);

    // Simulate an unlock event
    const event = new Event("touchend");
    const eventHandler = (window.addEventListener as jest.Mock).mock.calls[0][1];
    await eventHandler(event);

    // Simulate playing event
    const playingEvent = new Event("playing");
    const playingHandler = (mockAudioElement.addEventListener as jest.Mock).mock.calls.find(
      (call: [string, EventListener, boolean | AddEventListenerOptions | undefined]) => call[0] === "playing"
    )?.[1];
    playingHandler?.(playingEvent);

    expect(mockConsoleLog).toHaveBeenCalledWith('safe to play later', undefined);
  });
});
