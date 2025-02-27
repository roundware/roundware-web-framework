import { IAudioBuffer, IAudioContext } from "standardized-audio-context";
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { AudioContext } from "standardized-audio-context-mock";

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
  });

  // fade should not increase the duration of the buffer
  describe("fades", () => {
    it("fadeIn should not change the duration of the buffer", () => {
      // 10 seconds
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeIn(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });
    it("fadeOut should not change the duration of the buffer", () => {
      // 10 seconds
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeOut(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    it("fadeInAndOut should not change the duration of the buffer", () => {
      // 10 seconds
      const mockBuffer = new AudioContext().createBuffer(2, 10, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const fadedBuffer = processor.fadeInAndOut(0.5).getBuffer();
      expect(fadedBuffer.duration).toEqual(mockBuffer.duration);
    });

    // microFadeInAndOut should not change the duration of the buffer
    it("microFadeInAndOut should not change the duration of the buffer", () => {
      // 10 seconds
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

  //  delay should not increase the duration of the buffer
  describe("delay", () => {
    it("should not change the duration of the buffer", () => {
      // 10 seconds
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
});
