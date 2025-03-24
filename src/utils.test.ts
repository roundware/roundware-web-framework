// __tests__/utils.test.ts
import { AudioContext } from "standardized-audio-context-mock";
import { IAudioContext, TAudioContextState } from "standardized-audio-context";
import {
  cleanAudioURL,
  coordsToPoints,
  random,
  randomInt,
  unlockAudioContext,
  isIos,
  normalizeCoords,
  isEmpty,
  hasOwnProperty,
  NEARLY_ZERO,
  UNLOCK_AUDIO_EVENTS,
  buildAudioContext,
  getUrlParam,
  NO_OP,
  debugLogger,
  speakerLog,
  playlistTrackLog,
  timestamp,
  makeAudioSafeToPlay,
  silenceAudioBase64,
} from "./utils"; // Update this path based on your project structure

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
});

describe("randomInt", () => {
  it("should generate a random integer between given range", () => {
    const result = randomInt(5, 10);
    expect(result).toBeGreaterThanOrEqual(5);
    expect(result).toBeLessThanOrEqual(10);
  });
});

describe("buildAudioContext", () => {
  let mockAudioContext: jest.Mock;
  let mockContext: IAudioContext;
  let mockWindow: any;

  beforeEach(() => {
    mockContext = {
      resume: jest.fn().mockReturnValue(Promise.resolve()),
      onstatechange: null,
      state: 'suspended' as TAudioContextState
    } as unknown as IAudioContext;

    // Mock the AudioContext from standardized-audio-context
    mockAudioContext = jest.fn().mockImplementation(() => mockContext);
    
    // Mock window object with document.body
    mockWindow = {
      document: {
        body: {
          addEventListener: jest.fn()
        }
      }
    };
    
    // Add AudioContext to window
    mockWindow.AudioContext = mockAudioContext;
    
    // Replace global window
    (global as any).window = mockWindow;

    // Mock the standardized-audio-context package
    jest.mock('standardized-audio-context', () => ({
      AudioContext: mockAudioContext,
      IAudioContext: jest.fn(),
      TAudioContextState: jest.fn()
    }));

    // Mock console.info
    jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (global as any).window;
    jest.resetModules();
    (console.info as jest.Mock).mockRestore();
  });


  it("should handle case where AudioContext is not available", () => {
    delete mockWindow.AudioContext;
  });

  it("should handle case where AudioContext constructor throws", () => {
    mockAudioContext.mockImplementation(() => {
      throw new Error("AudioContext not supported");
    });

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
    removeEventListener: jest.Mock<void, [string, EventListener, boolean | EventListenerOptions | undefined]>;
  };
  let mockAudioContext: IAudioContext;
  let onSuccess: jest.Mock;
  let mockConsoleLog: jest.SpyInstance;
  let mockWindow: any;
  const expectedSource = "https://example.com/audio.mp3";

  beforeEach(() => {
    // Mock window object
    mockWindow = {
      addEventListener: jest.fn()
    };
    (global as any).window = mockWindow;

    // Mock HTMLAudioElement
    mockAudioElement = {
      src: "",
      currentTime: 0,
      play: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as unknown as HTMLAudioElement & {
      play: jest.Mock<Promise<void>, []>;
      addEventListener: jest.Mock<void, [string, EventListener, boolean | AddEventListenerOptions | undefined]>;
      removeEventListener: jest.Mock<void, [string, EventListener, boolean | EventListenerOptions | undefined]>;
    };

    // Mock AudioContext with Promise-based resume
    mockAudioContext = {
      resume: jest.fn().mockReturnValue(Promise.resolve())
    } as unknown as IAudioContext;

    // Mock success callback
    onSuccess = jest.fn();

    // Mock console.log
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockRestore();
    delete (global as any).window;
  });

  it("should set up event listeners for unlock events", () => {
    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    UNLOCK_AUDIO_EVENTS.forEach(event => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
        { once: true }
      );
    });
  });

  it("should handle successful audio setup", async () => {
    const mockPlayPromise = Promise.resolve();
    mockAudioElement.play.mockReturnValue(mockPlayPromise);

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(mockAudioElement.src).toBe(silenceAudioBase64);
    expect(mockAudioElement.play).toHaveBeenCalled();
  });

  it("should handle play failure and set expected source", async () => {
    mockAudioElement.play.mockRejectedValue(new Error("Play failed"));

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    expect(mockAudioElement.src).toBe(expectedSource);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle playing event with expected source", async () => {
    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    // Get the playing event listener
    const playingListener = mockAudioElement.addEventListener.mock.calls.find(
      (call: [string, EventListener, boolean | AddEventListenerOptions | undefined]) => call[0] === "playing"
    )?.[1];

    // Call the playing event listener
    if (playingListener) {
      playingListener(new Event('playing'));
    }

    expect(mockAudioElement.currentTime).toBe(0);
    expect(mockAudioElement.src).toBe(expectedSource);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle playing event without expected source", async () => {
    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    // Get the playing event listener
    const playingListener = mockAudioElement.addEventListener.mock.calls.find(
      (call: [string, EventListener, boolean | AddEventListenerOptions | undefined]) => call[0] === "playing"
    )?.[1];

    // Call the playing event listener
    if (playingListener) {
      playingListener(new Event('playing'));
    }

    expect(mockAudioElement.currentTime).toBe(0);
    expect(mockAudioElement.src).toBe(silenceAudioBase64);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle errors during setup", async () => {
    mockAudioElement.play.mockImplementation(() => {
      throw new Error("Setup failed");
    });

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    expect(mockAudioElement.src).toBe(expectedSource);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should use silence audio as fallback when no expected source provided", async () => {
    mockAudioElement.play.mockRejectedValue(new Error("Play failed"));

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    expect(mockAudioElement.src).toBe(silenceAudioBase64);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should log when audio is safe to play", async () => {
    // Mock play to return a Promise
    mockAudioElement.play.mockReturnValue(Promise.resolve());

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    // Get the playing event listener
    const playingListener = mockAudioElement.addEventListener.mock.calls.find(
      (call: [string, EventListener, boolean | AddEventListenerOptions | undefined]) => call[0] === "playing"
    )?.[1];

    // Call the playing event listener
    if (playingListener) {
      playingListener(new Event('playing'));
    }

    expect(mockConsoleLog).toHaveBeenCalledWith('safe to play later', expectedSource);
  });

  it("should not log when no expected source is provided", async () => {
    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    // Get the playing event listener
    const playingListener = mockAudioElement.addEventListener.mock.calls.find(
      (call: [string, EventListener, boolean | AddEventListenerOptions | undefined]) => call[0] === "playing"
    )?.[1];

    // Call the playing event listener
    if (playingListener) {
      playingListener(new Event('playing'));
    }

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it("should handle case where play method is undefined", async () => {
    // Remove the play method from mockAudioElement
    delete (mockAudioElement as any).play;

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    expect(mockAudioElement.src).toBe(expectedSource);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle case where play method returns undefined", async () => {
    // Mock play to return undefined
    mockAudioElement.play.mockReturnValue(undefined as any);

    makeAudioSafeToPlay(mockAudioElement, mockAudioContext, onSuccess, expectedSource);

    // Get the unlock function that was passed to addEventListener
    const unlockFunction = (window.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Call the unlock function
    await unlockFunction();

    expect(mockAudioElement.src).toBe(expectedSource);
    expect(onSuccess).toHaveBeenCalled();
  });
});
