import { AudioPanner } from './audioPanner';
import { AudioContext, StereoPannerNode } from 'standardized-audio-context-mock';
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

jest.useFakeTimers();

describe('AudioPanner', () => {
  let audioContext: AudioContext;
  let panNode: StereoPannerNode<AudioContext>;
  let audioPanner: AudioPanner;

  beforeEach(() => {
    audioContext = new AudioContext();
    panNode = new StereoPannerNode(audioContext);
    audioPanner = new AudioPanner(-1, 1, 1, 2, panNode, audioContext);
  });

  afterEach(() => {
    audioPanner.clear();
    jest.clearAllTimers();
  });

  test('should initialize with correct parameters', () => {
    expect(audioPanner.minpanpos).toBe(-1);
    expect(audioPanner.maxpanpos).toBe(1);
    expect(audioPanner.minpanduration).toBe(1);
    expect(audioPanner.maxpanduration).toBe(2);
    expect(audioPanner.panNode).toBe(panNode);
    expect(audioPanner.audioContext).toBe(audioContext);
  });

  test('should use default parameters when none provided', () => {
    const defaultPanner = new AudioPanner(undefined, undefined, undefined, undefined, panNode, audioContext);
    expect(defaultPanner.minpanpos).toBe(0);
    expect(defaultPanner.maxpanpos).toBe(0);
    expect(defaultPanner.minpanduration).toBe(0);
    expect(defaultPanner.maxpanduration).toBe(0);
  });

  test('should set initial pan value within range', () => {
    const initialPanValue = audioPanner.panNode.pan.value;
    expect(initialPanValue).toBeGreaterThanOrEqual(-1);
    expect(initialPanValue).toBeLessThanOrEqual(1);
  });

  test('should update parameters with random values within ranges', () => {
    audioPanner.updateParams();
    
    expect(audioPanner.finalPosition).toBeGreaterThanOrEqual(-1);
    expect(audioPanner.finalPosition).toBeLessThanOrEqual(1);
    expect(audioPanner.duration).toBeGreaterThanOrEqual(1);
    expect(audioPanner.duration).toBeLessThanOrEqual(2);
  });

  test('should handle initialPosition in updateParams', () => {
    // Set initial position
    audioPanner.initialPosition = 0.5;
    audioPanner.updateParams();
    
    // First update should use initialPosition
    expect(audioPanner.currentPosition).toBe(0.5);
    
    // Second update should use a new random finalPosition
    const firstFinalPosition = audioPanner.finalPosition;
    audioPanner.updateParams();
    expect(audioPanner.finalPosition).not.toBe(firstFinalPosition);
  });

  test('should start panning animation', () => {
    const linearRampSpy = jest.spyOn(audioPanner.panNode.pan, 'linearRampToValueAtTime');
    
    audioPanner.start();
    
    expect(linearRampSpy).toHaveBeenCalled();
    expect(audioPanner.timerId).toBeDefined();
  });

  test('should clear timer when clear is called', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    audioPanner.start();
    audioPanner.clear();
    
    expect(clearTimeoutSpy).toHaveBeenCalledWith(audioPanner.timerId);
  });

  test('should continue panning after duration expires', () => {
    const linearRampSpy = jest.spyOn(audioPanner.panNode.pan, 'linearRampToValueAtTime');
    
    audioPanner.start();
    jest.advanceTimersByTime(audioPanner.duration! * 1000);
    
    expect(linearRampSpy).toHaveBeenCalledTimes(2);
  });
});
