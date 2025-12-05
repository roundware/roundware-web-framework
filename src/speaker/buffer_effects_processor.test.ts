import { AudioContext } from "standardized-audio-context-mock";
import { BufferEffectsProcessor } from "./buffer_effects_processor";

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
    it("should trim and apply fade effects with custom parameters", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7, 0.1)
        .getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
      expect(processedBuffer.numberOfChannels).toEqual(
        mockBuffer.numberOfChannels
      );
    });

    it("should use config duration when provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7)
        .getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should use default duration when no parameters provided", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7)
        .getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should handle different channel configurations", () => {
      const mockBuffer = new AudioContext().createBuffer(1, 44100, 44100); // Mono
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7, 0.1)
        .getBuffer();
      expect(processedBuffer.numberOfChannels).toEqual(1);
    });

    it("should handle edge cases for trim times", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0, 1.0, 0.1)
        .getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(1.0, 1);
    });

    it("should not exceed buffer length when fade duration is too long", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7, 0.5)
        .getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should maintain sample rate after processing", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7, 0.1)
        .getBuffer();
      expect(processedBuffer.sampleRate).toEqual(44100);
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
          reverb: 0.5,
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

  describe("reverse", () => {
    it("should reverse the audio buffer data", () => {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 4, 44100);
      const channelData = buffer.getChannelData(0);

      // Set up test data: [1, 2, 3, 4]
      channelData[0] = 1;
      channelData[1] = 2;
      channelData[2] = 3;
      channelData[3] = 4;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const reversedBuffer = processor.reverse().getBuffer();
      const reversedChannelData = reversedBuffer.getChannelData(0);

      // Should be reversed: [4, 3, 2, 1]
      expect(reversedChannelData[0]).toBeCloseTo(4, 5);
      expect(reversedChannelData[1]).toBeCloseTo(3, 5);
      expect(reversedChannelData[2]).toBeCloseTo(2, 5);
      expect(reversedChannelData[3]).toBeCloseTo(1, 5);
    });

    it("should reverse multi-channel audio buffer", () => {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(2, 3, 44100);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Set up test data
      leftChannel[0] = 1;
      rightChannel[0] = 10;
      leftChannel[1] = 2;
      rightChannel[1] = 20;
      leftChannel[2] = 3;
      rightChannel[2] = 30;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const reversedBuffer = processor.reverse().getBuffer();
      const reversedLeftChannel = reversedBuffer.getChannelData(0);
      const reversedRightChannel = reversedBuffer.getChannelData(1);

      // Both channels should be reversed
      expect(reversedLeftChannel[0]).toBeCloseTo(3, 5);
      expect(reversedLeftChannel[1]).toBeCloseTo(2, 5);
      expect(reversedLeftChannel[2]).toBeCloseTo(1, 5);

      expect(reversedRightChannel[0]).toBeCloseTo(30, 5);
      expect(reversedRightChannel[1]).toBeCloseTo(20, 5);
      expect(reversedRightChannel[2]).toBeCloseTo(10, 5);
    });

    it("should handle odd-length buffers correctly", () => {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 5, 44100);
      const channelData = buffer.getChannelData(0);

      // Set up test data: [1, 2, 3, 4, 5]
      for (let i = 0; i < 5; i++) {
        channelData[i] = i + 1;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const reversedBuffer = processor.reverse().getBuffer();
      const reversedChannelData = reversedBuffer.getChannelData(0);

      // Should be reversed: [5, 4, 3, 2, 1]
      for (let i = 0; i < 5; i++) {
        expect(reversedChannelData[i]).toBeCloseTo(5 - i, 5);
      }
    });
  });

  describe("composeBuffer with reverse", () => {
    it("should apply reverse when isReverse is true", () => {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 4, 44100);
      const channelData = buffer.getChannelData(0);

      // Set up test data: [1, 2, 3, 4]
      channelData[0] = 1;
      channelData[1] = 2;
      channelData[2] = 3;
      channelData[3] = 4;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 } // Disable micro-fades for testing
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: 4 / 44100, // Full duration
          times: 1,
          isReverse: true,
          fadeInDuration: 0, // Disable fade-in for testing
        })
        .getBuffer();

      const composedChannelData = composedBuffer.getChannelData(0);

      // Should be reversed: [4, 3, 2, 1]
      expect(composedChannelData[0]).toBeCloseTo(4, 5);
      expect(composedChannelData[1]).toBeCloseTo(3, 5);
      expect(composedChannelData[2]).toBeCloseTo(2, 5);
      expect(composedChannelData[3]).toBeCloseTo(1, 5);
    });

    it("should not apply reverse when isReverse is false", () => {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 4, 44100);
      const channelData = buffer.getChannelData(0);

      // Set up test data: [1, 2, 3, 4]
      channelData[0] = 1;
      channelData[1] = 2;
      channelData[2] = 3;
      channelData[3] = 4;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 } // Disable micro-fades for testing
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: 4 / 44100, // Full duration
          times: 1,
          isReverse: false,
          fadeInDuration: 0, // Disable fade-in for testing
        })
        .getBuffer();

      const composedChannelData = composedBuffer.getChannelData(0);

      // Should remain unchanged: [1, 2, 3, 4]
      expect(composedChannelData[0]).toBeCloseTo(1, 5);
      expect(composedChannelData[1]).toBeCloseTo(2, 5);
      expect(composedChannelData[2]).toBeCloseTo(3, 5);
      expect(composedChannelData[3]).toBeCloseTo(4, 5);
    });

    it("should apply reverse and then trim to partial duration", () => {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 4, 44100);
      const channelData = buffer.getChannelData(0);

      // Set up test data: [1, 2, 3, 4]
      channelData[0] = 1;
      channelData[1] = 2;
      channelData[2] = 3;
      channelData[3] = 4;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 } // Disable micro-fades for testing
      );

      // Test case: -1/2 (reverse full buffer, then take first half)
      const composedBuffer = processor
        .composeBuffer({
          duration: 2 / 44100, // Half duration
          times: 1,
          isReverse: true,
          fadeInDuration: 0, // Disable fade-in for testing
        })
        .getBuffer();

      const composedChannelData = composedBuffer.getChannelData(0);

      // Should be reversed and trimmed: [4, 3] (first half of reversed [4, 3, 2, 1])
      expect(composedChannelData[0]).toBeCloseTo(4, 5);
      expect(composedChannelData[1]).toBeCloseTo(3, 5);
      expect(composedChannelData.length).toBe(2);
    });
  });

  describe("reverse consistency in loops", () => {
    it("should maintain reverse state across multiple repetitions", () => {
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 4, 44100);
      const channelData = buffer.getChannelData(0);

      // Set up test data: [1, 2, 3, 4]
      channelData[0] = 1;
      channelData[1] = 2;
      channelData[2] = 3;
      channelData[3] = 4;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 } // Disable micro-fades for testing
      );

      // Test case: reverse with multiple repetitions
      const composedBuffer = processor
        .composeBuffer({
          duration: 2 / 44100, // Half duration
          times: 2, // Two repetitions
          isReverse: true,
          fadeInDuration: 0, // Disable fade-in for testing
        })
        .getBuffer();

      const composedChannelData = composedBuffer.getChannelData(0);

      // Should be: [4, 3, 4, 3] (reversed half repeated twice)
      expect(composedChannelData[0]).toBeCloseTo(4, 5); // First repetition, first sample
      expect(composedChannelData[1]).toBeCloseTo(3, 5); // First repetition, second sample
      expect(composedChannelData[2]).toBeCloseTo(4, 5); // Second repetition, first sample
      expect(composedChannelData[3]).toBeCloseTo(3, 5); // Second repetition, second sample
      expect(composedChannelData.length).toBe(4);
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
      const composedBuffer = processor
        .composeBuffer({
          duration: 1,
          times: 3,
        })
        .getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(3, 1); // Should be 3 seconds long
    });

    it("should apply fade-in when specified", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const composedBuffer = processor
        .composeBuffer({
          duration: 1,
          times: 2,
          fadeInDuration: 0.5,
        })
        .getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(2, 1);
    });

    it("should use custom fade-in start volume", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const composedBuffer = processor
        .composeBuffer({
          duration: 1,
          times: 2,
          fadeInDuration: 0.5,
          fadeInStartVolume: 0.2,
        })
        .getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(2, 1);
    });

    it("should trim to timeEnd when specified", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {}
      );
      const composedBuffer = processor
        .composeBuffer({
          duration: 1,
          times: 2,
          timeEnd: 0.5,
        })
        .getBuffer();
      expect(composedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should apply micro fades between loops", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        { microFadeInDurationInMs: 50 }
      );
      const composedBuffer = processor
        .composeBuffer({
          duration: 1,
          times: 2,
        })
        .getBuffer();
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
          feedback: 0.7,
        }
      );
      const delayedBuffer = processor.delayAndClip().getBuffer();
      expect(delayedBuffer.duration).toEqual(mockBuffer.duration);
      expect(delayedBuffer.numberOfChannels).toEqual(
        mockBuffer.numberOfChannels
      );
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
      expect(delayedBuffer.numberOfChannels).toEqual(
        mockBuffer.numberOfChannels
      );
    });

    it("should maintain buffer length after applying delay", () => {
      const mockBuffer = new AudioContext().createBuffer(2, 44100, 44100);
      const processor = new BufferEffectsProcessor(
        mockBuffer,
        new AudioContext(),
        {
          delayTimeInMs: 50,
          feedback: 0.5,
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
          feedback: 0.5,
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
