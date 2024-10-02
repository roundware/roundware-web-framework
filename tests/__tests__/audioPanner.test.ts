import { IAudioContext, IStereoPannerNode } from "standardized-audio-context";
import { AudioPanner } from "../../src/audioPanner";
import { random } from "../../src/utils";

jest.mock("../../src/utils");

const mockRandom = random as jest.MockedFunction<typeof random>;

describe("AudioPanner", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should instantiate AudioPanner", () => {
    const audioContext = {} as IAudioContext;
    const panNode = {} as IStereoPannerNode<IAudioContext>;

    const audioPanner = new AudioPanner(0, 1, 2, 3, panNode, audioContext);

    expect(audioPanner).toBeInstanceOf(AudioPanner);
  });

  test("should update parameters", () => {
    const audioContext = {} as IAudioContext;
    const panNode = {} as IStereoPannerNode<IAudioContext>;
    const audioPanner = new AudioPanner(0, 1, 2, 3, panNode, audioContext);

    audioPanner.updateParams();

    expect(mockRandom).toHaveBeenCalledTimes(3); // Called for initial, final, and duration
  });

  test("should start panning", () => {
    const audioContext = {
      currentTime: 0,
    } as IAudioContext;
    const panNode = {
      pan: {
        value: 0,
        linearRampToValueAtTime: jest.fn(),
      },
    } as unknown as IStereoPannerNode<IAudioContext>;

    const audioPanner = new AudioPanner(0, 1, 2, 3, panNode, audioContext);

    audioPanner.start();

    expect(panNode.pan.linearRampToValueAtTime).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number)
    );

    // Ensure the timer function is called
    jest.runOnlyPendingTimers();
    expect(mockRandom).toHaveBeenCalledTimes(3); // Called for initial, final, and duration
  });

  test("should clear timeout", () => {
    const audioContext = {} as IAudioContext;
    const panNode = {} as IStereoPannerNode<IAudioContext>;

    const audioPanner = new AudioPanner(0, 1, 2, 3, panNode, audioContext);

    audioPanner.start();
    audioPanner.clear();

    expect(clearTimeout).toHaveBeenCalled();
  });
});
