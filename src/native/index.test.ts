import { createNativePlatform } from "./index";

/** A stand-in for react-native-audio-api and React Native's AppState. */
function fakes({ activationFails = false } = {}) {
  let onInterruption: (e: any) => void = () => {};
  let onAppState: (s: string) => void = () => {};
  const ctx = { state: "running", resume: jest.fn(async () => {}), createGain: () => ({}) };
  const audio: any = {
    AudioContext: jest.fn(() => ctx),
    AudioManager: {
      setSystemOptions: jest.fn(),
      setAudioSessionActivity: jest.fn(async () => {
        if (fails.now) throw new Error("CannotInterruptOthers");
      }),
      observeAudioInterruptions: jest.fn(),
      addSystemEventListener: jest.fn((_name: string, cb: any) => {
        onInterruption = cb;
        return { remove: jest.fn() };
      }),
    },
  };
  const fails = { now: false };
  const AppState = {
    addEventListener: jest.fn((_t: string, cb: any) => {
      onAppState = cb;
      return { remove: jest.fn() };
    }),
  };
  const platform = createNativePlatform({ audio, Location: {} as any, AppState, log: () => {} });
  platform.createAudioContext();
  fails.now = activationFails;
  const events: string[] = [];
  platform.onAudioInterruption!((e) => events.push(e));
  return {
    platform,
    ctx,
    events,
    fails,
    interrupt: (e: any) => onInterruption(e),
    appState: (s: string) => onAppState(s),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("native platform, audio interruptions", () => {
  it("tells listeners when audio is taken and when it resumes", async () => {
    const f = fakes();
    f.interrupt({ type: "began" });
    expect(f.platform.audioInterrupted()).toBe(true);
    f.interrupt({ type: "ended", shouldResume: true });
    await flush();
    expect(f.events).toEqual(["began", "resumed"]);
    expect(f.ctx.resume).toHaveBeenCalled();
    expect(f.platform.audioInterrupted()).toBe(false);
  });

  it("waits for the app to be opened when iOS says not to resume", async () => {
    const f = fakes();
    f.interrupt({ type: "began" });
    f.interrupt({ type: "ended", shouldResume: false });
    await flush();
    expect(f.events).toEqual(["began"]);
    f.appState("active");
    await flush();
    expect(f.events).toEqual(["began", "resumed"]);
  });

  it("tries again when the app is opened if resuming from the background fails", async () => {
    const f = fakes({ activationFails: true });
    f.interrupt({ type: "began" });
    f.interrupt({ type: "ended", shouldResume: true });
    await flush();
    expect(f.events).toEqual(["began"]);
    f.fails.now = false;
    f.appState("active");
    await flush();
    expect(f.events).toEqual(["began", "resumed"]);
  });

  it("does nothing on opening the app when nothing was interrupted", async () => {
    const f = fakes();
    f.appState("active");
    await flush();
    expect(f.events).toEqual([]);
    expect(f.ctx.resume).not.toHaveBeenCalled();
  });
});
