import { IAudioBuffer, IAudioContext } from "standardized-audio-context";
import { EffectsConfig } from "../types/roundware";

export class BufferEffectsProcessor {
  private audioBuffer: IAudioBuffer;
  private context: IAudioContext;
  private config: EffectsConfig;

  constructor(
    audioBuffer: IAudioBuffer,
    context: IAudioContext,
    config: EffectsConfig
  ) {
    this.audioBuffer = audioBuffer;
    this.context = context;
    this.config = config;
  }

  trim(startTime: number, endTime: number): BufferEffectsProcessor {
    const sampleRate = this.audioBuffer.sampleRate;
    const startFrame = startTime * sampleRate;
    const endFrame = endTime * sampleRate;

    const channels = this.audioBuffer.numberOfChannels;

    // Create a new AudioBuffer for the trimmed audio
    const trimmedBuffer = this.context.createBuffer(
      channels,
      endFrame - startFrame,
      sampleRate
    );

    for (let channel = 0; channel < channels; channel++) {
      const sourceData = this.audioBuffer
        .getChannelData(channel)
        .subarray(startFrame, endFrame);
      trimmedBuffer.getChannelData(channel).set(sourceData);
    }

    this.audioBuffer = trimmedBuffer;
    return this;
  }

  fadeIn(durationSeconds?: number): BufferEffectsProcessor {
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const length = this.audioBuffer.length;
    const minFadeDuration = 0.01; // 10ms minimum fade duration

    const fadeDuration = Math.max(
      durationSeconds ||
        (this.config.fadeInDurationInMs
          ? this.config.fadeInDurationInMs / 1000
          : 0.3),
      minFadeDuration
    );

    const fadeSamples = Math.min(
      fadeDuration * this.audioBuffer.sampleRate,
      length
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = this.audioBuffer.getChannelData(channel);
      for (let i = 0; i < fadeSamples; i++) {
        // Use exponential curve for smoother fade
        const fadeValue = Math.pow(i / fadeSamples, 2);
        channelData[i] *= fadeValue;
      }
    }
    return this;
  }

  fadeOut(durationSeconds?: number): BufferEffectsProcessor {
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const length = this.audioBuffer.length;
    const fadeSamples = Math.min(
      (durationSeconds ||
        (this.config.fadeInDurationInMs
          ? this.config.fadeInDurationInMs / 1000
          : 0.3)) * this.audioBuffer.sampleRate,
      length
    );
    const startIndex = length - fadeSamples;

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = this.audioBuffer.getChannelData(channel);
      for (let i = 0; i < fadeSamples; i++) {
        channelData[startIndex + i] *= (fadeSamples - i) / fadeSamples;
      }
    }
    return this;
  }

  // fade in and out in single pass
  fadeInAndOut(
    durationSeconds: number = this.config.fadeInDurationInMs
      ? this.config.fadeInDurationInMs / 1000
      : 0.3
  ): BufferEffectsProcessor {
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const length = this.audioBuffer.length;
    const fadeSamples = Math.min(
      durationSeconds * this.audioBuffer.sampleRate,
      length
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = this.audioBuffer.getChannelData(channel);
      for (let i = 0; i < fadeSamples; i++) {
        channelData[i] *= i / fadeSamples;
        channelData[length - i - 1] *= i / fadeSamples;
      }
    }
    return this;
  }

  // trim and fadein and out in single pass
  trimAndFadeInAndOut(
    startTime: number,
    endTime: number,
    fadeDuration: number = this.config.fadeInDurationInMs
      ? this.config.fadeInDurationInMs / 1000
      : 0.3
  ): BufferEffectsProcessor {
    const sampleRate = this.audioBuffer.sampleRate;
    const startFrame = startTime * sampleRate;
    const endFrame = endTime * sampleRate;

    const channels = this.audioBuffer.numberOfChannels;

    // Step 1: Create a new AudioBuffer for the trimmed audio
    const trimmedBuffer = this.context.createBuffer(
      channels,
      endFrame - startFrame,
      sampleRate
    );

    // Step 2: Copy the trimmed audio data into the new buffer
    for (let channel = 0; channel < channels; channel++) {
      const sourceData = this.audioBuffer
        .getChannelData(channel)
        .subarray(startFrame, endFrame);
      trimmedBuffer.getChannelData(channel).set(sourceData);
    }

    // Now, apply fade-in and fade-out to the trimmed buffer in a single pass
    const length = trimmedBuffer.length;
    const fadeSamples = Math.min(fadeDuration * sampleRate, length);

    // Step 3: Apply fade-in and fade-out in a single pass
    for (let channel = 0; channel < channels; channel++) {
      const channelData = trimmedBuffer.getChannelData(channel);

      // Fade-in effect on the first `fadeSamples` samples
      for (let i = 0; i < fadeSamples; i++) {
        channelData[i] *= i / fadeSamples;
      }

      // Fade-out effect on the last `fadeSamples` samples
      for (let i = 0; i < fadeSamples; i++) {
        channelData[length - i - 1] *= i / fadeSamples;
      }
    }

    // Set the trimmed and faded buffer as the new audio buffer
    this.audioBuffer = trimmedBuffer;

    return this;
  }

  delayReverbClip(): BufferEffectsProcessor {
    const delayTime = this.config.delayTimeInMs || 50;
    const feedback = this.config.feedback || 0.5;
    const reverb = this.config.reverb || 0.5;

    const delaySamples = Math.floor(
      (delayTime / 1000) * this.audioBuffer.sampleRate
    );
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const newBuffer = this.context.createBuffer(
      numberOfChannels,
      this.audioBuffer.length,
      this.audioBuffer.sampleRate
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = this.audioBuffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      // Copy original signal
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i];
      }

      // Apply delay effect
      for (let i = 0; i < inputData.length - delaySamples; i++) {
        outputData[i + delaySamples] += inputData[i] * feedback;
      }

      // Apply reverb effect
      for (let i = 0; i < inputData.length; i++) {
        if (i > 0) {
          outputData[i] += inputData[i - 1] * reverb;
        }
      }
    }

    this.audioBuffer = newBuffer;
    return this;
  }

  microFadeInAndOut(): BufferEffectsProcessor {
    return this.fadeInAndOut(
      this.config.microFadeInDurationInMs
        ? this.config.microFadeInDurationInMs / 1000
        : 0.05
    );
  }

  delayAndClip(): BufferEffectsProcessor {
    const delayTime = this.config.delayTimeInMs || 50;
    const feedback = this.config.feedback || 0.5;
    const delaySamples = Math.floor(
      (delayTime / 1000) * this.audioBuffer.sampleRate
    );
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const newBuffer = this.context.createBuffer(
      numberOfChannels,
      this.audioBuffer.length,
      this.audioBuffer.sampleRate
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = this.audioBuffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      // Copy original signal
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i];
      }

      // Add delayed signal
      for (let i = 0; i < inputData.length - delaySamples; i++) {
        outputData[i + delaySamples] += inputData[i] * feedback;
      }
    }

    this.audioBuffer = newBuffer;
    return this;
  }

  reverbAndClip(): BufferEffectsProcessor {
    const reverb = this.config.reverb || 0.5;
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const newBuffer = this.context.createBuffer(
      numberOfChannels,
      this.audioBuffer.length,
      this.audioBuffer.sampleRate
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = this.audioBuffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      // Copy original signal
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[i];
      }

      // Add reverb signal
      for (let i = 0; i < inputData.length; i++) {
        if (i > 0) {
          outputData[i] += inputData[i - 1] * reverb;
        }
      }
    }

    this.audioBuffer = newBuffer;
    return this;
  }

  getBuffer(): IAudioBuffer {
    return this.audioBuffer;
  }

  composeBuffer({
    duration,
    times,
    fadeInDuration,
    fadeInStartVolume,
    timeEnd,
  }: {
    duration: number;
    times: number;
    fadeInDuration?: number;
    fadeInStartVolume?: number;
    timeEnd?: number;
  }): BufferEffectsProcessor {
    const NEARLY_ZERO = 0.001; // Define minimum starting volume
    // First trim the audio to the specified duration
    this.trim(0, duration);

    const sampleRate = this.audioBuffer.sampleRate;
    const originalLength = this.audioBuffer.length;

    // Create a new buffer that can hold all repetitions
    const newBuffer = this.context.createBuffer(
      this.audioBuffer.numberOfChannels,
      originalLength * times,
      sampleRate
    );

    // Copy audio for each repetition
    for (
      let channel = 0;
      channel < this.audioBuffer.numberOfChannels;
      channel++
    ) {
      const sourceData = this.audioBuffer.getChannelData(channel);
      const targetData = newBuffer.getChannelData(channel);

      for (let repeat = 0; repeat < times; repeat++) {
        const startIndex = repeat * originalLength;

        // Copy the audio
        for (let i = 0; i < originalLength; i++) {
          targetData[startIndex + i] = sourceData[i];
        }

        // Apply micro fades between loops
        const microFadeSamples = Math.min(
          (this.config.microFadeInDurationInMs
            ? this.config.microFadeInDurationInMs / 1000
            : 0.05) * sampleRate,
          originalLength
        );

        // Fade in
        for (let i = 0; i < microFadeSamples; i++) {
          targetData[startIndex + i] *= i / microFadeSamples;
        }

        // Fade out
        for (let i = 0; i < microFadeSamples; i++) {
          targetData[startIndex + originalLength - i - 1] *=
            i / microFadeSamples;
        }
      }

      // Apply overall fade-in if specified
      if (fadeInDuration) {
        const fadeInSamples = Math.min(
          fadeInDuration * sampleRate,
          targetData.length
        );
        const startVolume = fadeInStartVolume ?? NEARLY_ZERO;

        for (let i = 0; i < fadeInSamples; i++) {
          const fadeProgress = i / fadeInSamples;
          // Interpolate between startVolume and 1.0 using exponential curve
          const fadeValue =
            startVolume + (1 - startVolume) * Math.pow(fadeProgress, 2);
          targetData[i] *= fadeValue;
        }
      }
    }

    this.audioBuffer = newBuffer;

    // Note: Delay, feedback, and reverb effects are now applied centrally
    // in the SpeakerEngine's master mixer, not per-speaker for efficiency

    if (timeEnd) {
      this.trim(timeEnd, duration);
    }
    return this;
  }
}
