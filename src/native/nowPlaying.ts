/**
 * Lock-screen controls for listening (iOS's Now Playing; Android's media
 * notification): the project's name, and play and pause.
 *
 * Play also takes the audio back after an interruption that iOS wouldn't
 * resume on its own (Voice Memos, another app's audio): pressing play on the
 * lock screen is something iOS lets an app act on from the background, so the
 * listener needn't open the app (server docs/039, "Fifth test").
 *
 * The app passes react-native-audio-api's PlaybackNotificationManager, as it
 * passes the other native modules, so the framework has no React Native
 * dependency.
 */
import type { NativePlatform } from "./index";

type Subscription = { remove(): void };

/** The parts of react-native-audio-api's PlaybackNotificationManager used. */
export type PlaybackNotificationLike = {
  show(info: Record<string, unknown>): Promise<void>;
  hide(): Promise<void>;
  enableControl(control: string, enabled: boolean): Promise<void>;
  addEventListener(name: string, callback: (event: unknown) => void): Subscription;
};

export type NowPlayingInfo = { title: string; artist?: string; artwork?: string };

/** The mixer as seen from here: on or off. */
type MixerLike = { playing: boolean; toggle(play?: boolean): boolean };

export type NowPlaying = {
  /** Call after listening is started or stopped from the app's own screen. */
  refresh(): void;
  /** Takes the controls off the lock screen. */
  disconnect(): Promise<void>;
};

export function connectNowPlaying(
  notification: PlaybackNotificationLike,
  mixer: MixerLike,
  platform: NativePlatform,
  info: NowPlayingInfo,
  log: (message: string) => void = () => {}
): NowPlaying {
  // Playing only while the mix is on and the audio is ours.
  const playing = () => mixer.playing && !platform.audioInterrupted();
  const publish = () =>
    notification
      .show({ ...info, isLiveStream: true, state: playing() ? "playing" : "paused" })
      .catch((e) => log(`now playing failed: ${e instanceof Error ? e.message : e}`));

  // Roundware has no tracks to skip or position to seek.
  (async () => {
    await publish();
    for (const control of ["nextTrack", "previousTrack", "skipForward", "skipBackward", "seekTo"]) {
      await notification.enableControl(control, false).catch(() => {});
    }
  })();

  const subs: Subscription[] = [
    notification.addEventListener("playbackNotificationPlay", async () => {
      log("lock screen: play");
      if (platform.audioInterrupted()) await platform.resumeAudio("lock screen");
      if (!mixer.playing) mixer.toggle(true);
      publish();
    }),
    notification.addEventListener("playbackNotificationPause", () => {
      log("lock screen: pause");
      mixer.toggle(false);
      publish();
    }),
  ];
  const stopListening = platform.onAudioInterruption?.(() => publish());

  return {
    refresh: () => {
      publish();
    },
    disconnect: async () => {
      subs.forEach((s) => s.remove());
      stopListening?.();
      await notification.hide().catch(() => {});
    },
  };
}
