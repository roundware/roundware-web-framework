import { Point } from "@turf/helpers";
import { clone, random, sample, shuffle } from "lodash";
import { Logger } from "../helpers/Logger";
import { ISpeakerData } from "../types/speaker";
import { SpeakerTrack } from "./speaker_track";

export type VPTrack = Pick<
  SpeakerTrack,
  "calculatedVolume" | "speakerId" | "volumeByLocation" | "minVolume"
> & {
  speakerData?: Pick<ISpeakerData, "parents">;
};

export class SpeakerVolumeProcessor extends Logger {
  tracks: VPTrack[] = [];
  holdList: (VPTrack | null)[] = [];

  constructor(_tracks: VPTrack[]) {
    super();
    this.tracks = _tracks;
  }

  getAvailableTracks() {
    const available = this.tracks.filter(
      (t) => !this.holdList.some((h) => h?.speakerId === t.speakerId)
    );
    return available;
  }

  clearHolds() {
    this.holdList = [];
    return this;
  }

  byLocation(listenerPoint: Point) {
    this.getAvailableTracks().forEach((track) => {
      track.calculatedVolume = track.volumeByLocation(listenerPoint);
      // don't exceed values over 1.0
      if (track.calculatedVolume > 1) track.calculatedVolume = 1;
      return track.calculatedVolume;
    });

    return this;
  }

  holdMinVolumes() {
    this.holdList.push(
      ...this.getAvailableTracks().filter(
        (t) => t.calculatedVolume === t.minVolume
      )
    );

    return this;
  }

  holdRoot() {
    // which is base.
    const allIds = new Set(this.getAvailableTracks().map((a) => a.speakerId));

    // find oldest ancestor
    const base = this.getAvailableTracks()
      .filter((node) =>
        node.speakerData?.parents?.every((parentId) => !allIds.has(parentId))
      )
      .sort((a, b) => a.calculatedVolume - b.calculatedVolume)[0];

    if (!base) return this;

    this.log(`Chosen base:`, base.speakerId);

    this.holdList.push(base);

    return this;
  }

  holdTrack(track: VPTrack | null) {
    if (!track) {
      this.holdList.push(null);
    } else {
      const available = this.getAvailableTracks().find(
        (t) => t.speakerId === track.speakerId
      );
      if (available) {
        this.holdList.push(available);
      } else {
        // check if it's already in holdList
        if (this.holdList.some((t) => t?.speakerId === track.speakerId)) {
          this.warn("Track was already holded", track.speakerId);
          return this;
        }
      }
    }
    return this;
  }

  maxNRandom(
    max: number,
    locationPoint: Point,
    replaceWithNoneProbability = 0.3
  ) {
    this.byLocation(locationPoint); // restore previously zeroed volumes;

    let available = clone(this.getAvailableTracks());

    // remove all of (max - 1) slots, and shuffle them;
    let lastNSlots = this.holdList.splice(
      this.holdList.length - (max - 1),
      max - 1
    );

    // shuffle them, so now even if we replace them sequentially, it will be random.
    lastNSlots = shuffle(lastNSlots);

    // determine how many to replace
    const amountToReplace = random(1, max - 3);

    this.log(
      "Candidates to replace",
      lastNSlots.map((s) => s?.speakerId ?? null)
    );
    this.log("Amount to replace:", amountToReplace);

    for (let i = 0; i < amountToReplace; i++) {
      // remove previous 1 slot
      lastNSlots.shift();

      // new slot;
      // 70% of times, select random new audible track
      if (Math.random() > replaceWithNoneProbability) {
        const randomTrack = sample(available); // available is already excluding previous slots.
        if (randomTrack) {
          lastNSlots.push(randomTrack);
          available = available.filter(
            (t) => t.speakerId !== randomTrack.speakerId
          );
        } else lastNSlots.push(null);
      } else {
        // 30% of times, None is playing.
        lastNSlots.push(null);
      }
    }

    this.holdList.push(...lastNSlots);

    this.log(
      "Max N Random:",
      this.holdList
        .slice(this.holdList.length - max)
        .map((t) => t?.speakerId ?? null)
    );

    this.restToZero();
  }

  // all other available to zero;
  restToZero() {
    this.getAvailableTracks().forEach((t) => (t.calculatedVolume = 0));
    return this;
  }

  findRoot(tracks: VPTrack[]) {
    // which is base.
    const allIds = new Set(tracks.map((a) => a.speakerId));

    // find oldest ancestor
    const base = tracks
      .filter((node) =>
        node.speakerData?.parents?.every((parentId) => !allIds.has(parentId))
      )
      .sort((a, b) => a.calculatedVolume - b.calculatedVolume)[0];

    return base;
  }

  logHoldlist() {
    this.log(
      "Hold List:",
      this.holdList.map((t) => t?.speakerId ?? null)
    );
  }
}
