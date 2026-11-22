/**
 * The few things the framework needs from where it runs, behind one small
 * interface: the audio engine, an audio element for streamed recordings,
 * permission to start audio, URL settings, and the navigator (location,
 * the user agent). Everything else in the framework is the same everywhere.
 *
 * The web platform (./webPlatform) is the default and is exactly what the
 * framework always did. A native app passes its own (./native) as
 * `platform` when it creates Roundware (server docs/039).
 */
import { IAudioContext, IAudioNode } from "standardized-audio-context";
import { webPlatform } from "./webPlatform";

/** What the framework uses of an HTMLAudioElement. */
export type MediaElementLike = Pick<
  HTMLAudioElement,
  | "src"
  | "currentTime"
  | "duration"
  | "paused"
  | "readyState"
  | "crossOrigin"
  | "loop"
  | "preload"
  | "play"
  | "pause"
  | "addEventListener"
  | "removeEventListener"
>;

/** What the framework uses of window.navigator. */
export type NavigatorLike = {
  geolocation: Geolocation;
  userAgent: string;
};

export interface RoundwarePlatform {
  name: string;
  /** The audio engine: one per mixer. */
  createAudioContext(): IAudioContext;
  /** An audio element for a recording or speaker, and the node that
   *  carries its sound into the audio graph. */
  createMediaElement(audioContext: IAudioContext): {
    element: HTMLAudioElement;
    source: IAudioNode<IAudioContext>;
  };
  /** Calls `onReady` once audio may play: on the web, after the listener's
   *  first tap (browsers block audio until then). */
  whenAudioAllowed(
    element: HTMLAudioElement,
    audioContext: IAudioContext,
    onReady: () => void
  ): void;
  /** A setting from the page's URL (debugging options); null when absent. */
  urlParam(name: string): string | null;
  navigator: NavigatorLike;
}

let current: RoundwarePlatform = webPlatform;

export const getPlatform = (): RoundwarePlatform => current;

/** Set before creating Roundware: the mixer's audio engine is made then. */
export const setPlatform = (platform: RoundwarePlatform) => {
  current = platform;
};
