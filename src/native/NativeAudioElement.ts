/**
 * A stand-in for the browser's <audio> element on native, with just the
 * parts the framework uses (src/platform.ts, MediaElementLike): set `src`,
 * play, pause, seek with `currentTime`, and the events the playlist and
 * speakers listen for.
 *
 * It decodes the whole recording, then plays it through a buffer source
 * into `output`, a gain node the framework connects onward like a media
 * element source. Recordings are short enough for that; long speaker
 * files would want streaming (server docs/039, "still open").
 */
import { silenceAudioBase64 } from "../utils";

type Listener = (event: { type: string; target: NativeAudioElement }) => void;

/** The parts of react-native-audio-api's AudioContext used here. */
export type NativeContextLike = {
  currentTime: number;
  createGain(): any;
  createBufferSource(): any;
  decodeAudioData(input: string | ArrayBuffer): Promise<any>;
};

export class NativeAudioElement {
  crossOrigin: string | null = null;
  preload = "auto";
  loop = false;
  paused = true;
  readyState = 0;
  duration = NaN;
  /** Where the sound comes out: connect it on like a media element source. */
  readonly output: any;

  private ctx: NativeContextLike;
  private _src = "";
  private buffer: any = null;
  private loading: Promise<void> | null = null;
  private loadError: unknown = null;
  private generation = 0;
  private source: any = null;
  private startedAt = 0; // audio clock time the current source started
  private offset = 0; // seconds into the recording at startedAt (or paused at)
  private listeners = new Map<string, Set<{ fn: Listener; once: boolean }>>();

  constructor(ctx: NativeContextLike) {
    this.ctx = ctx;
    this.output = ctx.createGain();
  }

  get src() {
    return this._src;
  }

  set src(value: string) {
    this.stopSource();
    this.paused = true;
    this.buffer = null;
    this.loadError = null;
    this.offset = 0;
    this.readyState = 0;
    this.duration = NaN;
    this._src = value;
    const generation = ++this.generation;
    if (!value || value === silenceAudioBase64 || value.startsWith("data:")) {
      // Silence (the framework's placeholder): nothing to decode.
      this.loading = null;
      this.duration = 0;
      this.readyState = 4;
      return;
    }
    const url = value.startsWith("//") ? `https:${value}` : value;
    this.loading = this.ctx.decodeAudioData(url).then(
      (buffer) => {
        if (generation !== this.generation) return;
        this.buffer = buffer;
        this.duration = buffer.duration;
        this.readyState = 4;
        ["loadedmetadata", "loadeddata", "canplay", "canplaythrough"].forEach((t) => this.emit(t));
      },
      (err) => {
        if (generation !== this.generation) return;
        this.loadError = err;
        this.emit("error");
      }
    );
  }

  get currentTime() {
    if (this.paused || !this.buffer) return this.offset;
    const t = this.offset + (this.ctx.currentTime - this.startedAt);
    return this.loop && this.duration > 0 ? t % this.duration : Math.min(t, this.duration);
  }

  set currentTime(value: number) {
    this.offset = Math.max(0, Number(value) || 0);
    if (!this.paused && this.buffer) this.startSource();
  }

  async play(): Promise<void> {
    const generation = this.generation;
    if (this.loading) await this.loading;
    if (generation !== this.generation) return;
    if (this.loadError) throw this.loadError;
    if (!this.paused) return;
    this.paused = false;
    this.emit("play");
    if (!this.buffer) return; // silence
    this.startSource();
    this.emit("playing");
  }

  pause() {
    if (this.paused) return;
    this.offset = this.currentTime;
    this.stopSource();
    this.paused = true;
    this.emit("pause");
  }

  addEventListener(type: string, fn: Listener, options?: boolean | { once?: boolean }) {
    const once = typeof options === "object" && !!options?.once;
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add({ fn, once });
  }

  removeEventListener(type: string, fn: Listener) {
    const set = this.listeners.get(type);
    set?.forEach((l) => l.fn === fn && set.delete(l));
  }

  private emit(type: string) {
    const set = this.listeners.get(type);
    if (!set) return;
    [...set].forEach((l) => {
      if (l.once) set.delete(l);
      try {
        l.fn({ type, target: this });
      } catch (e) {
        console.error(`[NativeAudioElement] ${type} listener failed`, e);
      }
    });
  }

  private startSource() {
    this.stopSource();
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.loop = this.loop;
    src.connect(this.output);
    const at = Math.min(this.offset, Math.max(0, this.duration - 0.001));
    src.onended = () => {
      // Clearing the handler releases the node (the library keeps it while
      // a handler is set).
      src.onended = null;
      try {
        src.disconnect();
      } catch {}
      if (this.source !== src) return; // replaced or stopped on purpose
      this.source = null;
      this.paused = true;
      this.offset = 0;
      this.emit("pause");
      this.emit("ended");
    };
    this.startedAt = this.ctx.currentTime;
    this.offset = at;
    src.start(0, at);
    this.source = src;
  }

  private stopSource() {
    const src = this.source;
    this.source = null;
    if (!src) return;
    try {
      src.stop();
    } catch {}
  }
}
