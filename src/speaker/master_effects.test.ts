import { AudioContext } from "standardized-audio-context-mock";
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { MasterEffects } from "./master_effects";

// standardized-audio-context-mock stands in for the Web Audio API where it
// can; its delay node cannot connect, so MasterEffects gets a small fake.
const ctx = () => new AudioContext() as any;

const param = (value = 1) => ({ value, setTargetAtTime: jest.fn() });
const node = (extra: object = {}) => ({ connect: jest.fn(), disconnect: jest.fn(), ...extra });
const fakeContext = () =>
  ({
    currentTime: 0,
    sampleRate: 1000,
    destination: node(),
    createGain: () => node({ gain: param() }),
    createDelay: () => node({ delayTime: param(0) }),
    createConvolver: () => node({ buffer: null }),
    createBuffer: (channels: number, length: number) => {
      const data = Array.from({ length: channels }, () => new Float32Array(length));
      return { getChannelData: (c: number) => data[c] };
    },
  }) as any;

describe("MasterEffects", () => {
  it("builds a delay only when its time is above zero", () => {
    const fx = new MasterEffects(fakeContext(), undefined, { delayTimeInMs: 0 });
    expect(fx.delayNode).toBeNull();
    fx.update({ delayTimeInMs: 250, feedback: 0.3 });
    expect(fx.delayNode).not.toBeNull();
    fx.update({ delayTimeInMs: 0 });
    expect(fx.delayNode).toBeNull();
  });

  it("builds a reverb only when the wet mix is above zero", () => {
    const fx = new MasterEffects(fakeContext(), undefined, { wetDryRatio: 0 });
    expect(fx.reverbNode).toBeNull();
    fx.update({ wetDryRatio: 0.3, reverbRoomSize: 0.4, reverbDamping: 0 });
    expect(fx.reverbNode).not.toBeNull();
  });

  it("keeps a reverb room of the same size rather than re-rolling it", () => {
    const fx = new MasterEffects(fakeContext(), undefined, { wetDryRatio: 0.3, reverbRoomSize: 0.4 });
    const first = fx.reverbNode!.buffer;
    fx.update({ wetDryRatio: 0.5, reverbRoomSize: 0.4 });
    expect(fx.reverbNode!.buffer).toBe(first);
    fx.update({ wetDryRatio: 0.5, reverbRoomSize: 0.8 });
    expect(fx.reverbNode!.buffer).not.toBe(first);
  });

  it("remembers the configuration it was last given", () => {
    const fx = new MasterEffects(fakeContext(), undefined, {});
    fx.update({ delayTimeInMs: 100, feedback: 0 });
    expect(fx.config).toEqual({ delayTimeInMs: 100, feedback: 0 });
  });
});

describe("BufferEffectsProcessor.reverse", () => {
  it("reverses into a new buffer, leaving the speaker's own audio alone", () => {
    const context = ctx();
    const original = context.createBuffer(1, 4, 44100);
    original.getChannelData(0).set([1, 2, 3, 4]);

    const reversed = new BufferEffectsProcessor(original, context, {}).reverse().getBuffer();

    expect(Array.from(reversed.getChannelData(0))).toEqual([4, 3, 2, 1]);
    expect(Array.from(original.getChannelData(0))).toEqual([1, 2, 3, 4]);
  });
});
