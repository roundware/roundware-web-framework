import { connectNowPlaying } from "./nowPlaying";

const flush = () => new Promise((r) => setTimeout(r, 0));

function setup({ interrupted = false } = {}) {
  const handlers: Record<string, () => unknown> = {};
  const shown: any[] = [];
  const notification = {
    show: jest.fn(async (info: any) => void shown.push(info)),
    hide: jest.fn(async () => {}),
    enableControl: jest.fn(async () => {}),
    addEventListener: jest.fn((name: string, cb: any) => {
      handlers[name] = cb;
      return { remove: jest.fn() };
    }),
  };
  const mixer = {
    playing: true,
    toggle: jest.fn((play?: boolean) => (mixer.playing = !!play)),
  };
  let tell: (e: "began" | "resumed") => void = () => {};
  const state = { interrupted };
  const platform: any = {
    audioInterrupted: () => state.interrupted,
    resumeAudio: jest.fn(async () => {
      state.interrupted = false;
      return true;
    }),
    onAudioInterruption: (fn: any) => ((tell = fn), () => {}),
  };
  const np = connectNowPlaying(notification, mixer, platform, { title: "Roundware" });
  return { np, notification, mixer, platform, state, shown, handlers, tell: (e: any) => tell(e) };
}

describe("lock-screen controls", () => {
  it("shows the project as playing, with only play and pause", async () => {
    const t = setup();
    await flush();
    expect(t.shown[0]).toMatchObject({ title: "Roundware", state: "playing", isLiveStream: true });
    const off = t.notification.enableControl.mock.calls.map((c: any[]) => c[0]);
    expect(off).toEqual(expect.arrayContaining(["nextTrack", "previousTrack", "skipForward", "skipBackward", "seekTo"]));
    expect(off).not.toContain("play");
  });

  it("pauses and plays the mix", async () => {
    const t = setup();
    t.handlers.playbackNotificationPause();
    expect(t.mixer.playing).toBe(false);
    await t.handlers.playbackNotificationPlay();
    expect(t.mixer.playing).toBe(true);
    await flush();
    expect(t.shown.at(-1).state).toBe("playing");
  });

  it("takes the audio back after an interruption iOS wouldn't resume", async () => {
    const t = setup({ interrupted: true });
    await t.handlers.playbackNotificationPlay();
    expect(t.platform.resumeAudio).toHaveBeenCalledWith("lock screen");
    expect(t.mixer.toggle).not.toHaveBeenCalled(); // the mix was on all along
  });

  it("shows paused while the audio is interrupted", async () => {
    const t = setup();
    t.state.interrupted = true;
    t.tell("began");
    await flush();
    expect(t.shown.at(-1).state).toBe("paused");
  });

  it("takes the controls off the lock screen when disconnected", async () => {
    const t = setup();
    await t.np.disconnect();
    expect(t.notification.hide).toHaveBeenCalled();
  });
});
