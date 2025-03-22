import centerOfMass from "@turf/center-of-mass";
import distance from "@turf/distance";
import { Feature, LineString, MultiPolygon, Point, Polygon } from "geojson";

import { ISpeakerData } from "../types/speaker";
import { SpeakerConfig } from "../types/roundware";

export class SpeakerUtils {
  static findBaseSpeaker(speakers: ISpeakerData[], currentLocation: Point) {
    // which is base.
    const allIds = new Set(speakers.map((a) => a.id));

    // find oldest ancestor
    const base = speakers
      .filter((node) =>
        (node?.parents ?? [])?.every((parentId) => !allIds.has(parentId))
      )
      .sort((a, b) => {
        const centerOfMassA = centerOfMass(a!.shape);
        const centerOfMassB = centerOfMass(b!.shape);

        return (
          distance(currentLocation, centerOfMassA) -
          distance(currentLocation, centerOfMassB)
        );
      })[0];

    return base;
  }

  static getLoadingStrategy(mode: SpeakerConfig["mode"]) {
    if (mode.startsWith(LoadingStrategy.PROGRESSIVE)) {
      return LoadingStrategy.PROGRESSIVE;
    }
    if (mode.startsWith(LoadingStrategy.PREFETCH)) {
      return LoadingStrategy.PREFETCH;
    }
    if (mode.startsWith(LoadingStrategy.STREAM)) {
      return LoadingStrategy.STREAM;
    }
    return LoadingStrategy.PROGRESSIVE;
  }

  static getMode(mode: SpeakerConfig["mode"]) {
    // Ensure mode is a string before using string methods
    if (typeof mode !== "string") {
      return {
        mode: PlayingMode.NORMAL,
        maxRandom: 0,
        sync: false,
      };
    }

    // match regex;
    // if string contains this keyword anyhwere: 'basePlusMaxNRandom' (N could be any number)
    // then return the number
    const match = mode
      .split("-")
      .reverse()[0]
      .match(/basePlusMax(\d+)Random/);
    if (match) {
      return {
        mode: PlayingMode.BASEPLUSMAXNRANDOM,
        maxRandom: parseInt(match[1]),
        sync: mode.includes("sync"),
      };
    }
    return {
      mode: PlayingMode.NORMAL,
      maxRandom: 0,
      sync: mode.includes("sync"),
    };
  }
}

export enum LoadingStrategy {
  PROGRESSIVE = "progressive",
  PREFETCH = "prefetch",
  STREAM = "stream",
}

export enum PlayingMode {
  BASEPLUSMAXNRANDOM = "basePlusMaxNRandom",
  NORMAL = "normal",
}
