import {
  IAudioBuffer,
  IAudioContext,
  IAudioNode,
  IConvolverNode,
  IDelayNode,
  IGainNode,
} from "standardized-audio-context";
import { EffectsConfig } from "../types/roundware";

/**
 * The effects bus every speaker plays through: a dry path, and an effects
 * send feeding a delay (with feedback) and a generated reverb, mixed back in
 * by the wet/dry ratio.
 *
 *   speaker ─┬─> dry ──────────────────────┐
 *            └─> send ─┬─> delay ⟲ feedback ├─> wet ─> master ─> output
 *                      └─> reverb ─────────┘
 *
 * Lived inside SpeakerEngine and was built once, at construction: only the
 * wet/dry ratio could change afterwards. As its own class it can be updated
 * while playing — which the admin's Audio lab needs to let an author hear a
 * change as they make it — and shared with SpeakerPreview, so the lab plays
 * through exactly this chain.
 */
export class MasterEffects {
  private context: IAudioContext;
  private master: IGainNode<IAudioContext>;
  private dry: IGainNode<IAudioContext>;
  private wet: IGainNode<IAudioContext>;
  private send: IGainNode<IAudioContext>;
  private delay: IDelayNode<IAudioContext> | null = null;
  private feedback: IGainNode<IAudioContext> | null = null;
  private reverb: IConvolverNode<IAudioContext> | null = null;
  private reverbKey = "";
  private effects: EffectsConfig = {};
  private configured = false;

  constructor(
    context: IAudioContext,
    destination: IAudioNode<IAudioContext> = context.destination,
    effects?: EffectsConfig
  ) {
    this.context = context;
    this.master = context.createGain();
    this.dry = context.createGain();
    this.wet = context.createGain();
    this.send = context.createGain();
    this.dry.connect(this.master);
    this.wet.connect(this.master);
    this.master.connect(destination);
    this.update(effects ?? {});
  }

  /** Where a speaker's direct signal goes. */
  get dryInput(): IGainNode<IAudioContext> {
    return this.dry;
  }

  /** Where a speaker's signal for the delay and reverb goes. */
  get sendInput(): IGainNode<IAudioContext> {
    return this.send;
  }

  get delayNode(): IDelayNode<IAudioContext> | null {
    return this.delay;
  }

  get reverbNode(): IConvolverNode<IAudioContext> | null {
    return this.reverb;
  }

  get outputGain(): IGainNode<IAudioContext> {
    return this.master;
  }

  /**
   * Apply a new effects configuration while playing. Delay time, feedback
   * and wet/dry move smoothly; the reverb is regenerated only when its room
   * size or damping changes (its impulse response is random noise shaped by
   * them, so rebuilding it on every call would audibly re-roll the room).
   *
   * Zero is a real value everywhere: a room size or damping of 0 used to
   * fall back to 0.5 (`||`).
   */
  update(effects: EffectsConfig): void {
    this.effects = { ...effects };
    // The first configuration is applied at once, as the engine always did;
    // later ones glide, so a live change does not click.
    const smooth = this.configured;
    this.configured = true;

    // Delay: present only while its time is above zero.
    const delayMs = effects.delayTimeInMs ?? 0;
    if (delayMs > 0) {
      if (!this.delay || !this.feedback) {
        this.delay = this.context.createDelay(1.0);
        this.feedback = this.context.createGain();
        this.delay.connect(this.feedback);
        this.feedback.connect(this.delay);
        this.send.connect(this.delay);
        this.delay.connect(this.wet);
      }
      this.setParam(this.delay.delayTime, Math.min(delayMs, 1000) / 1000, smooth);
      // Capped below 1: feedback of 1 or more never dies away.
      this.setParam(this.feedback.gain, Math.min(effects.feedback ?? 0.5, 0.95), smooth);
    } else if (this.delay) {
      this.send.disconnect(this.delay);
      this.delay.disconnect();
      this.feedback?.disconnect();
      this.delay = null;
      this.feedback = null;
    }

    // Reverb: present only while the wet mix is above zero.
    const wetDry = effects.wetDryRatio ?? 0;
    if (wetDry > 0) {
      const roomSize = effects.reverbRoomSize ?? 0.5;
      const damping = effects.reverbDamping ?? 0.5;
      const key = `${roomSize}:${damping}`;
      if (!this.reverb) {
        this.reverb = this.context.createConvolver();
        this.send.connect(this.reverb);
        this.reverb.connect(this.wet);
      }
      if (key !== this.reverbKey) {
        this.reverb.buffer = this.impulseResponse(roomSize, damping);
        this.reverbKey = key;
      }
    } else if (this.reverb) {
      this.send.disconnect(this.reverb);
      this.reverb.disconnect();
      this.reverb = null;
      this.reverbKey = "";
    }

    this.setWetDry(effects.wetDryRatio, smooth);
  }

  /** Wet/dry balance, 0 (all dry) to 1 (all wet). Unset leaves both at full. */
  setWetDry(wetDryRatio: number | undefined, smooth = true): void {
    const r = wetDryRatio === undefined ? undefined : Math.max(0, Math.min(1, wetDryRatio));
    this.setParam(this.wet.gain, r ?? 1, smooth);
    this.setParam(this.dry.gain, r === undefined ? 1 : 1 - r, smooth);
  }

  /** Glide to a value (50 ms), or set it outright where that is not possible. */
  private setParam(param: { value: number; setTargetAtTime?: Function }, value: number, smooth: boolean) {
    if (smooth && typeof param.setTargetAtTime === "function") {
      param.setTargetAtTime(value, this.context.currentTime, 0.05);
    } else {
      param.value = value;
    }
  }

  get config(): EffectsConfig {
    return { ...this.effects };
  }

  disconnect(): void {
    this.master.disconnect();
  }

  /** Algorithmic reverb: decaying noise, longer for a bigger room. */
  private impulseResponse(roomSize: number, damping: number): IAudioBuffer {
    const sampleRate = this.context.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * roomSize * 3)); // up to 3 s
    const impulse = this.context.createBuffer(2, length, sampleRate);
    const roomScale = Math.pow(roomSize, 0.3);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const noise = (Math.random() * 2 - 1) * 0.8;
        const decay = Math.pow(1 - damping, i / length);
        data[i] = noise * decay * roomScale;
      }
    }
    return impulse;
  }
}
