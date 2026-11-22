/**
 * The browser: the framework's behaviour as it always was, moved behind the
 * platform interface (./platform). The default.
 */
import type { RoundwarePlatform } from "./platform";
import { buildAudioContext, getUrlParam, makeAudioSafeToPlay } from "./utils";

export const webPlatform: RoundwarePlatform = {
  name: "web",
  createAudioContext: () => buildAudioContext(),
  createMediaElement: (audioContext) => {
    const element = new Audio();
    return { element, source: audioContext.createMediaElementSource(element) };
  },
  whenAudioAllowed: (element, audioContext, onReady) =>
    makeAudioSafeToPlay(element, audioContext, onReady),
  urlParam: (name) => getUrlParam(window.location.toString(), name),
  get navigator() {
    return window.navigator;
  },
};
