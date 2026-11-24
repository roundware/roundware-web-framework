import { silenceAudioBase64 } from "../utils";
import { NativeAudioElement } from "./NativeAudioElement";

class FakeSource {
  buffer: any;
  loop = false;
  onended: (() => void) | null = null;
  started: [number, number] | null = null;
  stopped = false;
  connect = jest.fn();
  disconnect = jest.fn();
  start(when: number, offset: number) {
    this.started = [when, offset];
  }
  stop() {
    this.stopped = true;
  }
}

function fakeContext() {
  const sources: FakeSource[] = [];
  const ctx = {
    currentTime: 0,
    createGain: () => ({ connect: jest.fn() }),
    createBufferSource: () => {
      const s = new FakeSource();
      sources.push(s);
      return s;
    },
    decodeAudioData: jest.fn(async (url: string) => {
      if (url.includes("bad")) throw new Error("decode failed");
      return { duration: 10, url };
    }),
  };
  return { ctx, sources };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("NativeAudioElement", () => {
  it("decodes the src (protocol-relative made https) and announces its metadata", async () => {
    const { ctx } = fakeContext();
    const el = new NativeAudioElement(ctx);
    const loaded = jest.fn();
    el.addEventListener("loadedmetadata", loaded, { once: true });
    el.src = "//api.example.org/a.mp3";
    await flush();
    expect(ctx.decodeAudioData).toHaveBeenCalledWith("https://api.example.org/a.mp3");
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(el.duration).toBe(10);
    expect(el.readyState).toBe(4);
  });

  it("plays from currentTime, reports position, and pauses where it is", async () => {
    const { ctx, sources } = fakeContext();
    const el = new NativeAudioElement(ctx);
    const events: string[] = [];
    ["play", "playing", "pause"].forEach((t) => el.addEventListener(t, () => events.push(t)));
    el.src = "https://x/a.mp3";
    el.currentTime = 3;
    ctx.currentTime = 100;
    await el.play();
    expect(sources[0].started).toEqual([0, 3]);
    expect(el.paused).toBe(false);
    ctx.currentTime = 102;
    expect(el.currentTime).toBeCloseTo(5);
    el.pause();
    expect(sources[0].stopped).toBe(true);
    expect(el.currentTime).toBeCloseTo(5);
    expect(events).toEqual(["play", "playing", "pause"]);
  });

  it("fires pause then ended when the recording ends, and frees the node", async () => {
    const { ctx, sources } = fakeContext();
    const el = new NativeAudioElement(ctx);
    const events: string[] = [];
    ["pause", "ended"].forEach((t) => el.addEventListener(t, () => events.push(t)));
    el.src = "https://x/a.mp3";
    await el.play();
    sources[0].onended!();
    expect(events).toEqual(["pause", "ended"]);
    expect(el.paused).toBe(true);
    expect(sources[0].onended).toBeNull();
  });

  it("doesn't report an end it caused by pausing or changing src", async () => {
    const { ctx, sources } = fakeContext();
    const el = new NativeAudioElement(ctx);
    const ended = jest.fn();
    el.addEventListener("ended", ended);
    el.src = "https://x/a.mp3";
    await el.play();
    el.src = "https://x/b.mp3";
    sources[0].onended!();
    expect(ended).not.toHaveBeenCalled();
  });

  it("rejects play and fires error when decoding fails", async () => {
    const { ctx } = fakeContext();
    const el = new NativeAudioElement(ctx);
    const error = jest.fn();
    el.addEventListener("error", error);
    el.src = "https://x/bad.mp3";
    await expect(el.play()).rejects.toThrow("decode failed");
    expect(error).toHaveBeenCalled();
  });

  it("treats the silence placeholder as nothing to decode", async () => {
    const { ctx, sources } = fakeContext();
    const el = new NativeAudioElement(ctx);
    el.src = silenceAudioBase64;
    await el.play();
    expect(ctx.decodeAudioData).not.toHaveBeenCalled();
    expect(sources).toHaveLength(0);
  });
});

/** react-native-audio-api's AudioFileSourceNode, as the stand-in uses it. */
class FakeFile {
  static made: FakeFile[] = [];
  node: any;
  onEnded: (() => void) | null = null;
  loop = false;
  rate = 1;
  position = 0;
  starts: number[] = [];
  paused = 0;
  connectedTo: unknown = null;
  disposed = false;
  constructor(_ctx: unknown, node: any) {
    this.node = node;
    FakeFile.made.push(this);
  }
  attach(o: { loop: boolean; onEnded: () => void }) {
    this.loop = o.loop;
    this.onEnded = o.onEnded;
    return { duration: this.node.duration };
  }
  dispose() {
    this.disposed = true;
  }
  connect(n: unknown) {
    this.connectedTo = n;
  }
  disconnect() {}
  pause() {
    this.paused++;
  }
  seekToTime(s: number) {
    this.position = s;
  }
  setLoop(v: boolean) {
    this.loop = v;
  }
  setPlaybackRate(v: number) {
    this.rate = v;
  }
  getCurrentTime() {
    return this.position;
  }
  getDuration() {
    return this.node.duration;
  }
  getFileSourceNode() {
    return { start: (when: number) => this.starts.push(when) };
  }
}

function streamingContext() {
  const { ctx } = fakeContext();
  const opened: any[] = [];
  const context = {
    createFileSource: jest.fn((o: any) => {
      opened.push(o);
      return o.source.endsWith(".xyz") ? null : { duration: 2400 };
    }),
  };
  return { ctx: { ...ctx, context }, opened };
}

describe("NativeAudioElement, streaming", () => {
  beforeEach(() => (FakeFile.made = []));

  it("streams the file rather than decoding it, through its output", async () => {
    const { ctx, opened } = streamingContext();
    const el = new NativeAudioElement(ctx, { FileSourceNode: FakeFile as any });
    const loaded = jest.fn();
    el.src = "//cdn.example.org/speaker.mp3";
    el.addEventListener("loadedmetadata", loaded);
    await flush();
    expect(opened[0].source).toBe("https://cdn.example.org/speaker.mp3");
    expect(ctx.decodeAudioData).not.toHaveBeenCalled();
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(el.duration).toBe(2400);
    expect(FakeFile.made[0].connectedTo).toBe(el.output);
  });

  it("plays from a seek, follows loop and playback rate, and pauses", async () => {
    const { ctx } = streamingContext();
    const el = new NativeAudioElement(ctx, { FileSourceNode: FakeFile as any });
    el.src = "https://x/speaker.mp3";
    el.loop = true;
    el.currentTime = 600;
    ctx.currentTime = 5;
    await el.play();
    const file = FakeFile.made[0];
    expect(file.position).toBe(600);
    expect(file.starts).toEqual([5]);
    expect(file.loop).toBe(true);
    el.playbackRate = 1.05;
    expect(file.rate).toBe(1.05);
    file.position = 612;
    expect(el.currentTime).toBe(612);
    el.pause();
    expect(file.paused).toBe(1);
    expect(el.paused).toBe(true);
  });

  it("reports the end, then opens the file again to replay it", async () => {
    const { ctx, opened } = streamingContext();
    const el = new NativeAudioElement(ctx, { FileSourceNode: FakeFile as any });
    const events: string[] = [];
    ["pause", "ended"].forEach((t) => el.addEventListener(t, () => events.push(t)));
    el.src = "https://x/rec.mp3";
    await el.play();
    FakeFile.made[0].onEnded!();
    expect(events).toEqual(["pause", "ended"]);
    expect(el.paused).toBe(true);
    await el.play();
    expect(opened).toHaveLength(2);
    expect(FakeFile.made[0].disposed).toBe(true);
    expect(FakeFile.made[1].starts).toHaveLength(1);
  });

  it("opens the copy on the device once it is downloaded", async () => {
    const { ctx, opened } = streamingContext();
    const loaded = jest.fn();
    let finish!: (path: string) => void;
    const fetchFile = jest.fn(() => new Promise<string>((r) => (finish = r)));
    const el = new NativeAudioElement(ctx, { FileSourceNode: FakeFile as any, fetchFile });
    el.src = "//cdn.example.org/a.mp3";
    el.addEventListener("loadedmetadata", loaded);
    expect(fetchFile).toHaveBeenCalledWith("https://cdn.example.org/a.mp3");
    expect(opened).toHaveLength(0); // nothing opened from the server
    finish("file:///caches/media/a.mp3");
    await el.play();
    expect(opened[0].source).toBe("/caches/media/a.mp3");
    expect(loaded).toHaveBeenCalledTimes(1);
    FakeFile.made[0].onEnded!();
    await el.play(); // replays from the same copy
    expect(opened[1].source).toBe("/caches/media/a.mp3");
  });

  it("decodes from the server when the download fails", async () => {
    const { ctx, opened } = streamingContext();
    const log = jest.fn();
    const el = new NativeAudioElement(ctx, {
      FileSourceNode: FakeFile as any,
      fetchFile: () => Promise.reject(new Error("offline")),
      log,
    });
    el.src = "https://x/a.mp3";
    await el.play();
    expect(opened).toHaveLength(0);
    expect(ctx.decodeAudioData).toHaveBeenCalledWith("https://x/a.mp3");
    expect(log).toHaveBeenCalledWith(expect.stringContaining("offline"));
  });

  it("ignores a download that finishes after src changed", async () => {
    const { ctx, opened } = streamingContext();
    const finish: Array<(p: string) => void> = [];
    const el = new NativeAudioElement(ctx, {
      FileSourceNode: FakeFile as any,
      fetchFile: () => new Promise<string>((r) => finish.push(r)),
    });
    el.src = "https://x/a.mp3";
    el.src = "https://x/b.mp3";
    finish[1]("/c/b.mp3");
    finish[0]("/c/a.mp3");
    await flush();
    expect(opened.map((o) => o.source)).toEqual(["/c/b.mp3"]);
  });

  it("decodes instead when the file source can't open the format", async () => {
    const { ctx } = streamingContext();
    const el = new NativeAudioElement(ctx, { FileSourceNode: FakeFile as any });
    el.src = "https://x/odd.xyz";
    await flush();
    expect(ctx.decodeAudioData).toHaveBeenCalledWith("https://x/odd.xyz");
    expect(el.duration).toBe(10);
  });

  it("lets go of the old stream when src changes", async () => {
    const { ctx } = streamingContext();
    const el = new NativeAudioElement(ctx, { FileSourceNode: FakeFile as any });
    el.src = "https://x/a.mp3";
    el.src = "https://x/b.mp3";
    expect(FakeFile.made[0].disposed).toBe(true);
    expect(FakeFile.made[1].disposed).toBe(false);
  });
});
