/**
 * The native platform (React Native, iOS and Android), for
 * `new Roundware({ platform, ... })` (src/platform.ts).
 *
 * The framework doesn't depend on any React Native package: the app passes
 * in the modules it already has (react-native-audio-api, expo-location,
 * expo-task-manager), so a web build never sees them.
 *
 *   import * as AudioAPI from "react-native-audio-api";
 *   import * as Location from "expo-location";
 *   import * as TaskManager from "expo-task-manager";
 *   import { createNativePlatform, defineLocationTask } from "roundware-web-framework/dist/native";
 *
 *   defineLocationTask(TaskManager); // at startup, before anything renders
 *   const platform = createNativePlatform({ audio: AudioAPI, Location });
 */
import type { IAudioContext, IAudioNode } from "standardized-audio-context";
import type { RoundwarePlatform } from "../platform";
import { NativeAudioElement } from "./NativeAudioElement";
import { createNativeGeolocation, LocationModule } from "./nativeGeolocation";

export { defineLocationTask, LOCATION_TASK } from "./nativeGeolocation";
export { NativeAudioElement } from "./NativeAudioElement";

type Subscription = { remove(): void };

/** The parts of react-native-audio-api used here. */
export type AudioModule = {
  AudioContext: new () => any;
  AudioManager: {
    setSystemOptions(options: Record<string, unknown>): void;
    setAudioSessionActivity(active: boolean): Promise<unknown>;
    observeAudioInterruptions(enabled: boolean): void;
    addSystemEventListener(
      name: "interruption",
      callback: (e: { type: "began" | "ended"; shouldResume: boolean }) => void
    ): Subscription;
  };
};

export type NativePlatformOptions = {
  audio: AudioModule;
  Location: LocationModule;
  /** Sent as the session's client system, e.g. "Roundware iOS 0.1.0". */
  userAgent?: string;
  /** Debug settings the web reads from its URL (rwfTimerSeconds, ...). */
  settings?: Record<string, string>;
  /** Where the platform reports audio interruptions; console by default. */
  log?: (message: string) => void;
};

export function createNativePlatform({
  audio,
  Location,
  userAgent = "Roundware native",
  settings = {},
  log = (m) => console.info(`[Roundware native] ${m}`),
}: NativePlatformOptions): RoundwarePlatform {
  const geolocation = createNativeGeolocation(Location);
  let interruption: Subscription | null = null;

  return {
    name: "native",

    createAudioContext() {
      // Playback that carries on with the phone locked.
      audio.AudioManager.setSystemOptions({ ios: { category: "playback", mode: "default", options: [] } });
      audio.AudioManager.setAudioSessionActivity(true).catch(() => {});
      const ctx = new audio.AudioContext();

      // A call, Siri or a notification sound interrupts the audio; resume
      // when iOS says we may. (While interrupted the audio clock stops.)
      audio.AudioManager.observeAudioInterruptions(true);
      interruption?.remove();
      interruption = audio.AudioManager.addSystemEventListener("interruption", async (e) => {
        log(`interruption ${e.type}${e.type === "ended" ? `, should resume ${e.shouldResume}` : ""}`);
        if (e.type !== "ended") return;
        try {
          await audio.AudioManager.setAudioSessionActivity(true);
          await ctx.resume();
          log(`resumed, audio ${ctx.state}`);
        } catch (err) {
          log(`resume failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
      return ctx as unknown as IAudioContext;
    },

    createMediaElement(audioContext) {
      const element = new NativeAudioElement(audioContext as any);
      return {
        element: element as unknown as HTMLAudioElement,
        source: element.output as IAudioNode<IAudioContext>,
      };
    },

    // Nothing to unlock: a native app may play once it's asked to.
    whenAudioAllowed: (_element, _ctx, onReady) => {
      setTimeout(onReady, 0);
    },

    urlParam: (name) => settings[name] ?? null,

    navigator: { geolocation, userAgent },
  };
}
