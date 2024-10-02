// __tests__/utils.test.ts
import { AudioContext } from "standardized-audio-context-mock";
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
} from "../../src/utils"; // Update this path based on your project structure

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
  class MockAudioContext {
    state = "suspended";
    resume = jest.fn();
  }

  beforeEach(() => {
    // Add AudioContext to the global window object
    (global as any).window = {
      AudioContext: MockAudioContext,
      document: {
        body: {
          addEventListener: jest.fn(),
        },
      },
    };

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("should create an AudioContext instance", () => {
    const audioContext = buildAudioContext();
    expect(audioContext).toBeInstanceOf(MockAudioContext);
  });

  it("should call unlockAudioContext with body and audioContext", () => {
    const audioContext = buildAudioContext();
    expect(
      (global as any).window.document.body.addEventListener
    ).toHaveBeenCalledWith(expect.any(String), expect.any(Function), {
      once: true,
    });
    expect(audioContext.resume).toHaveBeenCalled();
  });

  it("should set up onstatechange event handler", () => {
    const audioContext = buildAudioContext();
    // Simulate the onstatechange event with a mock Event object
    const mockEvent = new Event("statechange");

    // Check if audioContext is not null before calling onstatechange
    if (audioContext) {
      audioContext.onstatechange?.(mockEvent);
      expect(console.info).toHaveBeenCalledWith(
        `[Audio Context]: ${audioContext.state}`
      );
    } else {
      fail("audioContext is null");
    }
  });

  // After all tests, clean up the global object
  afterAll(() => {
    delete (global as any).window;
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
