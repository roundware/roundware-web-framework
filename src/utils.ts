/* global require */

const { point } = require("@turf/helpers");
import { Point, Feature } from "@turf/helpers";
import { AudioContext, IAudioContext } from "standardized-audio-context";

const MATCHES_URI_SCHEME = new RegExp(/^https?:\/\//i);
const MATCHES_WAV_FILE = new RegExp(/\.wav$/i);

/**
 * @param  {string} url
 * @returns Cleaned URL
 */
export const cleanAudioURL = (url: string): string =>
  url.replace(MATCHES_URI_SCHEME, "//").replace(MATCHES_WAV_FILE, ".mp3");
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
  // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
  return point([+longitude, +latitude]); // NOTE we need to reverse the order here to make geolocations compatible with Roundware geometries, which have points listed w/ longitude first
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

const UNLOCK_AUDIO_EVENTS: ["touchstart", "touchend", "mousedown", "keydown"] =
  ["touchstart", "touchend", "mousedown", "keydown"];

/** Helps stabilize WebAudio startup
 @thanks https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos */
function unlockAudioContext(
  body: Window[`document`][`body`],
  audioCtx: IAudioContext
) {
  if (audioCtx.state !== "suspended") return;

  function unlock() {
    audioCtx.resume().then(clean);
  }
  function clean() {
    UNLOCK_AUDIO_EVENTS.forEach((e) => body.removeEventListener(e, unlock));
  }

  UNLOCK_AUDIO_EVENTS.forEach((e) => body.addEventListener(e, unlock, false));
}

export function buildAudioContext(windowScope: Window): IAudioContext {
  const audioContext = new AudioContext();
  const {
    document: { body },
  } = windowScope;
  unlockAudioContext(body, audioContext);

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
    `color: #000000; background: #ffeb3b`
  );

export const playlistTrackLog = (message: string) =>
  console.log(`%c\t[Track: ${message}]`, `color: #ffffff; background: #673ab7`);
