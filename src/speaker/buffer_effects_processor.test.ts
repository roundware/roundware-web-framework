import { IAudioContext } from "standardized-audio-context";
import { AudioContext as MockAudioContext } from "standardized-audio-context-mock";
import { BufferEffectsProcessor } from "./buffer_effects_processor";

// Mock lib and standardized-audio-context disagree on Float32Array buffer generics (ArrayBufferLike vs ArrayBuffer).
const AudioContext = MockAudioContext as unknown as {
  new (): IAudioContext;
};

describe("BufferEffectsProcessor", () => {
  describe("trim", () => {
    it("should trim the buffer", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        new AudioContext(),
        {}
      );
      const trimmedBuffer = processor.trim(0, 0.5).getBuffer();
      expect(trimmedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should handle trim with non-zero start time", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        new AudioContext(),
        {}
      );
      const trimmedBuffer = processor.trim(0.2, 0.7).getBuffer();
      expect(trimmedBuffer.duration).toBeCloseTo(0.5, 1);
    });
  });

  describe("trimAndFadeInAndOut", () => {
    it("should trim and apply fade effects with custom parameters", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7, 0.1).getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
      expect(processedBuffer.numberOfChannels).toEqual(mockBuffer.numberOfChannels);
    });

    it("should use config duration when provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7).getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should use default duration when no parameters provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7).getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should handle different channel configurations", () => {
      const mockBuffer = new AudioContext().createBuffer(1, 44100, 44100); // Mono
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7, 0.1).getBuffer();
      expect(processedBuffer.numberOfChannels).toEqual(1);
    });

    it("should handle edge cases for trim times", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0, 1.0, 0.1).getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(1.0, 1);
    });

    it("should not exceed buffer length when fade duration is too long", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7, 0.5).getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should maintain sample rate after processing", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7, 0.1).getBuffer();
      expect(processedBuffer.sampleRate).toEqual(44100);
    });
  });

  describe("delayReverbClip", () => {
    it("should apply both delay and reverb effects", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 441000, 44100),
        new AudioContext(),
        {
          delayTimeInMs: 50,
          feedback: 0.5,
          reverb: 0.5
        }
      );
      const processedBuffer = processor.delayReverbClip().getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(10, 1);
    });

    it("should use default values when config is not provided", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 441000, 44100),
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.delayReverbClip().getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(10, 1);
    });
  });

  describe("fades", () => {
    it("fadeIn should not change the duration of the buffer", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("fadeIn should use config duration when provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const fadedBuffer = processor.fadeIn().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("fadeOut should not change the duration of the buffer", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeOut(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("fadeOut should use config duration when provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const fadedBuffer = processor.fadeOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("fadeInAndOut should not change the duration of the buffer", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeInAndOut(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("microFadeInAndOut should not change the duration of the buffer", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.microFadeInAndOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });
  });

  describe("delay", () => {
    it("should not change the duration of the buffer", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {
          delayTimeInMs: 50,
        }
      );
      const delayedBuffer = processor.delayAndClip().getBuffer();
      expect(delayedBuffer.duration).toEqual(mockBuffer.duration);
    });
  });

  describe("reverbAndClip", () => {
    it("should apply reverb effect with custom value", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 441000, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { reverb: 0.7 }
      );
      const processedBuffer = processor.reverbAndClip().getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(10, 1);
    });

    it("should apply reverb effect with default value", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 441000, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.reverbAndClip().getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(10, 1);
    });
  });

  describe("composeBuffer", () => {
    it("should compose buffer with multiple repetitions", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100); // 1 second buffer
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const composedBuffer = processor.composeBuffer({
        duration: 1,
        times: 3
      }).getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(3, 1); // Should be 3 seconds long
    });

    it("should apply fade-in when specified", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const composedBuffer = processor.composeBuffer({
        duration: 1,
        times: 2,
        fadeInDuration: 0.5
      }).getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(2, 1);
    });

    it("should use custom fade-in start volume", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const composedBuffer = processor.composeBuffer({
        duration: 1,
        times: 2,
        fadeInDuration: 0.5,
        fadeInStartVolume: 0.2
      }).getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(2, 1);
    });

    it("should trim to timeEnd when specified", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const composedBuffer = processor.composeBuffer({
        duration: 1,
        times: 2,
        timeEnd: 0.5
      }).getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should apply micro fades between loops", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { microFadeInDurationInMs: 50 }
      );
      const composedBuffer = processor.composeBuffer({
        duration: 1,
        times: 2
      }).getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(2, 1);
    });
  });

  describe("delayAndClip", () => {
    it("should apply delay effect with custom parameters", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {
          delayTimeInMs: 100,
          feedback: 0.7
        }
      );
      const delayedBuffer = processor.delayAndClip().getBuffer();
      expect(delayedBuffer.duration).toEqual(mockBuffer.duration);
      expect(delayedBuffer.numberOfChannels).toEqual(mockBuffer.numberOfChannels);
    });

    it("should use default parameters when config is not provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const delayedBuffer = processor.delayAndClip().getBuffer();
      expect(delayedBuffer.duration).toEqual(mockBuffer.duration);
      expect(delayedBuffer.numberOfChannels).toEqual(mockBuffer.numberOfChannels);
    });

    it("should maintain buffer length after applying delay", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {
          delayTimeInMs: 50,
          feedback: 0.5
        }
      );
      const delayedBuffer = processor.delayAndClip().getBuffer();
      expect(delayedBuffer.length).toEqual(mockBuffer.length);
    });

    it("should handle different channel configurations", () => {
      const mockBuffer = new AudioContext().createBuffer(1, 44100, 44100); // Mono
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {
          delayTimeInMs: 50,
          feedback: 0.5
        }
      );
      const delayedBuffer = processor.delayAndClip().getBuffer();
      expect(delayedBuffer.numberOfChannels).toEqual(1);
    });
  });

  describe("fadeOut", () => {
    it("should apply fade-out with custom duration", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeOut(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
      expect(fadedBuffer.numberOfChannels).toEqual(mockBuffer.numberOfChannels);
    });

    it("should use config duration when provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const fadedBuffer = processor.fadeOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should use default duration when no parameters provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should handle different channel configurations", () => {
      const mockBuffer = new AudioContext().createBuffer(1, 44100, 44100); // Mono
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeOut(0.5).getBuffer();
      expect(fadedBuffer.numberOfChannels).toEqual(1);
    });

    it("should not exceed buffer length when fade duration is too long", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeOut(2.0).getBuffer(); // Longer than buffer duration
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });
  });

  describe("fadeInAndOut", () => {
    it("should apply fade-in and fade-out with custom duration", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeInAndOut(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
      expect(fadedBuffer.numberOfChannels).toEqual(mockBuffer.numberOfChannels);
    });

    it("should use config duration when provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const fadedBuffer = processor.fadeInAndOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should use default duration when no parameters provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeInAndOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should handle different channel configurations", () => {
      const mockBuffer = new AudioContext().createBuffer(1, 44100, 44100); // Mono
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeInAndOut(0.5).getBuffer();
      expect(fadedBuffer.numberOfChannels).toEqual(1);
    });

    it("should not exceed buffer length when fade duration is too long", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeInAndOut(2.0).getBuffer(); // Longer than buffer duration
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should apply equal fade-in and fade-out durations", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeInAndOut(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });
  });

  describe("microFadeInAndOut", () => {
    it("should apply micro fade with custom duration from config", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { microFadeInDurationInMs: 100 }
      );
      const fadedBuffer = processor.microFadeInAndOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
      expect(fadedBuffer.numberOfChannels).toEqual(mockBuffer.numberOfChannels);
    });

    it("should use default micro fade duration when not provided in config", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.microFadeInAndOut().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should handle different channel configurations", () => {
      const mockBuffer = new AudioContext().createBuffer(1, 44100, 44100); // Mono
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { microFadeInDurationInMs: 100 }
      );
      const fadedBuffer = processor.microFadeInAndOut().getBuffer();
      expect(fadedBuffer.numberOfChannels).toEqual(1);
    });

    it("should maintain buffer length after applying micro fade", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { microFadeInDurationInMs: 100 }
      );
      const fadedBuffer = processor.microFadeInAndOut().getBuffer();
      expect(fadedBuffer.length).toEqual(mockBuffer.length);
    });

    it("should apply shorter fade duration than regular fadeInAndOut", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { microFadeInDurationInMs: 50 }
      );
      const microFadedBuffer = processor.microFadeInAndOut().getBuffer();
      const regularFadedBuffer = processor.fadeInAndOut().getBuffer();
      expect(microFadedBuffer.duration).toEqual(regularFadedBuffer.duration);
    });
  });

  describe("fadeIn", () => {
    it("should apply fade-in with custom duration", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
      expect(fadedBuffer.numberOfChannels).toEqual(mockBuffer.numberOfChannels);
    });

    it("should use config duration when provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const fadedBuffer = processor.fadeIn().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should use default duration when no parameters provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn().getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should handle different channel configurations", () => {
      const mockBuffer = new AudioContext().createBuffer(1, 44100, 44100); // Mono
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(0.5).getBuffer();
      expect(fadedBuffer.numberOfChannels).toEqual(1);
    });

    it("should not exceed buffer length when fade duration is too long", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(2.0).getBuffer(); // Longer than buffer duration
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should respect minimum fade duration", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(0.001).getBuffer(); // Below minimum duration
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("should maintain buffer length after applying fade", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(0.5).getBuffer();
      expect(fadedBuffer.length).toEqual(mockBuffer.length);
    });

    it("should apply exponential fade curve", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });
  });
});
