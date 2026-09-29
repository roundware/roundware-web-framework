import { sample } from "lodash";
import { IAudioBuffer, IAudioBufferSourceNode, IAudioContext } from "standardized-audio-context";
import { SpeakerConfig } from "../types/roundware";
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { MasterEffects } from "./master_effects";

/** What the current loop is doing, for a UI to show. */
export interface PreviewLoopInfo {
  fraction: number; // as chosen from loopFractions; negative = reversed
  reversed: boolean;
  pan: number;
  durationSeconds: number;
}

/**
 * Plays one speaker's audio on its own, looping, through the same processing
 * a listener hears: loop fractions (reversed when negative), stereo pan and
 * the effects bus (MasterEffects), with each loop built by the same
 * BufferEffectsProcessor.composeBuffer the SpeakerEngine uses.
 *
 * It leaves out what depends on a listener's position — distance
 * attenuation, choosing among several speakers, syncing a group — so an
 * author can hear the effects and loop settings on one sound, in the
 * admin's Audio lab, without walking into it.
 *
 * Config changes apply live: effects at once, loop choices from the next loop.
 */
export class SpeakerPreview {
  private context: IAudioContext;
  private config: SpeakerConfig;
  private effects: MasterEffects;
  private buffer: IAudioBuffer | null = null;
  private sources: IAudioBufferSourceNode<IAudioContext>[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private fraction = 1;
  private started = false;
  /** Which speaker slot's pan position to use (effects.pan[slot]). */
  slot = 0;
  /** Linear gain for the speaker, e.g. its max_volume. */
  volume = 1;
  onLoop?: (info: PreviewLoopInfo) => void;

  constructor(context: IAudioContext, config: SpeakerConfig) {
    this.context = context;
    this.config = config;
    this.effects = new MasterEffects(context, context.destination, config.effects);
  }

  get isPlaying(): boolean {
    return this.started;
  }

  /** Fetch and decode a speaker's audio. Stops anything playing. */
  async load(uri: string): Promise<void> {
    this.stop();
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Could not load ${uri} (${response.status})`);
    const data = await response.arrayBuffer();
    this.buffer = await this.context.decodeAudioData(data);
  }

  updateConfig(config: SpeakerConfig): void {
    this.config = config;
    this.effects.update(config.effects ?? {});
  }

  play(): void {
    if (!this.buffer || this.started) return;
    this.started = true;
    if (this.context.state === "suspended") this.context.resume();
    this.fraction = this.pickFraction(true);
    this.scheduleLoop(this.context.currentTime + 0.05);
  }

  stop(): void {
    this.started = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        // already stopped
      }
      s.disconnect();
    });
    this.sources = [];
  }

  dispose(): void {
    this.stop();
    this.effects.disconnect();
  }

  /** New fraction with probability loopPointUpdateProbability, as the engine does. */
  private pickFraction(force = false): number {
    const p = this.config.loopPointUpdateProbability ?? 1;
    if (!force && Math.random() >= p) return this.fraction;
    return sample(this.config.loopFractions?.length ? this.config.loopFractions : [1]) ?? 1;
  }

  private scheduleLoop(when: number): void {
    if (!this.started || !this.buffer) return;
    const base = this.buffer.duration;
    const fraction = this.fraction || 1;
    const reversed = fraction < 0;
    const duration = base * Math.abs(fraction);
    const times = Math.ceil(base / duration);
    const pan = this.config.effects?.pan?.[this.slot] ?? 0;

    const loopBuffer = new BufferEffectsProcessor(
      this.buffer,
      this.context,
      this.config.effects ?? {}
    )
      .composeBuffer({ duration, times, fadeInDuration: 0, fadeInStartVolume: 1, isReverse: reversed })
      .getBuffer();

    // source → gain → panner → dry + effects send, as SpeakerTrack routes it
    const source = this.context.createBufferSource();
    source.buffer = loopBuffer;
    const gain = this.context.createGain();
    gain.gain.value = this.volume;
    const panner = this.context.createStereoPanner();
    panner.pan.value = pan;
    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.effects.dryInput);
    panner.connect(this.effects.sendInput);
    source.onended = () => {
      source.disconnect();
      this.sources = this.sources.filter((s) => s !== source);
    };
    source.start(when);
    this.sources.push(source);
    this.onLoop?.({ fraction, reversed, pan, durationSeconds: duration });

    // Queue the next loop just before this one ends, so they join seamlessly.
    const next = when + loopBuffer.duration;
    const lead = Math.max(0, (next - this.context.currentTime - 0.25) * 1000);
    this.timer = setTimeout(() => {
      this.fraction = this.pickFraction();
      this.scheduleLoop(next);
    }, lead);
  }
}
