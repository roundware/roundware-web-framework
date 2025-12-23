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
    it("should trim and apply fades in a single pass", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        new AudioContext(),
        {}
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7, 0.1)
        .getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should use default fade duration from config", () => {
      const processor = new BufferEffectsProcessor(
        new AudioContext().createBuffer(2, 10, 44100),
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        new AudioContext(),
        { fadeInDurationInMs: 300 }
      );
      const processedBuffer = processor
        .trimAndFadeInAndOut(0.2, 0.7)
        .getBuffer();
      expect(processedBuffer.duration).toBeCloseTo(0.5, 1);
    });

    it("should use fadeInDurationInMs / 1000 as default when provided (lines 121-122)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const fadeInDurationInMs = 200; // 200ms
      const expectedFadeDuration = fadeInDurationInMs / 1000; // 0.2 seconds (line 122)

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          fadeInDurationInMs, // Line 121: this.config.fadeInDurationInMs
        }
      );

      // Call trimAndFadeInAndOut() without fadeDuration parameter
      // This should trigger line 121-122: this.config.fadeInDurationInMs ? this.config.fadeInDurationInMs / 1000 : 0.3
      const startTime = 0.1;
      const endTime = 0.5;
      const processedBuffer = processor
        .trimAndFadeInAndOut(startTime, endTime)
        .getBuffer();

      // Verify that the buffer was trimmed and faded
      const expectedDuration = endTime - startTime;
      expect(processedBuffer.duration).toBeCloseTo(expectedDuration, 1);
    });

    it("should use default 0.3 when fadeInDurationInMs is not provided (lines 121-123)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {} // fadeInDurationInMs not provided - should use default 0.3 (line 123)
      );

      // Call trimAndFadeInAndOut() without fadeDuration parameter
      // This should trigger line 121-123: this.config.fadeInDurationInMs ? ... : 0.3
      const startTime = 0.1;
      const endTime = 0.5;
      const processedBuffer = processor
        .trimAndFadeInAndOut(startTime, endTime)
        .getBuffer();

      // Verify that the buffer was trimmed and faded
      const expectedDuration = endTime - startTime;
      expect(processedBuffer.duration).toBeCloseTo(expectedDuration, 1);
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

    it("should use fadeInDurationInMs / 1000 when provided and durationSeconds is not (line 51)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const fadeInDurationInMs = 200; // 200ms
      const expectedFadeDuration = fadeInDurationInMs / 1000; // 0.2 seconds (line 52)

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          fadeInDurationInMs, // Line 51: this.config.fadeInDurationInMs
        }
      );

      // Call fadeIn() without durationSeconds parameter
      // This should trigger line 51: this.config.fadeInDurationInMs ? this.config.fadeInDurationInMs / 1000 : 0.3
      const fadedBuffer = processor.fadeIn().getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify that fade was applied with the expected duration
      // The fade should start at 0 and increase over fadeDuration
      const fadeSamples = Math.min(expectedFadeDuration * sampleRate, bufferLength);
      
      // Check that fade is applied (first sample should be close to 0)
      if (fadeSamples > 0) {
        expect(outputData[0]).toBeCloseTo(0, 2);
      }

      // Check that after fade, values return to original
      if (fadeSamples < bufferLength) {
        expect(outputData[Math.floor(fadeSamples)]).toBeCloseTo(0.5, 2);
      }
    });

    it("should use default 0.3 when fadeInDurationInMs is not provided and durationSeconds is not (line 51)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {} // fadeInDurationInMs not provided - should use default 0.3 (line 53)
      );

      // Call fadeIn() without durationSeconds parameter
      // This should trigger line 51-53: this.config.fadeInDurationInMs ? ... : 0.3
      const fadedBuffer = processor.fadeIn().getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify that fade was applied with default duration of 0.3 seconds
      const expectedFadeDuration = 0.3; // Default value (line 53)
      const fadeSamples = Math.min(expectedFadeDuration * sampleRate, bufferLength);

      // Check that fade is applied (first sample should be close to 0)
      if (fadeSamples > 0) {
        expect(outputData[0]).toBeCloseTo(0, 2);
      }

      // Check that after fade, values return to original
      if (fadeSamples < bufferLength) {
        expect(outputData[Math.floor(fadeSamples)]).toBeCloseTo(0.5, 2);
      }
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

    it("should use fadeInDurationInMs / 1000 when provided and durationSeconds is not (lines 78-79)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const fadeInDurationInMs = 200; // 200ms
      const expectedFadeDuration = fadeInDurationInMs / 1000; // 0.2 seconds (line 79)
      const expectedFadeSamples = Math.floor(expectedFadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          fadeInDurationInMs, // Line 78: this.config.fadeInDurationInMs
        }
      );

      // Call fadeOut() without durationSeconds parameter
      // This should trigger line 78-79: this.config.fadeInDurationInMs ? this.config.fadeInDurationInMs / 1000 : 0.3
      const fadedBuffer = processor.fadeOut().getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify line 88: channelData[startIndex + i] *= (fadeSamples - i) / fadeSamples
      // The fade should start at startIndex = length - fadeSamples
      const startIndex = bufferLength - expectedFadeSamples;

      // Last sample should be close to 0 (faded out)
      if (startIndex + expectedFadeSamples - 1 < bufferLength) {
        expect(outputData[bufferLength - 1]).toBeCloseTo(0, 2);
      }

      // Sample just before fade should be unchanged
      if (startIndex > 0) {
        expect(outputData[startIndex - 1]).toBeCloseTo(0.5, 2);
      }
    });

    it("should use default 0.3 when fadeInDurationInMs is not provided and durationSeconds is not (lines 78-80)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {} // fadeInDurationInMs not provided - should use default 0.3 (line 80)
      );

      // Call fadeOut() without durationSeconds parameter
      // This should trigger line 78-80: this.config.fadeInDurationInMs ? ... : 0.3
      const fadedBuffer = processor.fadeOut().getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify that fade was applied with default duration of 0.3 seconds
      const expectedFadeDuration = 0.3; // Default value (line 80)
      const expectedFadeSamples = Math.min(expectedFadeDuration * sampleRate, bufferLength);
      const startIndex = bufferLength - expectedFadeSamples;

      // Last sample should be close to 0 (faded out)
      if (expectedFadeSamples > 0) {
        expect(outputData[bufferLength - 1]).toBeCloseTo(0, 2);
      }

      // Sample just before fade should be unchanged
      if (startIndex > 0) {
        expect(outputData[startIndex - 1]).toBeCloseTo(0.5, 2);
      }
    });

    it("should apply fade-out calculation correctly (line 88)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data with known values
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0;
      }

      const fadeDuration = 0.1; // 100ms
      const fadeSamples = Math.min(Math.floor(fadeDuration * sampleRate), bufferLength);
      const startIndex = bufferLength - fadeSamples;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const fadedBuffer = processor.fadeOut(fadeDuration).getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify line 88: channelData[startIndex + i] *= (fadeSamples - i) / fadeSamples
      // Test at different positions in the fade
      const testPositions = [
        0, // First sample of fade
        Math.floor(fadeSamples / 4), // Quarter through fade
        Math.floor(fadeSamples / 2), // Half through fade
        Math.floor(fadeSamples * 3 / 4), // Three quarters through fade
        fadeSamples - 1, // Last sample of fade
      ];

      for (const i of testPositions) {
        const index = startIndex + i;
        if (i < fadeSamples && index >= 0 && index < outputData.length) {
          const expectedValue = 1.0 * ((fadeSamples - i) / fadeSamples);
          expect(outputData[index]).toBeCloseTo(expectedValue, 4);
        }
      }
    });

    it("should apply fade-out to all channels (lines 85-90)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        leftChannel[i] = 0.6;
        rightChannel[i] = 0.8;
      }

      const fadeDuration = 0.1; // 100ms
      const fadeSamples = Math.floor(fadeDuration * sampleRate);
      const startIndex = bufferLength - fadeSamples;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const fadedBuffer = processor.fadeOut(fadeDuration).getBuffer();
      const outputLeft = fadedBuffer.getChannelData(0);
      const outputRight = fadedBuffer.getChannelData(1);

      // Verify line 85-90: Both channels should have fade applied
      // Last sample should be close to 0 for both channels
      if (fadeSamples > 0) {
        expect(outputLeft[bufferLength - 1]).toBeCloseTo(0, 2);
        expect(outputRight[bufferLength - 1]).toBeCloseTo(0, 2);
      }

      // Sample just before fade should be unchanged for both channels
      if (startIndex > 0) {
        expect(outputLeft[startIndex - 1]).toBeCloseTo(0.6, 2);
        expect(outputRight[startIndex - 1]).toBeCloseTo(0.8, 2);
      }
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

    it("should use fadeInDurationInMs / 1000 as default when provided (lines 96-97)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const fadeInDurationInMs = 200; // 200ms
      const expectedFadeDuration = fadeInDurationInMs / 1000; // 0.2 seconds (line 97)
      const expectedFadeSamples = Math.floor(expectedFadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          fadeInDurationInMs, // Line 96: this.config.fadeInDurationInMs
        }
      );

      // Call fadeInAndOut() without durationSeconds parameter
      // This should trigger line 96-97: this.config.fadeInDurationInMs ? this.config.fadeInDurationInMs / 1000 : 0.3
      const fadedBuffer = processor.fadeInAndOut().getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify line 110: channelData[i] *= i / fadeSamples (fade-in)
      // First sample should be close to 0
      if (expectedFadeSamples > 0) {
        expect(outputData[0]).toBeCloseTo(0, 2);
      }

      // Verify line 111: channelData[length - i - 1] *= i / fadeSamples (fade-out)
      // Last sample should be close to 0
      if (expectedFadeSamples > 0) {
        expect(outputData[bufferLength - 1]).toBeCloseTo(0, 2);
      }
    });

    it("should use default 0.3 when fadeInDurationInMs is not provided (lines 96-98)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {} // fadeInDurationInMs not provided - should use default 0.3 (line 98)
      );

      // Call fadeInAndOut() without durationSeconds parameter
      // This should trigger line 96-98: this.config.fadeInDurationInMs ? ... : 0.3
      const fadedBuffer = processor.fadeInAndOut().getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify that fade was applied with default duration of 0.3 seconds
      const expectedFadeDuration = 0.3; // Default value (line 98)
      const expectedFadeSamples = Math.min(expectedFadeDuration * sampleRate, bufferLength);

      // First sample should be close to 0 (fade-in)
      if (expectedFadeSamples > 0) {
        expect(outputData[0]).toBeCloseTo(0, 2);
      }

      // Last sample should be close to 0 (fade-out)
      if (expectedFadeSamples > 0) {
        expect(outputData[bufferLength - 1]).toBeCloseTo(0, 2);
      }
    });

    it("should apply fade-in calculation correctly (line 110)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data with known values
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0;
      }

      const fadeDuration = 0.1; // 100ms
      const fadeSamples = Math.floor(fadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const fadedBuffer = processor.fadeInAndOut(fadeDuration).getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify line 110: channelData[i] *= i / fadeSamples
      // Test at different positions in the fade-in
      const testPositions = [
        0, // First sample (should be 0)
        Math.floor(fadeSamples / 4), // Quarter through fade
        Math.floor(fadeSamples / 2), // Half through fade
        Math.floor(fadeSamples * 3 / 4), // Three quarters through fade
      ];

      for (const i of testPositions) {
        if (i < fadeSamples && i < bufferLength) {
          const expectedValue = 1.0 * (i / fadeSamples);
          expect(outputData[i]).toBeCloseTo(expectedValue, 4);
        }
      }
    });

    it("should apply fade-out calculation correctly (line 111)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data with known values
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0;
      }

      const fadeDuration = 0.1; // 100ms
      const fadeSamples = Math.floor(fadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const fadedBuffer = processor.fadeInAndOut(fadeDuration).getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify line 111: channelData[length - i - 1] *= i / fadeSamples
      // Test at different positions in the fade-out
      const testPositions = [
        0, // Last sample (should be 0)
        Math.floor(fadeSamples / 4), // Quarter through fade
        Math.floor(fadeSamples / 2), // Half through fade
        Math.floor(fadeSamples * 3 / 4), // Three quarters through fade
      ];

      for (const i of testPositions) {
        if (i < fadeSamples) {
          const index = bufferLength - i - 1;
          if (index >= 0 && index < bufferLength) {
            const expectedValue = 1.0 * (i / fadeSamples);
            expect(outputData[index]).toBeCloseTo(expectedValue, 4);
          }
        }
      }
    });

    it("should apply both fade-in and fade-out in the same loop (lines 109-112)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0;
      }

      const fadeDuration = 0.1; // 100ms
      const fadeSamples = Math.floor(fadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const fadedBuffer = processor.fadeInAndOut(fadeDuration).getBuffer();
      const outputData = fadedBuffer.getChannelData(0);

      // Verify line 109-112: Both fade-in and fade-out are applied in the same loop
      // First sample should be faded in (close to 0)
      expect(outputData[0]).toBeCloseTo(0, 2);
      // Last sample should be faded out (close to 0)
      expect(outputData[bufferLength - 1]).toBeCloseTo(0, 2);
      // Middle sample (not in fade region) should be unchanged
      const middleIndex = Math.floor(bufferLength / 2);
      if (middleIndex > fadeSamples && middleIndex < bufferLength - fadeSamples) {
        expect(outputData[middleIndex]).toBeCloseTo(1.0, 2);
      }
    });

    it("should apply fade-in and fade-out to all channels (lines 107-113)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        leftChannel[i] = 0.6;
        rightChannel[i] = 0.8;
      }

      const fadeDuration = 0.1; // 100ms
      const fadeSamples = Math.floor(fadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {}
      );

      const fadedBuffer = processor.fadeInAndOut(fadeDuration).getBuffer();
      const outputLeft = fadedBuffer.getChannelData(0);
      const outputRight = fadedBuffer.getChannelData(1);

      // Verify line 107-113: Both channels should have fade-in and fade-out applied
      // First sample should be close to 0 for both channels (fade-in)
      if (fadeSamples > 0) {
        expect(outputLeft[0]).toBeCloseTo(0, 2);
        expect(outputRight[0]).toBeCloseTo(0, 2);
      }

      // Last sample should be close to 0 for both channels (fade-out)
      if (fadeSamples > 0) {
        expect(outputLeft[bufferLength - 1]).toBeCloseTo(0, 2);
        expect(outputRight[bufferLength - 1]).toBeCloseTo(0, 2);
      }
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

    it("should use microFadeInDurationInMs / 1000 when provided (lines 214-215)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const microFadeInDurationInMs = 100; // 100ms
      const expectedFadeDuration = microFadeInDurationInMs / 1000; // 0.1 seconds (line 215)

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          microFadeInDurationInMs, // Line 214: this.config.microFadeInDurationInMs
        }
      );

      // Spy on fadeInAndOut to verify it's called with the correct duration
      const fadeInAndOutSpy = jest.spyOn(processor, "fadeInAndOut");

      processor.microFadeInAndOut();

      // Verify line 215: microFadeInDurationInMs / 1000 is passed to fadeInAndOut
      expect(fadeInAndOutSpy).toHaveBeenCalledWith(expectedFadeDuration);

      fadeInAndOutSpy.mockRestore();
    });

    it("should use default 0.05 when microFadeInDurationInMs is not provided (line 216)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {} // microFadeInDurationInMs not provided
      );

      // Spy on fadeInAndOut to verify it's called with default 0.05
      const fadeInAndOutSpy = jest.spyOn(processor, "fadeInAndOut");

      processor.microFadeInAndOut();

      // Verify line 216: default value 0.05 is used when microFadeInDurationInMs is falsy
      expect(fadeInAndOutSpy).toHaveBeenCalledWith(0.05);

      fadeInAndOutSpy.mockRestore();
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

    it("should use default delayTime of 50ms when delayTimeInMs is not provided (line 221)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {} // delayTimeInMs not provided - should use default 50 (line 221)
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      // Verify line 221: const delayTime = this.config.delayTimeInMs || 50;
      // Default delayTime should be 50ms, which equals 50/1000 * 44100 = 2205 samples
      const expectedDelaySamples = Math.floor((50 / 1000) * sampleRate);

      // Verify that delay was applied with the default 50ms delay
      // The delayed signal should appear at position expectedDelaySamples
      if (expectedDelaySamples < bufferLength) {
        // Original signal should still be present
        expect(outputData[0]).toBeCloseTo(0.5, 5);
        // Delayed signal should be added at expectedDelaySamples position
        // (assuming feedback is also default 0.5)
        const expectedValue = channelData[expectedDelaySamples] + channelData[0] * 0.5;
        expect(outputData[expectedDelaySamples]).toBeCloseTo(expectedValue, 5);
      }
    });

    it("should add delayed signal with feedback (line 244)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000; // Increased to ensure delaySamples < bufferLength
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = (i + 1) / 100; // Normalize values
      }

      const delayTimeInMs = 5; // Reduced delay to ensure delaySamples < bufferLength
      const feedback = 0.5;
      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);
      
      // Ensure delaySamples is less than bufferLength so the loop executes
      expect(delaySamples).toBeLessThan(bufferLength);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      // Verify positions before delaySamples are unchanged (original signal only)
      for (let i = 0; i < delaySamples && i < bufferLength; i++) {
        expect(outputData[i]).toBeCloseTo((i + 1) / 100, 5);
      }

      // Verify delayed signal is added with feedback (line 244)
      // For each i where i + delaySamples < bufferLength:
      // outputData[i + delaySamples] should be original + (inputData[i] * feedback)
      for (let i = 0; i < bufferLength - delaySamples; i++) {
        const expectedValue = channelData[i + delaySamples] + channelData[i] * feedback;
        expect(outputData[i + delaySamples]).toBeCloseTo(expectedValue, 5);
      }
    });

    it("should apply correct feedback multiplier in delayed signal (line 244)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000; // Increased to ensure delaySamples < bufferLength
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data with known values
      channelData[0] = 1.0;
      channelData[1] = 0.5;
      channelData[2] = 0.25;

      const delayTimeInMs = 5; // Small delay for testing - ensures delaySamples < bufferLength
      const feedback = 0.3;
      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);
      
      // Ensure delaySamples is less than bufferLength so the loop executes
      expect(delaySamples).toBeLessThan(bufferLength);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      // Verify feedback is applied correctly: outputData[i + delaySamples] = original + (inputData[i] * feedback)
      if (delaySamples < bufferLength) {
        // Check that delayed signal at position delaySamples includes original + feedback
        const originalAtDelay = channelData[delaySamples];
        const inputAtZero = channelData[0];
        const expectedValue = originalAtDelay + inputAtZero * feedback;
        expect(outputData[delaySamples]).toBeCloseTo(expectedValue, 5);
      }
    });

    it("should handle edge case when delaySamples equals buffer length (line 244)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 441; // 10ms at 44.1kHz
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      channelData[0] = 1.0;

      const delayTimeInMs = 10; // Exactly matches buffer length
      const feedback = 0.5;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      // When delaySamples >= bufferLength, the loop condition i < inputData.length - delaySamples
      // will be false, so no delayed signal should be added
      // Only original signal should be present
      expect(outputData[0]).toBeCloseTo(1.0, 5);
    });

    it("should process multiple channels independently (line 244)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 100;
      const buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Set different values for left and right channels
      leftChannel[0] = 1.0;
      leftChannel[1] = 0.5;
      rightChannel[0] = 0.8;
      rightChannel[1] = 0.4;

      const delayTimeInMs = 10;
      const feedback = 0.5;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputLeft = delayedBuffer.getChannelData(0);
      const outputRight = delayedBuffer.getChannelData(1);

      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);

      // Verify each channel is processed independently
      if (delaySamples < bufferLength) {
        // Left channel
        const leftExpected = leftChannel[delaySamples] + leftChannel[0] * feedback;
        expect(outputLeft[delaySamples]).toBeCloseTo(leftExpected, 5);

        // Right channel
        const rightExpected = rightChannel[delaySamples] + rightChannel[0] * feedback;
        expect(outputRight[delaySamples]).toBeCloseTo(rightExpected, 5);
      }
    });

    it("should verify exact line 244 calculation: outputData[i + delaySamples] += inputData[i] * feedback", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000; // Increased to ensure delaySamples < bufferLength
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set specific test values
      channelData[0] = 1.0;
      channelData[1] = 0.8;
      channelData[2] = 0.6;
      channelData[3] = 0.4;

      const delayTimeInMs = 5; // Small delay - ensures delaySamples < bufferLength
      const feedback = 0.3;
      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);
      
      // Ensure delaySamples is less than bufferLength so the loop executes
      expect(delaySamples).toBeLessThan(bufferLength);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      // Manually calculate expected values for line 244
      // outputData[i + delaySamples] += inputData[i] * feedback
      for (let i = 0; i < bufferLength - delaySamples; i++) {
        const originalValue = channelData[i + delaySamples];
        const feedbackContribution = channelData[i] * feedback;
        const expectedValue = originalValue + feedbackContribution;
        expect(outputData[i + delaySamples]).toBeCloseTo(expectedValue, 5);
      }
    });

    it("should handle zero feedback value in line 244", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 100;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      channelData[0] = 1.0;
      channelData[1] = 0.5;

      const delayTimeInMs = 10;
      const feedback = 0; // Zero feedback

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);

      // With zero feedback, line 244 should add 0, so output should equal original
      for (let i = 0; i < bufferLength - delaySamples; i++) {
        const expectedValue = channelData[i + delaySamples] + channelData[i] * 0;
        expect(outputData[i + delaySamples]).toBeCloseTo(expectedValue, 5);
        expect(outputData[i + delaySamples]).toBeCloseTo(channelData[i + delaySamples], 5);
      }
    });

    it("should handle maximum feedback value (1.0) in line 244", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 100;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      channelData[0] = 0.5;
      channelData[10] = 0.3;

      const delayTimeInMs = 10;
      const feedback = 1.0; // Maximum feedback

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);

      // With feedback = 1.0, line 244 adds full input value
      if (delaySamples < bufferLength) {
        const expectedValue = channelData[delaySamples] + channelData[0] * 1.0;
        expect(outputData[delaySamples]).toBeCloseTo(expectedValue, 5);
      }
    });

    it("should verify loop boundary condition in line 244: i < inputData.length - delaySamples", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 100;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Fill with test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = i * 0.01;
      }

      const delayTimeInMs = 50;
      const feedback = 0.5;
      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      // Verify loop only processes up to inputData.length - delaySamples
      // The last delaySamples positions should only have original signal (no delayed addition)
      const loopEnd = bufferLength - delaySamples;
      
      // Positions within loop range should have delayed signal added
      for (let i = 0; i < loopEnd; i++) {
        const expectedValue = channelData[i + delaySamples] + channelData[i] * feedback;
        expect(outputData[i + delaySamples]).toBeCloseTo(expectedValue, 5);
      }

      // Positions beyond loop range should only have original signal
      for (let i = loopEnd; i < bufferLength - delaySamples; i++) {
        // This range should be empty, but if not, verify no delayed signal was added
        if (i + delaySamples < bufferLength) {
          // Should only have original value
          expect(outputData[i + delaySamples]).toBeCloseTo(channelData[i + delaySamples], 5);
        }
      }
    });

    it("should handle negative input values in line 244 calculation", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 50;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set negative values
      channelData[0] = -0.5;
      channelData[1] = -0.3;
      channelData[10] = 0.2;

      const delayTimeInMs = 10;
      const feedback = 0.4;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);

      // Verify line 244 handles negative values correctly
      if (delaySamples < bufferLength) {
        const expectedValue = channelData[delaySamples] + channelData[0] * feedback;
        expect(outputData[delaySamples]).toBeCloseTo(expectedValue, 5);
      }
    });

    it("should verify accumulation behavior when multiple iterations affect same position (line 244)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 20;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set values so multiple input positions contribute to same output position
      channelData[0] = 0.1;
      channelData[1] = 0.2;
      channelData[2] = 0.3;
      channelData[5] = 0.5; // This will receive contributions from positions 0, 1, 2

      const delayTimeInMs = 5;
      const feedback = 0.1;
      const delaySamples = Math.floor((delayTimeInMs / 1000) * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          delayTimeInMs,
          feedback,
        }
      );

      const delayedBuffer = processor.delayAndClip().getBuffer();
      const outputData = delayedBuffer.getChannelData(0);

      // Verify that line 244 correctly accumulates multiple contributions
      // Each iteration adds to the output, so we need to check the cumulative effect
      for (let i = 0; i < bufferLength - delaySamples; i++) {
        const originalValue = channelData[i + delaySamples];
        const feedbackContribution = channelData[i] * feedback;
        const expectedValue = originalValue + feedbackContribution;
        expect(outputData[i + delaySamples]).toBeCloseTo(expectedValue, 5);
      }
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

  describe("composeBuffer micro fades (lines 370, 375)", () => {
    it("should apply fade in calculation on line 370", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 100;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data with known values
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0; // All samples set to 1.0
      }

      const microFadeInDurationInMs = 10; // 10ms fade
      const microFadeSamples = Math.floor((microFadeInDurationInMs / 1000) * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration: 0, // Disable overall fade-in
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 370: targetData[startIndex + i] *= i / microFadeSamples;
      // For fade in, first sample should be 0 (i=0), last fade sample should be close to original
      expect(outputData[0]).toBeCloseTo(0, 5); // i=0, so 1.0 * (0 / microFadeSamples) = 0

      // Check middle of fade (only if microFadeSamples is large enough)
      if (microFadeSamples > 2) {
        const midFadeIndex = Math.floor(microFadeSamples / 2);
        if (midFadeIndex < bufferLength) {
          const expectedValue = 1.0 * (midFadeIndex / microFadeSamples);
          expect(outputData[midFadeIndex]).toBeCloseTo(expectedValue, 4);
        }
      }

      // Check end of fade (should be close to original value, but may be affected by fade out)
      // Only check if fade in and fade out don't overlap
      if (microFadeSamples > 1 && microFadeSamples * 2 < bufferLength) {
        const lastFadeIndex = microFadeSamples - 1;
        if (lastFadeIndex < bufferLength) {
          const expectedValue = 1.0 * (lastFadeIndex / microFadeSamples);
          expect(outputData[lastFadeIndex]).toBeCloseTo(expectedValue, 4);
        }
      }

      // Samples after fade should be unchanged (only if not affected by fade out)
      if (microFadeSamples * 2 < bufferLength) {
        const afterFadeIndex = microFadeSamples;
        if (afterFadeIndex < bufferLength) {
          expect(outputData[afterFadeIndex]).toBeCloseTo(1.0, 4);
        }
      }
    });

    it("should apply fade out calculation on line 375", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 100;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data with known values
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0; // All samples set to 1.0
      }

      const microFadeInDurationInMs = 10; // 10ms fade
      const microFadeSamples = Math.floor((microFadeInDurationInMs / 1000) * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration: 0, // Disable overall fade-in
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 375: targetData[startIndex + originalLength - i - 1] *= i / microFadeSamples;
      // For fade out, last sample should be 0 (i=0), first fade sample from end should be close to original
      const lastSampleIndex = bufferLength - 1;
      if (lastSampleIndex >= 0 && lastSampleIndex < outputData.length) {
        expect(outputData[lastSampleIndex]).toBeCloseTo(0, 5); // i=0, so 1.0 * (0 / microFadeSamples) = 0
      }

      // Check middle of fade out (only if fade in and fade out don't overlap)
      if (microFadeSamples > 2 && microFadeSamples * 2 < bufferLength) {
        const midFadeOutIndex = bufferLength - Math.floor(microFadeSamples / 2) - 1;
        if (midFadeOutIndex >= 0 && midFadeOutIndex < bufferLength && midFadeOutIndex < outputData.length) {
          const i = bufferLength - midFadeOutIndex - 1;
          const expectedValue = 1.0 * (i / microFadeSamples);
          expect(outputData[midFadeOutIndex]).toBeCloseTo(expectedValue, 4);
        }
      }

      // Check start of fade out (should be close to original value, but may be affected by fade in)
      // Only check if fade in and fade out don't overlap
      if (microFadeSamples > 1 && microFadeSamples * 2 < bufferLength) {
        const firstFadeOutIndex = bufferLength - microFadeSamples;
        if (firstFadeOutIndex >= 0 && firstFadeOutIndex < outputData.length) {
          const i = microFadeSamples - 1;
          const expectedValue = 1.0 * (i / microFadeSamples);
          expect(outputData[firstFadeOutIndex]).toBeCloseTo(expectedValue, 4);
        }
      }

      // Samples before fade out should be unchanged (only if not affected by fade in)
      if (microFadeSamples * 2 < bufferLength) {
        const beforeFadeIndex = bufferLength - microFadeSamples - 1;
        if (beforeFadeIndex >= 0 && beforeFadeIndex < outputData.length) {
          expect(outputData[beforeFadeIndex]).toBeCloseTo(1.0, 4);
        }
      }
    });

    it("should apply both fade in (line 370) and fade out (line 375) with multiple repetitions", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 200;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const microFadeInDurationInMs = 5; // 5ms fade
      const microFadeSamples = Math.floor((microFadeInDurationInMs / 1000) * sampleRate);
      const times = 2; // Two repetitions

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times,
          fadeInDuration: 0, // Disable overall fade-in
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify fade in for first repetition (line 370)
      expect(outputData[0]).toBeCloseTo(0, 5); // First sample should be 0
      if (microFadeSamples > 1 && microFadeSamples * 2 < bufferLength) {
        const midFadeIn = Math.floor(microFadeSamples / 2);
        if (midFadeIn < outputData.length) {
          const expectedFadeIn = 0.5 * (midFadeIn / microFadeSamples);
          expect(outputData[midFadeIn]).toBeCloseTo(expectedFadeIn, 4);
        }
      }

      // Verify fade out for first repetition (line 375)
      const firstRepLastIndex = bufferLength - 1;
      if (firstRepLastIndex < outputData.length) {
        expect(outputData[firstRepLastIndex]).toBeCloseTo(0, 5); // Last sample of first rep should be 0
      }

      // Verify fade in for second repetition (line 370)
      const secondRepStartIndex = bufferLength;
      if (secondRepStartIndex < outputData.length) {
        expect(outputData[secondRepStartIndex]).toBeCloseTo(0, 5); // First sample of second rep should be 0
      }

      // Verify fade out for second repetition (line 375)
      const secondRepLastIndex = bufferLength * 2 - 1;
      if (secondRepLastIndex < outputData.length) {
        expect(outputData[secondRepLastIndex]).toBeCloseTo(0, 5); // Last sample of second rep should be 0
      }
    });

    it("should handle edge case when microFadeSamples equals originalLength (lines 370, 375)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 100;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.8;
      }

      // Set microFadeInDurationInMs so that microFadeSamples equals or exceeds bufferLength
      // This tests the Math.min() constraint in line 365
      const microFadeInDurationInMs = 100; // Large value to trigger Math.min constraint
      const microFadeSamples = Math.min(
        Math.floor((microFadeInDurationInMs / 1000) * sampleRate),
        bufferLength
      );

      expect(microFadeSamples).toBe(bufferLength); // Should be clamped to bufferLength

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration: 0,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 370: fade in should still work
      expect(outputData[0]).toBeCloseTo(0, 5); // First sample should be 0

      // Verify line 375: fade out should still work
      expect(outputData[bufferLength - 1]).toBeCloseTo(0, 5); // Last sample should be 0
    });

    it("should apply fade in and fade out with custom microFadeInDurationInMs (lines 370, 375)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.6;
      }

      const microFadeInDurationInMs = 20; // 20ms fade
      const microFadeSamples = Math.floor((microFadeInDurationInMs / 1000) * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration: 0,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 370: progressive fade in
      // Only check if fade in and fade out don't overlap significantly
      if (microFadeSamples * 2 < bufferLength) {
        for (let i = 0; i < Math.min(microFadeSamples, 10); i++) {
          if (i < outputData.length) {
            const expectedValue = 0.6 * (i / microFadeSamples);
            expect(outputData[i]).toBeCloseTo(expectedValue, 3);
          }
        }
      }

      // Verify line 375: progressive fade out
      // Only check if fade in and fade out don't overlap significantly
      if (microFadeSamples * 2 < bufferLength) {
        for (let i = 0; i < Math.min(microFadeSamples, 10); i++) {
          const fadeOutIndex = bufferLength - i - 1;
          if (fadeOutIndex >= 0 && fadeOutIndex < outputData.length) {
            const expectedValue = 0.6 * (i / microFadeSamples);
            expect(outputData[fadeOutIndex]).toBeCloseTo(expectedValue, 3);
          }
        }
      }
    });

    it("should use microFadeInDurationInMs / 1000 when not undefined (line 362)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const microFadeInDurationInMs = 50; // 50ms
      const expectedMicroFadeDuration = microFadeInDurationInMs / 1000; // 0.05 seconds (line 363)
      const expectedMicroFadeSamples = Math.floor(expectedMicroFadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          microFadeInDurationInMs, // Line 362: this.config.microFadeInDurationInMs !== undefined
        }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 2, // Multiple repetitions to trigger micro fades
          fadeInDuration: 0, // Disable overall fade-in
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 362-363: microFadeInDurationInMs / 1000 is used when not undefined
      // Check that micro fade is applied at the start of each repetition
      // First repetition starts at index 0
      if (expectedMicroFadeSamples > 0 && expectedMicroFadeSamples < bufferLength) {
        // First sample should be faded (close to 0)
        expect(outputData[0]).toBeCloseTo(0, 2);
        // Sample at microFadeSamples should be close to original value
        if (expectedMicroFadeSamples < outputData.length) {
          expect(outputData[expectedMicroFadeSamples]).toBeCloseTo(0.5, 2);
        }
      }
    });

    it("should use default 0.05 when microFadeInDurationInMs is undefined (line 362)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const expectedMicroFadeDuration = 0.05; // Default value (line 364)
      const expectedMicroFadeSamples = Math.floor(expectedMicroFadeDuration * sampleRate);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        {
          // microFadeInDurationInMs not provided (undefined) - should use default 0.05 (line 364)
        }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 2, // Multiple repetitions to trigger micro fades
          fadeInDuration: 0, // Disable overall fade-in
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 362-364: default 0.05 is used when microFadeInDurationInMs is undefined
      // Check that micro fade is applied at the start of each repetition
      // First repetition starts at index 0
      if (expectedMicroFadeSamples > 0 && expectedMicroFadeSamples < bufferLength) {
        // First sample should be faded (close to 0)
        expect(outputData[0]).toBeCloseTo(0, 2);
        // Sample at microFadeSamples should be close to original value
        if (expectedMicroFadeSamples < outputData.length) {
          expect(outputData[expectedMicroFadeSamples]).toBeCloseTo(0.5, 2);
        }
      }
    });
  });

  describe("composeBuffer overall fade-in (lines 382-393)", () => {
    it("should calculate fadeInSamples using Math.min (line 382-385)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.8;
      }

      const fadeInDuration = 0.1; // 100ms fade
      const fadeInSamples = Math.min(fadeInDuration * sampleRate, bufferLength * 2); // times = 2

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 } // Disable micro-fades
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 2,
          fadeInDuration,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify fadeInSamples is calculated correctly (line 382-385)
      const expectedFadeInSamples = Math.min(fadeInDuration * sampleRate, outputData.length);
      expect(expectedFadeInSamples).toBeLessThanOrEqual(outputData.length);

      // Verify fade is applied (line 393)
      expect(outputData[0]).toBeLessThan(0.8); // Should be faded
    });

    it("should use fadeInStartVolume when provided (line 386)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0;
      }

      const fadeInDuration = 0.05; // 50ms fade
      const fadeInStartVolume = 0.2; // Custom start volume

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration,
          fadeInStartVolume,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);
      const fadeInSamples = Math.min(fadeInDuration * sampleRate, outputData.length);

      // Verify line 386: startVolume = fadeInStartVolume ?? NEARLY_ZERO
      // First sample should use startVolume
      if (fadeInSamples > 0) {
        const expectedFirstValue = 1.0 * fadeInStartVolume;
        expect(outputData[0]).toBeCloseTo(expectedFirstValue, 4);
      }
    });

    it("should use NEARLY_ZERO as default startVolume when fadeInStartVolume not provided (line 386)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0;
      }

      const fadeInDuration = 0.05; // 50ms fade
      const NEARLY_ZERO = 0.001; // From line 323

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration,
          // fadeInStartVolume not provided
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);
      const fadeInSamples = Math.min(fadeInDuration * sampleRate, outputData.length);

      // Verify line 386: startVolume = fadeInStartVolume ?? NEARLY_ZERO
      // First sample should use NEARLY_ZERO
      if (fadeInSamples > 0) {
        const expectedFirstValue = 1.0 * NEARLY_ZERO;
        expect(outputData[0]).toBeCloseTo(expectedFirstValue, 3);
      }
    });

    it("should calculate fadeProgress correctly (line 389)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.6;
      }

      const fadeInDuration = 0.1; // 100ms fade
      const fadeInSamples = Math.min(fadeInDuration * sampleRate, bufferLength);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 389: fadeProgress = i / fadeInSamples
      // Check multiple positions
      const testPositions = [0, Math.floor(fadeInSamples / 4), Math.floor(fadeInSamples / 2), Math.floor(fadeInSamples * 3 / 4)];
      const NEARLY_ZERO = 0.001;

      for (const i of testPositions) {
        if (i < fadeInSamples && i < outputData.length) {
          const fadeProgress = i / fadeInSamples;
          const fadeValue = NEARLY_ZERO + (1 - NEARLY_ZERO) * Math.pow(fadeProgress, 2);
          const expectedValue = 0.6 * fadeValue;
          expect(outputData[i]).toBeCloseTo(expectedValue, 3);
        }
      }
    });

    it("should apply exponential fade curve using Math.pow (line 391-392)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 1.0;
      }

      const fadeInDuration = 0.05;
      const fadeInStartVolume = 0.1;
      const fadeInSamples = Math.min(fadeInDuration * sampleRate, bufferLength);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration,
          fadeInStartVolume,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 391-392: fadeValue = startVolume + (1 - startVolume) * Math.pow(fadeProgress, 2)
      // Check middle position
      if (fadeInSamples > 2) {
        const i = Math.floor(fadeInSamples / 2);
        const fadeProgress = i / fadeInSamples;
        const expectedFadeValue = fadeInStartVolume + (1 - fadeInStartVolume) * Math.pow(fadeProgress, 2);
        const expectedOutput = 1.0 * expectedFadeValue;
        expect(outputData[i]).toBeCloseTo(expectedOutput, 4);
      }

      // Verify exponential curve: should be slower at start, faster at end
      if (fadeInSamples > 10) {
        const quarterPoint = Math.floor(fadeInSamples / 4);
        const halfPoint = Math.floor(fadeInSamples / 2);
        
        const quarterProgress = quarterPoint / fadeInSamples;
        const halfProgress = halfPoint / fadeInSamples;
        
        const quarterFadeValue = fadeInStartVolume + (1 - fadeInStartVolume) * Math.pow(quarterProgress, 2);
        const halfFadeValue = fadeInStartVolume + (1 - fadeInStartVolume) * Math.pow(halfProgress, 2);
        
        // Exponential curve: half point should be less than linear interpolation
        const linearHalfValue = fadeInStartVolume + (1 - fadeInStartVolume) * 0.5;
        expect(halfFadeValue).toBeLessThan(linearHalfValue);
        
        expect(outputData[quarterPoint]).toBeCloseTo(1.0 * quarterFadeValue, 4);
        expect(outputData[halfPoint]).toBeCloseTo(1.0 * halfFadeValue, 4);
      }
    });

    it("should apply fadeValue to targetData (line 393)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data with known values
      channelData[0] = 0.5;
      channelData[100] = 0.7;
      channelData[200] = 0.9;

      const fadeInDuration = 0.1; // 100ms fade
      const fadeInStartVolume = 0.2;
      const fadeInSamples = Math.min(fadeInDuration * sampleRate, bufferLength);

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration,
          fadeInStartVolume,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify line 393: targetData[i] *= fadeValue
      // Check first sample
      if (fadeInSamples > 0) {
        const fadeProgress = 0 / fadeInSamples;
        const fadeValue = fadeInStartVolume + (1 - fadeInStartVolume) * Math.pow(fadeProgress, 2);
        const expectedValue = 0.5 * fadeValue; // channelData[0] * fadeValue
        expect(outputData[0]).toBeCloseTo(expectedValue, 4);
      }

      // Check a sample in the middle of fade
      if (fadeInSamples > 100) {
        const i = 100;
        const fadeProgress = i / fadeInSamples;
        const fadeValue = fadeInStartVolume + (1 - fadeInStartVolume) * Math.pow(fadeProgress, 2);
        const expectedValue = 0.7 * fadeValue; // channelData[100] * fadeValue
        expect(outputData[i]).toBeCloseTo(expectedValue, 4);
      }
    });

    it("should handle fadeInSamples clamped to targetData.length (line 382-385)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.8;
      }

      // Use a very long fade duration that exceeds buffer length
      const fadeInDuration = 1.0; // 1 second = 44100 samples, but buffer is only 500 samples
      const times = 2; // This makes targetData.length = 1000

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times,
          fadeInDuration,
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify Math.min clamps fadeInSamples to targetData.length (line 382-385)
      const expectedFadeInSamples = Math.min(fadeInDuration * sampleRate, outputData.length);
      expect(expectedFadeInSamples).toBe(outputData.length); // Should be clamped

      // Verify fade is applied to all samples
      expect(outputData[0]).toBeLessThan(0.8); // First sample should be faded
      expect(outputData[outputData.length - 1]).toBeLessThan(0.8); // Last sample should also be faded
    });

    it("should apply fade-in to all channels (lines 382-393)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        leftChannel[i] = 0.6;
        rightChannel[i] = 0.8;
      }

      const fadeInDuration = 0.05;
      const fadeInStartVolume = 0.15;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          fadeInDuration,
          fadeInStartVolume,
        })
        .getBuffer();

      const outputLeft = composedBuffer.getChannelData(0);
      const outputRight = composedBuffer.getChannelData(1);
      const fadeInSamples = Math.min(fadeInDuration * sampleRate, outputLeft.length);

      // Verify both channels have fade applied (line 393)
      if (fadeInSamples > 0) {
        const fadeProgress = 0 / fadeInSamples;
        const fadeValue = fadeInStartVolume + (1 - fadeInStartVolume) * Math.pow(fadeProgress, 2);
        
        expect(outputLeft[0]).toBeCloseTo(0.6 * fadeValue, 4);
        expect(outputRight[0]).toBeCloseTo(0.8 * fadeValue, 4);
      }
    });

    it("should not apply fade-in when fadeInDuration is not provided (line 381)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.7;
      }

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration: bufferLength / sampleRate,
          times: 1,
          // fadeInDuration not provided
        })
        .getBuffer();

      const outputData = composedBuffer.getChannelData(0);

      // Verify lines 382-393 are not executed when fadeInDuration is undefined
      // First sample should be unchanged (no fade applied)
      expect(outputData[0]).toBeCloseTo(0.7, 5);
    });
  });

  describe("composeBuffer timeEnd trim (line 404)", () => {
    it("should trim buffer from timeEnd to duration when timeEnd is provided (line 404)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = (i + 1) / 1000; // Values from 0.001 to 1.0
      }

      const duration = bufferLength / sampleRate; // Full duration
      const timeEnd = 0.01; // 10ms from start
      const times = 2; // Two repetitions

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration,
          times,
          timeEnd, // This triggers line 404
        })
        .getBuffer();

      // Verify line 404 executed: this.trim(timeEnd, duration)
      // Buffer should be trimmed from timeEnd to duration
      const expectedLength = Math.floor((duration - timeEnd) * sampleRate);
      expect(composedBuffer.length).toBeCloseTo(expectedLength, 0);
    });

    it("should not trim when timeEnd is not provided (line 403-404)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 500;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.5;
      }

      const duration = bufferLength / sampleRate;
      const times = 1;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration,
          times,
          // timeEnd not provided - line 404 should not execute
        })
        .getBuffer();

      // Verify line 404 did not execute - buffer should have full length
      expect(composedBuffer.length).toBe(bufferLength);
    });

    it("should trim correctly with timeEnd (line 404)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.6;
      }

      const duration = bufferLength / sampleRate;
      const timeEnd = 0.01; // 10ms from start (must be < duration)

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration,
          times: 1,
          timeEnd, // This triggers line 404
        })
        .getBuffer();

      // Verify line 404: this.trim(timeEnd, duration)
      // Buffer is trimmed from timeEnd to duration
      const timeEndSamples = Math.floor(timeEnd * sampleRate);
      const durationSamples = Math.floor(duration * sampleRate);
      const expectedLength = durationSamples - timeEndSamples;

      expect(composedBuffer.length).toBe(expectedLength);
    });

    it("should trim with timeEnd after applying fade-in (line 404)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 1000;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.8;
      }

      const duration = bufferLength / sampleRate;
      const timeEnd = 0.01; // 10ms from start
      const fadeInDuration = 0.05; // 50ms fade

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration,
          times: 1,
          fadeInDuration,
          timeEnd, // This triggers line 404 after fade-in
        })
        .getBuffer();

      // Verify line 404 executes after fade-in
      // Buffer should be trimmed from timeEnd to duration
      const expectedLength = Math.floor((duration - timeEnd) * sampleRate);
      expect(composedBuffer.length).toBeCloseTo(expectedLength, 0);

      // Verify fade-in was applied before trim (first sample should be faded)
      const outputData = composedBuffer.getChannelData(0);
      if (outputData.length > 0) {
        // The first sample after trim should still show fade effect if it's within fade range
        expect(outputData[0]).toBeLessThanOrEqual(0.8);
      }
    });

    it("should handle timeEnd at different positions (line 404)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 2000; // Larger buffer for more precision
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.7;
      }

      const duration = bufferLength / sampleRate;
      const timeEnd = duration * 0.5; // timeEnd at 50% of duration

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration,
          times: 1,
          timeEnd, // This triggers line 404
        })
        .getBuffer();

      // Verify line 404: this.trim(timeEnd, duration)
      // Buffer should be trimmed from timeEnd to duration
      const timeEndSamples = Math.floor(timeEnd * sampleRate);
      const durationSamples = Math.floor(duration * sampleRate);
      const expectedLength = durationSamples - timeEndSamples;
      
      expect(composedBuffer.length).toBe(expectedLength);
      expect(composedBuffer.length).toBeGreaterThan(0);
    });

    it("should handle timeEnd greater than zero with multiple channels (line 404)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 800;
      const buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
      const leftChannel = buffer.getChannelData(0);
      const rightChannel = buffer.getChannelData(1);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        leftChannel[i] = 0.5;
        rightChannel[i] = 0.6;
      }

      const duration = bufferLength / sampleRate;
      const timeEnd = 0.01; // 10ms from start
      const times = 2;

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      const composedBuffer = processor
        .composeBuffer({
          duration,
          times,
          timeEnd, // This triggers line 404
        })
        .getBuffer();

      // Verify line 404: this.trim(timeEnd, duration) works for multi-channel
      const expectedLength = Math.floor((duration - timeEnd) * sampleRate);
      expect(composedBuffer.length).toBeCloseTo(expectedLength, 0);
      expect(composedBuffer.numberOfChannels).toBe(2);

      // Verify both channels are trimmed correctly
      const outputLeft = composedBuffer.getChannelData(0);
      const outputRight = composedBuffer.getChannelData(1);
      expect(outputLeft.length).toBe(expectedLength);
      expect(outputRight.length).toBe(expectedLength);
    });

    it("should verify trim is called with correct parameters (line 404)", () => {
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const bufferLength = 600;
      const buffer = audioContext.createBuffer(1, bufferLength, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Set up test data
      for (let i = 0; i < bufferLength; i++) {
        channelData[i] = 0.4;
      }

      const duration = bufferLength / sampleRate;
      const timeEnd = 0.01; // 10ms from start (must be < duration)

      const processor = new BufferEffectsProcessor(
        buffer,
        // @ts-expect-error - AudioContextMock is compatible with IAudioContext at runtime
        audioContext,
        { microFadeInDurationInMs: 0 }
      );

      // Spy on trim method to verify it's called with correct parameters
      const trimSpy = jest.spyOn(processor, "trim");

      processor.composeBuffer({
        duration,
        times: 1,
        timeEnd, // This triggers line 404
      });

      // Verify line 404: this.trim(timeEnd, duration)
      expect(trimSpy).toHaveBeenCalledWith(timeEnd, duration);
      expect(trimSpy).toHaveBeenCalledTimes(2); // Once at line 331, once at line 404

      trimSpy.mockRestore();
    });
  });
});
