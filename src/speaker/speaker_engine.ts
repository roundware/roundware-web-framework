import pointToPolygonDistance from "@turf/point-to-polygon-distance";
import { sample } from "lodash";
import { IAudioContext } from "standardized-audio-context";
import { EventEmitter } from "../event_emitter";
import { IMixParams, SpeakerConfig } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { FADE_IN_DURATION_SECONDS, isNearlyZero } from "../utils";
import { SpeakerTrack } from "./speaker_track";
import { LoadingStrategy, SpeakerUtils } from "./speaker_utils";

export class SpeakerEngine extends EventEmitter<{
  init: () => void;
  play: () => void;
  stop: () => void;
  updateParams: (params: IMixParams) => void;
  baseTrackStarted: () => void;
  loopPointReached: () => void;
  playingTracksUpdated: (playingTracks: (number | null)[]) => void;
  speakersNear: (speakers: { [key: number]: number }) => void;
  baseTrackChanged: () => void;
  skippingLoopPointUpdate: () => void;
  skippingSlot: () => void;
  replacingWithNone: (track: number | null) => void;
  stoppingInFuture: (remainingTime: number) => void;
  newSpeaker: (newSpeaker: SpeakerTrack) => void;
  speakersAvailable: (speakers: number[]) => void;
  repeatingTrack: (track: {
    trackId: number;
    exceededDuration: number;
    newTimes: number;
  }) => void;
  fadingOutLoop: (track: number) => void;
}> {
  mixParams: IMixParams = {};
  speakers: SpeakerTrack[] = [];
  audioContext: IAudioContext;
  playingTracks: (number | null)[] = [];

  group: Map<number, number | null> = new Map();

  constructor(
    speakersData: ISpeakerData[],
    audioContext: IAudioContext,
    config: SpeakerConfig
  ) {
    super();
    this.speakers = speakersData.map(
      (data) =>
        new SpeakerTrack({
          data,
          audioContext,
          config,
          groupId: SpeakerUtils.getRootForSpeaker(data, speakersData),
        })
    );
    this.audioContext = audioContext;
    this.emit("init");

    // prefetch all speakers
    if (this.loadingStrategy === LoadingStrategy.PREFETCH) {
      this.speakers.forEach((speaker) => {
        speaker.loadBuffer();
      });
    }

    const groups = new Map<number, Set<number>>();
    // log the groups;
    this.speakers.forEach((speaker) => {
      if (groups.has(speaker.groupId)) {
        groups.get(speaker.groupId)?.add(speaker.data.id);
      } else {
        groups.set(speaker.groupId, new Set([speaker.data.id]));
      }
    });

    console.debug(`Groups:`, Array.from(groups.entries()));

    // set the start times;
    groups.forEach((speakers, groupId) => {
      this.group.set(groupId, null);
    });
  }

  playing = false;
  public async play(): Promise<void> {
    console.log(this.loadingStrategy, this.mode);

    this.playing = true;

    if (this.loadingStrategy === LoadingStrategy.PREFETCH) {
      // prefech requires all speakers to be loaded
      if (!this.speakers.every((speaker) => speaker.buffer))
        throw new Error(
          `Prefetch strategy requires all speakers to be loaded before playing`
        );
    } else if (this.loadingStrategy === LoadingStrategy.PROGRESSIVE) {
      if (this.mode.maxRandom > 0) {
        this.onLocationUpdateProgressiveBasePlusMaxNRandom();
      }
    }

    this.emit("play");
  }

  public async stop(): Promise<void> {
    this.speakers.forEach((track) => {
      // cancel all loops and future processing
      track?.clearListeners("trackFinished");
      track?.clearListeners("trackAborted");
      if (track.bufferSourcePlaying) {
        track.abortBufferSource();
      }
    });
    this.playing = false;
    this.playingTracks = [];
    this.emit("stop");
  }

  updateParams(params: IMixParams) {
    this.mixParams = params;

    if (this.loadingStrategy === LoadingStrategy.PROGRESSIVE) {
      const newSpeakers: {
        [key: number]: number;
      }[] = [];
      // distance
      const minDistanceToLoad =
        this.mixParams.speakerConfig?.prefetchDistanceMeters || 0;

      this.speakers.forEach((speaker) => {
        const distance = pointToPolygonDistance(
          this.listenerPoint,
          speaker.data.shape!
        );

        if (distance < minDistanceToLoad) {
          // this.emit("speakerNear", {});
          newSpeakers.push({
            [speaker.data.id]: distance,
          });
          speaker.loadBuffer();
        } else {
          speaker.unload();
        }
      });

      this.emit(
        "speakersNear",
        newSpeakers.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      );

      if (this.mode.maxRandom > 0 && this.playing) {
        this.onLocationUpdateProgressiveBasePlusMaxNRandom();
      }
    }
  }

  onLocationUpdateProgressiveBasePlusMaxNRandom() {
    // find speakers to play;
    if (this.mode.maxRandom > 0) {
      this.calculateVolumesByLocation();

      const previousBaseTrack = this.currentBaseTrackId;
      const baseTrack = this.latestBaseTrack;

      this.playingTracks[0] = baseTrack?.data.id || null;
      this.emit(
        "playingTracksUpdated",
        this.playingTracks.map((t) => t ?? null)
      );
      if (previousBaseTrack != baseTrack?.data.id) {
        this.emit("baseTrackChanged");

        if (baseTrack) {
          // new base track selected
          if (!baseTrack?.buffer) {
            baseTrack?.loadBuffer();
            baseTrack?.on("loaded", () => {
              this.playAsBaseTrack(baseTrack, false);
            });
          } else {
            this.playAsBaseTrack(baseTrack, false);
          }
        }
        // rest stop playing for now;
        this.speakers.forEach((track) => {
          if (baseTrack && track.data.id === baseTrack?.data.id) return;
          this.clearEndListeners(track);
          if (track.bufferSourcePlaying) track.fadeOutAndStopBufferSource();
        });
      } else {
        // base track not changed;
        // just update by location based volume!;
        this.playingTracks.forEach((track) => {
          if (!track) return;
          const speaker = this.getSpeakerTrackById(track);
          if (!speaker) return;
          speaker.calculatedVolume = speaker.volumeByLocation(
            this.listenerPoint
          );
          speaker.fadeBufferSourceToVolume(speaker.calculatedVolume);
        });
      }
    }
  }

  playAsBaseTrack(track: SpeakerTrack, isContinued: boolean) {
    if (!isContinued) this.clearEndListeners(track); // previous listeners

    // too late to play (for ex. loading took time)
    if (!this.playing || this.currentBaseTrackId != track.data.id) {
      if (track.bufferSourcePlaying) track.fadeOutAndStopBufferSource();
      return;
    }

    if (!track.buffer) {
      throw new Error("Base track buffer not found");
    }

    const currentTime = this.audioContext.currentTime;

    const timeUntilNextLoop = SpeakerUtils.timeUntilClosestLoopPoint({
      currentTime,
      startTime: this.group.get(track.groupId) ?? currentTime,
      duration: track.buffer.duration,
    });

    let offset = track.buffer.duration - timeUntilNextLoop;

    if (isNearlyZero(offset, 0.015)) {
      offset = 0;
      if (this.group.get(track.groupId) === null) {
        this.group.set(track.groupId, currentTime);
      }
    }

    // playing the base track
    track.playWithConfig({
      duration: track.buffer.duration,
      offset,
      fadeInDuration: isContinued ? 0 : FADE_IN_DURATION_SECONDS,
      times: 1,
      pan: 0,
    });
    if (!isContinued) {
      track.on("trackFinished", this.onLoopPointBound);
    }
    this.emit("baseTrackStarted");
  }
  private onLoopPointBound = this.onLoopPoint.bind(this);
  onLoopPoint() {
    if (!this.playing) return;

    this.calculateVolumesByLocation();

    const latestBaseTrack = this.latestBaseTrack;
    const currentBaseTrackId = this.currentBaseTrackId;

    if (this.latestBaseTrack?.data.id != this.currentBaseTrackId) {
      if (currentBaseTrackId) {
        const currentBaseTrack = this.getSpeakerTrackById(currentBaseTrackId);
        currentBaseTrack.clearListeners("trackFinished");
        currentBaseTrack.clearListeners("trackAborted");
        if (currentBaseTrack.bufferSourcePlaying)
          currentBaseTrack.fadeOutAndStopBufferSource();
      }
      if (latestBaseTrack) this.playAsBaseTrack(latestBaseTrack, false);
      this.playingTracks = [latestBaseTrack?.data.id || null];
    } else if (currentBaseTrackId) {
      // continue with current base track;
      const currentBaseTrack = this.getSpeakerTrackById(currentBaseTrackId);
      this.playAsBaseTrack(currentBaseTrack, true);
    }

    this.updateNonBaseTracks();

    this.playingTracks.forEach((track) => {
      const speaker = track ? this.getSpeakerTrackById(track) : null;
      if (!speaker) return;
      speaker?.fadeBufferSourceToVolume(speaker.calculatedVolume);
    });

    this.speakers.forEach((speaker) => {
      if (this.playingTracks.some((t) => t === speaker.data.id)) return;
      this.clearEndListeners(speaker);
      if (speaker.volumeByLocation(this.listenerPoint) < speaker.minVolume) {
        if (speaker.bufferSourcePlaying) speaker.fadeOutAndStopBufferSource();
      }
    });

    this.emit("loopPointReached");
    this.emit(
      "playingTracksUpdated",
      this.playingTracks.map((t) => t ?? null)
    );
  }

  clearEndListeners(track: SpeakerTrack) {
    track.clearListeners("trackAborted");
    track.clearListeners("trackFinished");
  }

  updateNonBaseTracks() {
    // loopPointUpdateProbability; should ignore this call?
    const loopPointUpdateProbability =
      this.mixParams.speakerConfig?.loopPointUpdateProbability || 1;

    // return if should not update
    if (
      !SpeakerUtils.shouldDoSomethingWithProbability(
        loopPointUpdateProbability,
        "loop point update"
      )
    ) {
      this.emit("skippingLoopPointUpdate");

      const baseTrackId = this.playingTracks[0];
      const baseTrack = baseTrackId
        ? this.getSpeakerTrackById(baseTrackId)
        : null;
      const baseTrackDuration = baseTrack?.buffer?.duration;
      if (typeof baseTrackDuration === "number") {
        // repeat all the tracks;
        this.playingTracks.forEach((track) => {
          if (track === null) return;
          if (track === baseTrackId) return;
          const speaker = this.getSpeakerTrackById(track);
          this.repeatLoopOnLoopPoint(speaker);
        });
      }

      return;
    }

    let availableSpeakers = this.speakers
      .filter((speaker) => {
        return (
          speaker.calculatedVolume > speaker.minVolume &&
          !this.playingTracks.includes(speaker.data.id)
        );
      })
      .map((s) => s.data.id);

    for (let i = 1; i < this.mode.maxRandom; i++) {
      // slotConsiderationProbability
      const slotConsiderationProbability =
        this.mixParams.speakerConfig?.slotConsiderationProbability || 1;

      const speakerId = this.playingTracks[i];
      const speaker = speakerId ? this.getSpeakerTrackById(speakerId) : null;

      // return if should not update
      if (
        !SpeakerUtils.shouldDoSomethingWithProbability(
          slotConsiderationProbability,
          "slot consideration"
        )
      ) {
        this.emit("skippingSlot");

        // repeat the loop
        if (speaker) this.repeatLoopOnLoopPoint(speaker);

        continue;
      }

      // should replace with none?
      const replaceWithNoneProbability =
        this.mixParams.speakerConfig?.replaceWithNoneProbability || 0;

      if (
        SpeakerUtils.shouldDoSomethingWithProbability(
          replaceWithNoneProbability,
          "replace with none"
        )
      ) {
        this.emit("replacingWithNone", speaker?.data.id ?? null);
        // replace with none
        this.playingTracks[i] = null;

        // fade out!
        if (speaker) this.fadeOutLoopFromLoopPoint(speaker);

        continue;
      }

      // replace with new speaker
      const newSpeakerId = sample(availableSpeakers);

      const newSpeaker = this.speakers.find((s) => s.data.id === newSpeakerId);

      if (newSpeaker) {
        if (speaker) {
          speaker.clearListeners("trackFinished"); // will not loop when finished!
          this.fadeOutLoopFromLoopPoint(speaker);
        }

        this.playingTracks[i] = newSpeaker.data.id;
        this.emit("newSpeaker", newSpeaker);
        availableSpeakers = availableSpeakers.filter((s) => s !== newSpeakerId);
        // find a new random length;
        const lengths = this.mixParams.speakerConfig?.loopFractions ?? [1];
        const randomLength = sample(lengths);
        if (!randomLength) throw new Error(`Random length not found`);

        if (!this.playingTracks[0]) {
          throw new Error(`Base track not found`);
        }

        const baseTrack = this.getSpeakerTrackById(this.playingTracks[0]);
        if (!baseTrack?.buffer) throw new Error(`Base track buffer not found`);

        const baseTrackDuration = baseTrack.buffer.duration;
        const duration = baseTrackDuration * randomLength;

        const panPosition =
          this.mixParams.speakerConfig?.effects?.pan?.[i - 1] ?? 0;

        if (!newSpeaker.buffer) {
          let now = this.audioContext.currentTime;
          newSpeaker.on("loaded", () => {
            if (!this.playingTracks.some((t) => t === newSpeaker.data.id))
              return;
            // offset;
            const currentTime = this.audioContext.currentTime;
            const offset = currentTime - now;
            // playing delayed loaded speaker
            newSpeaker.playWithConfig({
              duration,
              offset,
              fadeInDuration: FADE_IN_DURATION_SECONDS,
              times: Math.ceil(baseTrackDuration / duration),
              pan: panPosition,
            });
          });
          newSpeaker.loadBuffer();
        }
        // playing the new speaker
        else
          newSpeaker.playWithConfig({
            duration,
            offset: 0,
            times: Math.ceil(baseTrackDuration / duration),
            fadeInDuration: FADE_IN_DURATION_SECONDS,
            pan: panPosition,
          });
      } else {
        this.playingTracks[i] = null;
      }
    }
  }

  fadeOutLoopFromLoopPoint(speaker: SpeakerTrack) {
    if (typeof speaker.loopConfig.pan !== "number") {
      throw new Error(`Speaker pan not found`);
    }

    if (typeof speaker.loopConfig.duration !== "number") {
      throw new Error(`Speaker duration not found`);
    }

    if (typeof speaker.loopConfig.times !== "number") {
      throw new Error(`Speaker times not found`);
    }

    this.emit("fadingOutLoop", speaker.data.id);

    // remaining duration;
    const remainingDuration = SpeakerUtils.findRemainingTime(
      this.audioContext.currentTime,
      speaker.startedAtContextTime,
      speaker.loopConfig.duration * speaker.loopConfig.times
    );

    const playedDuration =
      speaker.loopConfig.duration * speaker.loopConfig.times -
      remainingDuration;

    speaker.abortBufferSource();
    speaker.playWithConfig({
      duration: FADE_IN_DURATION_SECONDS,
      fadeInDuration: 0,
      offset: isNearlyZero(remainingDuration, 0.015) ? 0 : playedDuration,
      pan: speaker.loopConfig.pan,
      times: 1,
    });
    if (speaker.bufferSourcePlaying) speaker.fadeOutAndStopBufferSource();
  }

  repeatLoopOnLoopPoint(track: SpeakerTrack) {
    if (!this.playingTracks[0]) {
      throw new Error(`Base track not found`);
    }

    const baseTrack = this.getSpeakerTrackById(this.playingTracks[0]);
    if (!baseTrack) {
      throw new Error(`Base track not found`);
    }
    const baseTrackDuration = baseTrack?.buffer?.duration;
    if (typeof baseTrackDuration !== "number") {
      throw new Error(`Base track duration not found`);
    }

    if (typeof track.loopConfig.pan !== "number") {
      throw new Error(`Track pan not found`);
    }

    if (typeof track.loopConfig.duration !== "number") {
      throw new Error(`Track duration not found`);
    }

    if (typeof track.loopConfig.times !== "number") {
      throw new Error(`Track times not found`);
    }

    if (track.bufferSourcePlaying) track.abortBufferSource();

    // check if is odd duration;
    const isOddDuration = !isNearlyZero(
      baseTrackDuration % track.loopConfig.duration
    );
    if (isOddDuration) {
      const groupStartTime = this.group.get(track.groupId);

      if (groupStartTime === null || groupStartTime === undefined) {
        throw new Error(
          `Tried to repeat track who's group is not started yet!`
        );
      }

      const currentTime = this.audioContext.currentTime;

      let newTimes = 0;

      // duration exceeding at current loop point;
      let exceededDuration =
        (currentTime - groupStartTime) % track.loopConfig.duration;

      if (isNearlyZero(exceededDuration)) {
        exceededDuration = 0;
      }

      let calculatedCurrentTime = currentTime;

      if (exceededDuration > 0) {
        newTimes += 1;
        calculatedCurrentTime += exceededDuration;
      }

      let nextLoopPointAt = currentTime + baseTrackDuration;

      while (calculatedCurrentTime < nextLoopPointAt) {
        newTimes += 1;
        calculatedCurrentTime += track.loopConfig.duration;
      }

      this.emit("repeatingTrack", {
        trackId: track.data.id,
        exceededDuration,
        newTimes,
      });

      console.debug(track.data.id, {
        exceededDuration,
        newTimes,
        baseTrackDuration,
        trackDuration: track.loopConfig.duration,
        groupStartTime,
        currentTime,
        nextLoopPointAt,
        trackId: track.data.id,
      });

      track.playWithConfig({
        duration: track.loopConfig.duration,
        fadeInDuration: 0,
        offset: exceededDuration,
        pan: track.loopConfig.pan,
        times: newTimes,
      });
    } else {
      this.emit("repeatingTrack", {
        trackId: track.data.id,
        exceededDuration: 0,
        newTimes: track.loopConfig.times,
      });
      track.playWithConfig({
        duration: track.loopConfig.duration,
        offset: 0,
        fadeInDuration: 0,
        pan: track.loopConfig.pan,
        times: baseTrackDuration / track.loopConfig.duration,
      });
    }
  }

  calculateVolumesByLocation() {
    this.speakers.filter((speaker) => {
      speaker.calculatedVolume = speaker.volumeByLocation(this.listenerPoint);
      return speaker.calculatedVolume > speaker.minVolume;
    });
  }

  getSpeakerTrackById(id: number) {
    const found = this.speakers.find((s) => s.data.id === id);
    if (!found) throw new Error(`Speaker track not found: ${id}`);
    return found;
  }

  get latestBaseTrack() {
    this.calculateVolumesByLocation();
    // find speakers available in this region
    const availableSpeakers = this.speakers.filter((speaker) => {
      return speaker.calculatedVolume > speaker.minVolume;
    });

    this.emit(
      "speakersAvailable",
      availableSpeakers.map((s) => s.data.id)
    );

    // find base speaker
    const baseSpeaker = SpeakerUtils.findBaseSpeaker(
      availableSpeakers.map((s) => s.data),
      this.listenerPoint
    );

    // find base track
    const baseTrack = this.speakers.find(
      (track) => track.data.id === baseSpeaker?.id
    );
    return baseTrack;
  }

  get currentBaseTrackId() {
    return this.playingTracks[0];
  }

  // getters
  get listenerPoint() {
    const lP = this.mixParams.listenerPoint;
    if (!lP) throw new Error(`Listener Point missing in mixParams`);
    return lP.geometry;
  }

  get loadingStrategy() {
    return SpeakerUtils.getLoadingStrategy(
      this.mixParams.speakerConfig?.mode || "progressive-sync"
    );
  }

  get mode() {
    return SpeakerUtils.getMode(
      this.mixParams.speakerConfig?.mode ||
        "progressive-sync-basePlusMax5Random"
    );
  }

  toString() {
    return "Roundware Speaker Engine";
  }
}
