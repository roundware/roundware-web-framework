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
