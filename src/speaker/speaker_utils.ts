import centerOfMass from "@turf/center-of-mass";
import distance from "@turf/distance";
import { Point } from "geojson";

import { SpeakerConfig } from "../types/roundware";
import { ISpeakerData } from "../types/speaker";

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

  static findRemainingTime(
    currentTime: number,
    startedAt: number,
    duration: number
  ) {
    const remainingTime = duration - (currentTime - startedAt);
    return remainingTime;
  }

  static shouldDoSomethingWithProbability(
    probability: number,
    taskName?: string
  ) {
    const random = Math.random();

    if (taskName) {
      console.debug(
        `${
          random < probability ? "✅" : "❌"
        } ${taskName} probability: ${random} < ${probability} `
      );
    }

    return random < probability;
  }

  static getRootForSpeaker(
    speaker: Pick<ISpeakerData, "id" | "parents">,
    speakers: Pick<ISpeakerData, "id" | "parents">[]
  ): ISpeakerData["id"] {
    const directParents = speaker.parents;

    // If no parents, return current speaker's ID
    if (!directParents || directParents.length === 0) {
      return speaker.id;
    }

    // Get the first parent speaker object
    const parentSpeaker = speakers.find((s) => s.id === directParents[0]);

    // If parent not found, return current speaker's ID
    if (!parentSpeaker) {
      return speaker.id;
    }

    // Recursively find the root of the parent
    return this.getRootForSpeaker(parentSpeaker, speakers);
  }

  static timeUntilClosestLoopPoint({
    currentTime,
    startTime,
    duration,
  }: {
    currentTime: number;
    startTime: number;
    duration: number;
  }) {
    // Calculate how much time has passed since the start
    const timeSinceStart = currentTime - startTime;

    // Calculate where we are within the current loop cycle
    const positionInLoop = timeSinceStart % duration;

    // The time until next loop point is the duration minus our position in the current loop
    const timeUntilNextLoop = duration - positionInLoop;

    // Debug logging for sync issues
    if (typeof window !== "undefined" && (window as any).DEBUG_LOOP_SYNC) {
      const expectedLoopPoint =
        Math.floor(timeSinceStart / duration) * duration;
      const actualOffset = timeSinceStart - expectedLoopPoint;
      console.log(
        `[SYNC_DEBUG] LOOP_CALC: currentTime=${currentTime.toFixed(
          6
        )}s, startTime=${startTime.toFixed(
          6
        )}s, timeSinceStart=${timeSinceStart.toFixed(
          6
        )}s, duration=${duration.toFixed(
          6
        )}s, positionInLoop=${positionInLoop.toFixed(
          6
        )}s, timeUntilNext=${timeUntilNextLoop.toFixed(
          6
        )}s, expectedLoop=${expectedLoopPoint.toFixed(6)}s, actualOffset=${(
          actualOffset * 1000
        ).toFixed(2)}ms`
      );
    }

    return timeUntilNextLoop;
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
