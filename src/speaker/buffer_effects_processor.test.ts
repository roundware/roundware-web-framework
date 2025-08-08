import { IAudioBuffer, IAudioContext } from "standardized-audio-context";
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { AudioContext } from "standardized-audio-context-mock";

describe("BufferEffectsProcessor", () => {
  describe("trim", () => {
    it("should trim the buffer", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        new AudioContext(),
        {}
      );
      const trimmedBuffer = processor.trim(0, 0.5).getBuffer();
      expect(trimmedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should handle trim with non-zero start time", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        new AudioContext(),
        {}
      );
      const trimmedBuffer = processor.trim(0.2, 0.7).getBuffer();
      expect(trimmedBuffer.duration).toBeCloseTo(0.5, 1);
    });
  });

  describe("trimAndFadeInAndOut", () => {
    it("should trim and apply fades in a single pass", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7, 0.1).getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should use default fade duration from config", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const processedBuffer = processor.trimAndFadeInAndOut(0.2, 0.7).getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });
  });

  describe("delayReverbClip", () => {
    it("should apply both delay and reverb effects", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 441000, 44100),
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
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
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        new AudioContext(),
        {}
      );
      const processedBuffer = processor.reverbAndClip().getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(10, 1);
    });
  });
});
