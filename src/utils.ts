/* global require */

const { point } = require("@turf/helpers");
import { Point, Feature } from "@turf/helpers";
import { AudioContext, IAudioContext } from "standardized-audio-context";
import { silenceAudioBase64 } from "./playlistAudioTrack";
const MATCHES_URI_SCHEME = new RegExp(/^https?:\/\//i);
const MATCHES_WAV_FILE = new RegExp(/\.wav$/i);
export const isIos = () => {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};
/**
 * @param  {string} url
 * @returns Cleaned URL
 */
export const cleanAudioURL = (
  url: string,
  useM4AforIos: boolean = false
): string => {
  let cleanUrl = url.replace(MATCHES_URI_SCHEME, "//");

  if (useM4AforIos) {
    if (isIos()) {
      return cleanUrl.substring(0, cleanUrl.lastIndexOf(".")) + ".m4a";
    }
  }
  return cleanUrl.replace(MATCHES_WAV_FILE, ".mp3");
};

/**
 *
 * Makes sure coordinates are in range of +180 to -180.
 * @param {number[]} coordinates
 */
const normalizeCoords = (coordinates: number[]) => {
  for (let i = 0; i <= coordinates.length; i++) {
    if (coordinates[i] > 180) coordinates[i] = (coordinates[i] % 180) - 180;
    else if (coordinates[i] < -180)
      coordinates[i] = (coordinates[i] % 180) + 180;
  }
  return coordinates;
};

/**
 * @param  {number} {latitude
 * @param  {number} longitude
 * @returns Feature<Point>
 */
export function coordsToPoints({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Feature<Point> {
  // shreyas - we need make sure coordinate lies within range of 180 to -180
  return point(normalizeCoords([+longitude, +latitude])); // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
}

// @see https://stackoverflow.com/a/24403771/308448
export const isEmpty = (array: any[]): boolean => !array || array.length < 1;

// @see https://eslint.org/docs/rules/no-prototype-builtins
export const hasOwnProperty = (target: unknown, propName: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(target, propName);

// @see https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_minby-and-_maxby //const makeSelect = (comparator) => (a,b) => comparator(a,b) ? a : b;
//export const minValue = makeSelect((a,b) => a <= b);
//const minByValue = makeSelect((a, b) => a.value <= b.value)
//const maxByValue = makeSelect((a, b) => a.value >= b.value)

// @see https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_random
export const random = (a: number = 1, b: number = 0): number => {
  const lower = Math.min(a, b);
  const upper = Math.max(a, b);

  return lower + Math.random() * (upper - lower);
};

export const randomInt = (a = 1, b = 0) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export const UNLOCK_AUDIO_EVENTS = [
  "touchend",
  "mouseup",
  "mousedown",
  "keydown",
  "keyup",
  "touchstart",
];

/** Helps stabilize WebAudio startup
 @thanks https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos */
function unlockAudioContext(
  body: Window[`document`][`body`],
  audioCtx: AudioContext
) {
  if (audioCtx.state !== "suspended") return;

  function unlock() {
    audioCtx.resume();
  }

  UNLOCK_AUDIO_EVENTS.forEach((e) =>
    body.addEventListener(e, unlock, { once: true })
  );
}

export function buildAudioContext(windowScope: Window): IAudioContext {
  const audioContext = new AudioContext();
  const {
    document: { body },
  } = windowScope;
  unlockAudioContext(body, audioContext);
  audioContext.onstatechange = () =>
    console.info(`[Audio Context]: ${audioContext.state}`);
  return audioContext;
}

export const timestamp = {
  toString: (time = new Date()) => {
    const hour = time.getHours().toString().padStart(2, "0");
    const mins = time.getMinutes().toString().padStart(2, "0");
    const secs = time.getSeconds().toString().padStart(2, "0");

    return [hour, mins, secs].join(":");
  },
};

export const getUrlParam = (urlStr: string, paramName: string): string => {
  const url = new URL(urlStr);
  const params = new URLSearchParams(url.search);
  return params.get(paramName) as string;
};

export const NO_OP = () => {};

export const debugLogger = (message: string) => {
  console.log(`%c\nDebug Info\n\t>${message}`, "color: red");
};

export const speakerLog = (message: string) =>
  console.log(
    `%c\t[Speaker: ${message}]`,
    `color: #000000; background: #f6ff9a`
  );

export const playlistTrackLog = (message: string) =>
  console.log(`%c\t[Track: ${message}]`, `color: #000000; background: #9cffff`);

export const makeAudioSafeToPlay = (
  audioElement: HTMLAudioElement,
  onSuccess: () => void = () => {},
  expectedSourceAfter?: string
) => {
  UNLOCK_AUDIO_EVENTS.forEach((e) => {
    window.addEventListener(
      e,
      () => {
        audioElement.src = silenceAudioBase64;
        try {
          audioElement.play().catch((e) => {
            audioElement.src = expectedSourceAfter || silenceAudioBase64;
            console.error(`failed to make safe`, e, expectedSourceAfter);
            onSuccess();
          });
          audioElement.addEventListener(
            "playing",
            () => {
              audioElement.pause();
              audioElement.currentTime = 0;
              if (expectedSourceAfter) {
                audioElement.src = expectedSourceAfter;
              }
              console.log(`safe to play later`, expectedSourceAfter);
              onSuccess();
            },
            {
              once: true,
            }
          );
        } catch (e) {
          audioElement.src = expectedSourceAfter || silenceAudioBase64;
          console.error(`failed to make safe`, e);
          onSuccess();
        }
      },
      { once: true }
    );
  });
};
