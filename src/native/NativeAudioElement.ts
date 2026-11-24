/**
 * A stand-in for the browser's <audio> element on native, with just the
 * parts the framework uses (src/platform.ts, MediaElementLike): set `src`,
 * play, pause, seek with `currentTime`, `loop`, `playbackRate`, and the
 * events the playlist and speakers listen for.
 *
 * It streams, as the browser's element does: through react-native-audio-api's
 * file source (built with FFmpeg, it reads a server file by byte ranges as it
 * plays, or a file on the device), into `output`, a gain node the framework
 * connects onward like a media element source. A 40-minute speaker never
 * sits decoded in memory (server docs/039, "Speaker loading and offline").
 *
 * Opening a file source is a synchronous call: the app's JavaScript waits
 * while it opens. Opened from the server, a stalled connection there froze
 * the app's buttons for good (docs/039), so with `fetchFile` each file is
 * first saved to the device in the background and the file source opens
 * the local copy, which takes milliseconds. The same copies are the start
 * of offline listening.
 *
 * Without the file source (an app built without it, or a format it can't
 * open) it falls back to decoding the whole file and playing it through a
 * buffer source: fine for recordings, heavy for long speakers.
 */
import { silenceAudioBase64 } from "../utils";

type Listener = (event: { type: string; target: NativeAudioElement }) => void;

/** The parts of react-native-audio-api's AudioContext used here. */
export type NativeContextLike = {
  currentTime: number;
  /** The library's native context (createFileSource lives there). */
  context?: { createFileSource?(options: object): unknown };
  createGain(): any;
  createBufferSource(): any;
  decodeAudioData(input: string | ArrayBuffer): Promise<any>;
  markRunningOnSourceStart?(): void;
};

/** react-native-audio-api's AudioFileSourceNode (not in its public exports,
 *  so the app passes it in). */
export type FileSourceNodeClass = new (ctx: any, node: unknown) => FileSourceNodeLike;
export type FileSourceNodeLike = {
  attach(options: { loop: boolean; onEnded: () => void }): { duration: number };
  dispose(): void;
  connect(node: unknown): void;
  disconnect(): void;
  pause(): void;
  seekToTime(seconds: number): void;
  setLoop(value: boolean): void;
  setPlaybackRate(value: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getFileSourceNode(): { start(when: number): void };
};

export type NativeAudioOptions = {
  FileSourceNode?: FileSourceNodeClass;
  /** A file's address → the file on the device (a path or file:// URL),
   *  downloaded first if need be. Without it, files stream from the server. */
  fetchFile?: (url: string) => Promise<string>;
  log?: (message: string) => void;
};

export class NativeAudioElement {
  crossOrigin: string | null = null;
  preload = "auto";
  paused = true;
  readyState = 0;
  duration = NaN;
  /** Where the sound comes out: connect it on like a media element source. */
  readonly output: any;

  private ctx: NativeContextLike;
  private opts: NativeAudioOptions;
  private _src = "";
  /** Where the file is read from: the server, or the copy on the device. */
  private where = "";
  private _loop = false;
  private _rate = 1;
  private generation = 0;
  private listeners = new Map<string, Set<{ fn: Listener; once: boolean }>>();

  // Streaming: the file source, made again after it ends.
  private file: FileSourceNodeLike | null = null;
  private fileSpent = false;
  private fileStarted = false;

  // Fallback: the whole file decoded.
  private buffer: any = null;
  private loading: Promise<void> | null = null;
  private loadError: unknown = null;
  private source: any = null;
  private startedAt = 0; // audio clock time the current source started
  private offset = 0; // seconds into the recording at startedAt (or paused at)

  constructor(ctx: NativeContextLike, opts: NativeAudioOptions = {}) {
    this.ctx = ctx;
    this.opts = opts;
    this.output = ctx.createGain();
  }

  get src() {
    return this._src;
  }

  set src(value: string) {
    this.release();
    this.paused = true;
    this.loadError = null;
    this.offset = 0;
    this.readyState = 0;
    this.duration = NaN;
    this._src = value;
    const generation = ++this.generation;
    this.loading = null;
    if (!value || value === silenceAudioBase64 || value.startsWith("data:")) {
      // Silence (the framework's placeholder): nothing to play.
      this.duration = 0;
      this.readyState = 4;
      return;
    }
    const url = value.startsWith("//") ? `https:${value}` : value;
    const current = () => generation === this.generation;

    if (this.canStream() && this.opts.fetchFile) {
      this.loading = this.opts.fetchFile(url).then(
        (local) => {
          if (!current()) return;
          this.where = local;
          if (this.openFile(local)) this.loaded();
          else return this.decode(local, generation);
        },
        (err) => {
          if (!current()) return;
          this.opts.log?.(`download failed, decoding instead: ${err instanceof Error ? err.message : err}`);
          return this.decode(url, generation);
        }
      );
      return;
    }
    this.where = url;
    if (this.openFile(url)) {
      // Listeners are added after src is set, as in the browser.
      this.loading = Promise.resolve().then(() => {
        if (current()) this.loaded();
      });
      return;
    }
    this.loading = this.decode(url, generation);
  }

  private decode(where: string, generation: number): Promise<void> {
    return this.ctx.decodeAudioData(where).then(
      (buffer) => {
        if (generation !== this.generation) return;
        this.buffer = buffer;
        this.duration = buffer.duration;
        this.loaded();
      },
      (err) => {
        if (generation !== this.generation) return;
        this.loadError = err;
        this.emit("error");
      }
    );
  }

  get loop() {
    return this._loop;
  }

  set loop(value: boolean) {
    this._loop = !!value;
    this.file?.setLoop(this._loop);
  }

  get playbackRate() {
    return this._rate;
  }

  /** Classic speakers nudge this to keep in sync ("-sync" modes). */
  set playbackRate(value: number) {
    this._rate = Number(value) || 1;
    try {
      this.file?.setPlaybackRate(this._rate);
    } catch {}
  }

  get currentTime() {
    if (this.file) return this.fileSpent ? this.offset : this.file.getCurrentTime();
    if (this.paused || !this.buffer) return this.offset;
    const t = this.offset + (this.ctx.currentTime - this.startedAt);
    return this._loop && this.duration > 0 ? t % this.duration : Math.min(t, this.duration);
  }

  set currentTime(value: number) {
    this.offset = Math.max(0, Number(value) || 0);
    if (this.file) {
      if (!this.fileSpent) this.file.seekToTime(this.offset);
      return;
    }
    if (!this.paused && this.buffer) this.startSource();
  }

  async play(): Promise<void> {
    const generation = this.generation;
    if (this.loading) await this.loading;
    if (generation !== this.generation) return;
    if (this.loadError) throw this.loadError;
    if (!this.paused) return;
    if (this.file && this.fileSpent && !this.openFile(this.where)) {
      throw new Error(`Can't reopen ${this._src}`);
    }
    this.paused = false;
    this.emit("play");
    if (this.file) {
      if (this.offset > 0 && !this.fileStarted) this.file.seekToTime(this.offset);
      this.file.getFileSourceNode().start(this.ctx.currentTime);
      this.ctx.markRunningOnSourceStart?.();
      this.fileStarted = true;
    } else if (this.buffer) {
      this.startSource();
    } else {
      return; // silence
    }
    this.emit("playing");
  }

  pause() {
    if (this.paused) return;
    if (this.file) {
      this.offset = this.file.getCurrentTime();
      this.file.pause();
    } else {
      this.offset = this.currentTime;
      this.stopSource();
    }
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

  private canStream() {
    return !!this.opts.FileSourceNode && !!this.ctx.context?.createFileSource;
  }

  private loaded() {
    this.readyState = 4;
    ["loadedmetadata", "loadeddata", "canplay", "canplaythrough"].forEach((t) => this.emit(t));
  }

  /** A streaming file source for `where`, or false to fall back. */
  private openFile(where: string): boolean {
    const FileSourceNode = this.opts.FileSourceNode;
    const create = this.ctx.context?.createFileSource;
    if (!FileSourceNode || !create) return false;
    const name = where.split("/").pop();
    this.disposeFile();
    // Logged first, so a hang inside the open shows which file it was.
    this.opts.log?.(`opening ${name}`);
    let node: unknown;
    const t0 = Date.now();
    try {
      node = create.call(this.ctx.context, {
        source: where.startsWith("file://") ? where.slice("file://".length) : where,
        loop: this._loop,
        volume: 1,
        playbackRate: this._rate,
        preservesPitch: true,
      });
    } catch (e) {
      this.opts.log?.(`stream failed, decoding instead: ${e instanceof Error ? e.message : e}`);
      return false;
    }
    if (!node) return false; // a format the build can't open
    const file = new FileSourceNode(this.ctx, node);
    const { duration } = file.attach({ loop: this._loop, onEnded: () => this.fileEnded(file) });
    file.connect(this.output);
    this.file = file;
    this.fileSpent = false;
    this.fileStarted = false;
    this.duration = duration;
    const ms = Date.now() - t0;
    this.opts.log?.(`streaming ${name}, ${duration.toFixed(0)} s` + (ms > 50 ? `, opening held the app ${ms} ms` : ""));
    return true;
  }

  private fileEnded(file: FileSourceNodeLike) {
    if (file !== this.file || this.paused) return;
    // It plays once; play() opens it again.
    this.fileSpent = true;
    this.paused = true;
    this.offset = 0;
    this.emit("pause");
    this.emit("ended");
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

  private release() {
    this.stopSource();
    this.buffer = null;
    this.disposeFile();
  }

  private disposeFile() {
    const file = this.file;
    this.file = null;
    if (!file) return;
    try {
      file.pause();
    } catch {}
    try {
      file.disconnect();
    } catch {}
    file.dispose();
  }

  private startSource() {
    this.stopSource();
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.loop = this._loop;
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
