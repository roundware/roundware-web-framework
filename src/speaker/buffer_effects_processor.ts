import { IAudioBuffer, IAudioContext } from "standardized-audio-context";

export class BufferEffectsProcessor {
  private audioBuffer: IAudioBuffer;
  private context: IAudioContext;

  constructor(audioBuffer: IAudioBuffer, context: IAudioContext) {
    this.audioBuffer = audioBuffer;
    this.context = context;
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

  fadeIn(durationSeconds: number): BufferEffectsProcessor {
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
      }
    }
    return this;
  }

  fadeOut(durationSeconds: number): BufferEffectsProcessor {
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const length = this.audioBuffer.length;
    const fadeSamples = Math.min(
      durationSeconds * this.audioBuffer.sampleRate,
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
  fadeInAndOut(durationSeconds: number): BufferEffectsProcessor {
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
    return this.fadeInAndOut(0.05);
    // for testing
    // return this.fadeInAndOut(0.3);
  }

  delayAndClip(
    delayTime: number,
    feedback: number = 0.5
  ): BufferEffectsProcessor {
    const originalDuration = this.audioBuffer.duration;
    const delaySamples = Math.floor(delayTime * this.audioBuffer.sampleRate);
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const newBuffer = this.context.createBuffer(
      numberOfChannels,
      this.audioBuffer.length + delaySamples,
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
      for (let i = 0; i < inputData.length; i++) {
        if (i + delaySamples < outputData.length) {
          outputData[i + delaySamples] += inputData[i] * feedback;
        }
      }
    }

    this.audioBuffer = this.trim(0, originalDuration).getBuffer();
    return this;
  }

  getBuffer(): AudioBuffer {
    return this.audioBuffer;
  }
}
