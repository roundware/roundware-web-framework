import { jest } from "@jest/globals";
import { Feature, Point, Polygon } from "geojson";
import { IAudioContext } from "standardized-audio-context";
import { SpeakerConfig } from "../types/roundware";
import { silenceAudioBase64 } from "../utils";
import { ClassicSpeakers } from "./classic_speakers";
import { SpeakerTrack } from "./speaker_track";

/** An audio element that plays at once, with a known duration. */
class FakeAudio {
  static made: FakeAudio[] = [];
  src = "";
  loop = false;
  preload = "";
  crossOrigin: string | null = null;
  paused = true;
  currentTime = 0;
  duration = 30;
  readyState = 4;
  playbackRate = 1;
  error = null;
  refuse = false;
  private listeners: Record<string, (() => void)[]> = {};
  constructor() {
    FakeAudio.made.push(this);
  }
  play() {
    if (this.refuse) {
      return Promise.reject(Object.assign(new Error("no"), { name: "NotAllowedError" }));
    }
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  addEventListener(name: string, fn: () => void) {
    (this.listeners[name] ??= []).push(fn);
  }
  fire(name: string) {
    (this.listeners[name] ?? []).forEach((fn) => fn());
  }
}

const gainNode = () => ({
  gain: {
    value: 0,
    cancelScheduledValues: jest.fn(),
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
  },
  connect: jest.fn(),
});

const context = () =>
  ({
    currentTime: 0,
    createGain: jest.fn(gainNode),
    createMediaElementSource: jest.fn(() => ({ connect: jest.fn() })),
  }) as unknown as IAudioContext;

const square = (lng: number, lat: number, size = 0.001): Feature<Polygon> => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [lng, lat],
        [lng + size, lat],
        [lng + size, lat + size],
        [lng, lat + size],
        [lng, lat],
      ],
    ],
  },
});

const listener: Point = { type: "Point", coordinates: [0.0005, 0.0005] };

/** A speaker heard at `volume` here; its area is around the listener
 *  unless it's `far` (about 11 km away). */
const speaker = (id: number, volume: number, far = false) =>
  ({
    data: { id },
    uri: `https://media.test/speaker-${id}.mp3`,
    outerBoundary: far ? square(0.1, 0.1) : square(0, 0),
    calculatedVolume: 0,
    volumeByLocation: jest.fn(() => volume),
    emit: jest.fn(),
    warnGeometryOnce: jest.fn(),
  }) as unknown as SpeakerTrack & { volumeByLocation: jest.Mock };

const CONFIG = { mode: "classic", loop: true } as SpeakerConfig;

const audioFor = (s: SpeakerTrack) => FakeAudio.made.find((a) => a.src === s.uri);

describe("ClassicSpeakers", () => {
  let realAudio: unknown;
  let changed: jest.Mock<(ids: number[]) => void>;
  let classic: ClassicSpeakers;
  let ctx: IAudioContext;

  beforeEach(() => {
    jest.useFakeTimers({ now: 1_000_000 });
    realAudio = (global as any).Audio;
    (global as any).Audio = FakeAudio;
    FakeAudio.made = [];
    changed = jest.fn();
    ctx = context();
    classic = new ClassicSpeakers(ctx, [{} as any], changed);
  });

  afterEach(() => {
    classic.stop();
    (global as any).Audio = realAudio;
    jest.useRealTimers();
  });

  it("plays every speaker in earshot, at its volume there, on a loop", () => {
    const a = speaker(1, 0.8);
    const b = speaker(2, 0.3);
    const far = speaker(3, 0, true);
    classic.play([a, b, far], listener, CONFIG);

    expect(audioFor(a)?.paused).toBe(false);
    expect(audioFor(b)?.paused).toBe(false);
    expect(audioFor(a)?.loop).toBe(true);
    expect(audioFor(far)).toBeUndefined(); // not even loaded
    expect(classic.playingIds).toEqual([1, 2]);
    expect(changed).toHaveBeenLastCalledWith([1, 2]);
    expect(a.calculatedVolume).toBe(0.8);
  });

  it("loads a speaker that's near but not yet heard, without playing it", () => {
    const near = speaker(1, 0);
    classic.play([near], listener, CONFIG);
    expect(audioFor(near)?.paused).toBe(true);
    expect(classic.playingIds).toEqual([]);
  });

  it("joins a speaker where it would be had it played since Play", () => {
    const s = speaker(1, 0);
    classic.play([s], listener, CONFIG);
    jest.advanceTimersByTime(100_000);
    s.volumeByLocation.mockReturnValue(1);
    classic.update([s], listener, CONFIG);
    expect(audioFor(s)?.currentTime).toBe(100 % 30);
  });

  it("listening time stands still while stopped", () => {
    const s = speaker(1, 1);
    classic.play([s], listener, CONFIG);
    jest.advanceTimersByTime(50_000);
    classic.stop();
    expect(audioFor(s)?.paused).toBe(true);
    jest.advanceTimersByTime(100_000);
    classic.play([s], listener, CONFIG);
    expect(classic.elapsed).toBe(50);
    expect(audioFor(s)?.currentTime).toBe(50 % 30);
  });

  it("fades a speaker out when the listener leaves it, and lets it go when far", () => {
    const s = speaker(1, 1);
    classic.play([s], listener, CONFIG);
    const audio = audioFor(s)!;

    s.volumeByLocation.mockReturnValue(0);
    classic.update([s], listener, CONFIG);
    expect(classic.playingIds).toEqual([]);
    expect(audio.paused).toBe(false); // fading
    jest.advanceTimersByTime(3000);
    expect(audio.paused).toBe(true);
    expect(audio.src).toBe(s.uri); // still near: kept loaded

    const away: Point = { type: "Point", coordinates: [1, 1] };
    classic.update([s], away, CONFIG);
    expect(audio.src).toBe(silenceAudioBase64);
  });

  it("coming back while it fades picks up without restarting", () => {
    const s = speaker(1, 1);
    classic.play([s], listener, CONFIG);
    const audio = audioFor(s)!;
    s.volumeByLocation.mockReturnValue(0);
    classic.update([s], listener, CONFIG);
    audio.currentTime = 12;
    s.volumeByLocation.mockReturnValue(0.5);
    classic.update([s], listener, CONFIG);
    jest.advanceTimersByTime(5000);
    expect(audio.paused).toBe(false);
    expect(audio.currentTime).toBe(12);
    expect(classic.playingIds).toEqual([1]);
  });

  it("says when a speaker's stream is readied and let go (the map's not loaded)", () => {
    const s = speaker(1, 1);
    classic.play([s], listener, CONFIG);
    expect(s.emit).toHaveBeenCalledWith("loaded");
    expect(classic.has(1)).toBe(true);

    s.volumeByLocation.mockReturnValue(0);
    classic.update([s], { type: "Point", coordinates: [1, 1] }, CONFIG);
    expect(s.emit).toHaveBeenCalledWith("unloaded");
    expect(classic.has(1)).toBe(false);

    (s.emit as jest.Mock).mockClear();
    s.volumeByLocation.mockReturnValue(1);
    classic.update([s], listener, CONFIG); // back while fading
    expect(s.emit).toHaveBeenCalledWith("loaded");
    expect(classic.has(1)).toBe(true);
  });

  it("a speaker with a minimum volume plays everywhere, as in v2", () => {
    const background = speaker(1, 0.3, true); // its minimum, far outside
    classic.play([background], listener, CONFIG);
    expect(audioFor(background)?.paused).toBe(false);
  });

  it("a speaker whose audio fails is left silent, and not tried again", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const s = speaker(1, 1);
    classic.play([s], listener, CONFIG);
    audioFor(s)!.fire("error");
    expect(classic.playingIds).toEqual([]);
    classic.update([s], listener, CONFIG);
    expect(audioFor(s)).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("readies spare elements on Play for speakers heard later", () => {
    classic.play([], listener, CONFIG);
    expect(FakeAudio.made.length).toBeGreaterThanOrEqual(4);
  });

  it("a speaker the browser won't start untapped starts on the next tap", async () => {
    const s = speaker(1, 1);
    classic.update([s], listener, CONFIG);
    audioFor(s)!.refuse = true;
    classic.play([s], listener, CONFIG);
    await Promise.resolve();
    await Promise.resolve();
    expect(audioFor(s)!.paused).toBe(true);
    audioFor(s)!.refuse = false;
    window.dispatchEvent(new Event("touchend"));
    window.dispatchEvent(new Event("click"));
    expect(audioFor(s)!.paused).toBe(false);
  });

  it("in a -sync mode, keeps playing speakers on the clock", () => {
    const s = speaker(1, 1);
    classic.play([s], listener, { ...CONFIG, mode: "classic-sync" });
    const audio = audioFor(s)!;
    jest.advanceTimersByTime(2500);
    // Small drift: nudged; large: sought.
    audio.currentTime = 4.7; // 0.3 s behind at 5 s
    jest.advanceTimersByTime(2500);
    expect(audio.playbackRate).toBeGreaterThan(1);
    audio.currentTime = 20;
    jest.advanceTimersByTime(2500);
    expect(audio.currentTime).toBeCloseTo(7.5, 1);
    expect(audio.playbackRate).toBe(1);
  });
});
