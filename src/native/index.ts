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
 *   // Streaming needs the library's file source, which it doesn't export:
 *   import { AudioFileSourceNode } from "react-native-audio-api/lib/module/Audio/AudioFileSourceNode";
 *   const platform = createNativePlatform({ audio: { ...AudioAPI, AudioFileSourceNode }, Location });
 */
import type { IAudioContext, IAudioNode } from "standardized-audio-context";
import type { RoundwarePlatform } from "../platform";
import { FileSourceNodeClass, NativeAudioElement } from "./NativeAudioElement";
import { createNativeGeolocation, LocationModule } from "./nativeGeolocation";

export { defineLocationTask, LOCATION_TASK } from "./nativeGeolocation";
export { NativeAudioElement, nativeAudioStatus } from "./NativeAudioElement";

type Subscription = { remove(): void };

/** The parts of react-native-audio-api used here. */
export type AudioModule = {
  AudioContext: new () => any;
  /** For streaming (built with FFmpeg); without it, files are decoded whole. */
  AudioFileSourceNode?: FileSourceNodeClass;
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
  /** A file's address → the file on the device, downloaded first if need
   *  be (docs/039). Without it, files stream straight from the server, and
   *  opening one holds the app's JavaScript until the server answers. */
  fetchMedia?: (url: string) => Promise<string>;
  /** React Native's AppState: after an interruption iOS may not let the
   *  audio resume on its own, so it resumes when the app is next opened. */
  AppState?: {
    addEventListener(type: "change", listener: (state: string) => void): Subscription;
  };
  /** Where the platform reports audio interruptions; console by default. */
  log?: (message: string) => void;
};

export type NativePlatform = RoundwarePlatform & {
  /** True while the system has the audio (from "began" until "resumed"). */
  audioInterrupted(): boolean;
};

export function createNativePlatform({
  audio,
  Location,
  userAgent = "Roundware native",
  settings = {},
  fetchMedia,
  AppState,
  log = (m) => console.info(`[Roundware native] ${m}`),
}: NativePlatformOptions): NativePlatform {
  const geolocation = createNativeGeolocation(Location);
  let interruption: Subscription | null = null;
  let appState: Subscription | null = null;
  let interrupted = false;
  const listeners = new Set<(event: "began" | "resumed") => void>();
  const tell = (event: "began" | "resumed") =>
    listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (e) {
        console.error("[Roundware native] interruption listener failed", e);
      }
    });

  return {
    name: "native",

    createAudioContext() {
      // Playback that carries on with the phone locked.
      audio.AudioManager.setSystemOptions({ ios: { category: "playback", mode: "default", options: [] } });
      audio.AudioManager.setAudioSessionActivity(true).catch(() => {});
      const ctx = new audio.AudioContext();

      // A call, Siri or another app's audio takes the audio away; the audio
      // clock stops, and the mixer pauses (onAudioInterruption) so nothing
      // is used up unheard. It resumes when iOS says it may, or else when the
      // app is next opened: iOS won't let it start again from the background
      // after, say, Voice Memos, which says not to resume.
      const resume = async (why: string) => {
        try {
          await audio.AudioManager.setAudioSessionActivity(true);
          await ctx.resume();
          interrupted = false;
          log(`resumed (${why}), audio ${ctx.state}`);
          tell("resumed");
        } catch (err) {
          log(`resume failed (${why}): ${err instanceof Error ? err.message : String(err)}; will resume when the app is opened`);
        }
      };
      audio.AudioManager.observeAudioInterruptions(true);
      interruption?.remove();
      appState?.remove();
      interrupted = false;
      interruption = audio.AudioManager.addSystemEventListener("interruption", (e) => {
        log(`interruption ${e.type}${e.type === "ended" ? `, should resume ${e.shouldResume}` : ""}`);
        if (e.type === "began") {
          if (interrupted) return;
          interrupted = true;
          tell("began");
        } else if (interrupted && e.shouldResume) {
          resume("iOS said to");
        } else if (interrupted) {
          log("waiting for the app to be opened to resume");
        }
      });
      appState =
        AppState?.addEventListener("change", (state) => {
          if (state === "active" && interrupted && ctx.state !== "closed") resume("app opened");
        }) ?? null;
      return ctx as unknown as IAudioContext;
    },

    createMediaElement(audioContext) {
      const element = new NativeAudioElement(audioContext as any, {
        FileSourceNode: audio.AudioFileSourceNode,
        fetchFile: fetchMedia,
        log,
      });
      return {
        element: element as unknown as HTMLAudioElement,
        source: element.output as IAudioNode<IAudioContext>,
      };
    },

    // Nothing to unlock: a native app may play once it's asked to.
    whenAudioAllowed: (_element, _ctx, onReady) => {
      setTimeout(onReady, 0);
    },

    onAudioInterruption(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    audioInterrupted: () => interrupted,

    urlParam: (name) => settings[name] ?? null,

    navigator: { geolocation, userAgent },
  };
}
