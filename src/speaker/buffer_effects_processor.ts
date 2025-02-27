import { IAudioBuffer, IAudioContext } from "standardized-audio-context";
import { EffectsConfig, SpeakerConfig } from "../types/roundware";

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
    const fadeSamples = Math.min(
      durationSeconds ||
        (this.config.fadeInDurationInMs
          ? this.config.fadeInDurationInMs / 1000
          : 0.3) * this.audioBuffer.sampleRate,
      length
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = this.audioBuffer.getChannelData(channel);
      for (let i = 0; i < fadeSamples; i++) {
        channelData[i] *= i / fadeSamples;
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

  getBuffer(): AudioBuffer {
    return this.audioBuffer;
  }
}
