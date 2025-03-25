import { point } from "@turf/helpers";
import pointToPolygonDistance from "@turf/point-to-polygon-distance";
import { IAudioContext } from "standardized-audio-context";
import { IMixParams, SpeakerConfig } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { SpeakerTrack } from "./speaker_track";
import { LoadingStrategy, SpeakerUtils } from "./speaker_utils";
import { EventEmitter } from "../event_emitter";
import { random, sample } from "lodash";
import { FADE_IN_DURATION_SECONDS, isNearlyZero } from "../utils";

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
  replacingWithNone: () => void;
  stoppingInFuture: (remainingTime: number) => void;
  newSpeaker: (newSpeaker: SpeakerTrack) => void;
  speakersAvailable: (speakers: number[]) => void;
}> {
  mixParams: IMixParams = {};
  speakers: SpeakerTrack[] = [];
  audioContext: IAudioContext;
  playingTracks: (SpeakerTrack | null)[] = [];

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
      track?.abortBufferSource();
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

      const previousBaseTrack = this.currentBaseTrack;
      const baseTrack = this.latestBaseTrack;

      this.playingTracks[0] = baseTrack || null;
      this.emit(
        "playingTracksUpdated",
        this.playingTracks.map((t) => t?.data.id ?? null)
      );
      if (previousBaseTrack?.data?.id != baseTrack?.data?.id) {
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
          track.fadeOutAndStopBufferSource();
        });
      } else {
        // base track not changed;
        // just update by location based volume!;
        this.playingTracks.forEach((track) => {
          if (!track) return;
          track.calculatedVolume = track.volumeByLocation(this.listenerPoint);
          track.fadeBufferSourceToVolume(track.calculatedVolume);
        });
      }
    }
  }

  playAsBaseTrack(track: SpeakerTrack, isContinued: boolean) {

    this.clearEndListeners(track); // previous listeners

    // too late to play (for ex. loading took time)
    if (!this.playing || this.currentBaseTrack?.data.id != track.data.id) {
      
      track.fadeOutAndStopBufferSource();
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
      this.group.set(track.groupId, currentTime);
    }

       
  

    track.playForDuration({
      duration: track.buffer.duration,
      offset,
      fadeInDuration: isContinued ? 0 : FADE_IN_DURATION_SECONDS,
      times: 1,
      pan: 0,
    });
 
    track.on("trackFinished", this.onLoopPointBound);
    this.emit("baseTrackStarted");
  }
  private onLoopPointBound = this.onLoopPoint.bind(this);
  onLoopPoint() {
    if (!this.playing) return;

    this.calculateVolumesByLocation();

    const latestBaseTrack = this.latestBaseTrack;
    const currentBaseTrack = this.currentBaseTrack;

    if (this.latestBaseTrack?.data.id != this.currentBaseTrack?.data.id) {
      if (currentBaseTrack) {
        currentBaseTrack.clearListeners("trackFinished");
        currentBaseTrack.clearListeners("trackAborted");
        currentBaseTrack.fadeOutAndStopBufferSource();
      }
      if (latestBaseTrack) this.playAsBaseTrack(latestBaseTrack, false);
      this.playingTracks = [latestBaseTrack || null];
    } else if (currentBaseTrack) {
      // continue with current base track;
      this.playAsBaseTrack(currentBaseTrack, true);
    }

    this.recalculateNonBaseTracks();

    this.playingTracks.forEach((track) => {
      track?.fadeBufferSourceToVolume(track.calculatedVolume);
    });

    this.speakers.forEach((speaker) => {
      if (this.playingTracks.some((t) => t?.data.id === speaker.data.id))
        return;
      this.clearEndListeners(speaker);
      if (speaker.volumeByLocation(this.listenerPoint) < speaker.minVolume) {
        speaker.fadeOutAndStopBufferSource();
      }
    });

    this.emit("loopPointReached");
    this.emit(
      "playingTracksUpdated",
      this.playingTracks.map((t) => t?.data.id ?? null)
    );
  }

  clearEndListeners(track: SpeakerTrack) {
    track.clearListeners('trackAborted');
    track.clearListeners('trackFinished');
  }

  recalculateNonBaseTracks() {
   

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
      return;
    }

    let availableSpeakers = this.speakers.filter((speaker) => {
      return (
        speaker.calculatedVolume > speaker.minVolume &&
        !this.playingTracks.includes(speaker)
      );
    }).map(s => s.data.id);

    for (let i = 1; i < this.mode.maxRandom; i++) {

      

      // slotConsiderationProbability
      const slotConsiderationProbability =
        this.mixParams.speakerConfig?.slotConsiderationProbability || 1;

      // return if should not update

      if (
        !SpeakerUtils.shouldDoSomethingWithProbability(
          slotConsiderationProbability,
          "slot consideration"
        )
      ) {
        this.emit("skippingSlot");
        continue;
      }

      const speaker = this.playingTracks[i];

      // should replace with none?
      const replaceWithNoneProbability =
        this.mixParams.speakerConfig?.replaceWithNoneProbability || 0;

      if (
        SpeakerUtils.shouldDoSomethingWithProbability(
          replaceWithNoneProbability,
          "replace with none"
        )
      ) {
        this.emit("replacingWithNone");
        // replace with none
        this.playingTracks[i] = null;
        continue;
      }

      // replace with new speaker
      const newSpeakerId = sample(availableSpeakers);

      const newSpeaker = this.speakers.find(s => s.data.id === newSpeakerId);

      if (newSpeaker) {
        if (speaker) {
          speaker.clearListeners("trackFinished"); // will not loop when finished!
        }

        this.playingTracks[i] = newSpeaker;
        this.emit("newSpeaker", newSpeaker);
        availableSpeakers = availableSpeakers.filter(
          (s) => s !== newSpeakerId
        );
        // find a new random length;
        const lengths = this.mixParams.speakerConfig?.loopFractions ?? [1];
        const randomLength = sample(lengths);
        if (!randomLength) throw new Error(`Random length not found`);
        if (!this.playingTracks[0]?.buffer)
          throw new Error(`Base track buffer not found`);

        const baseTrackDuration = this.playingTracks[0].buffer.duration;
        const duration = baseTrackDuration * randomLength;

        const panPosition =
          this.mixParams.speakerConfig?.effects?.pan?.[i - 1] ?? 0;

        if (!newSpeaker.buffer) {
          let now = this.audioContext.currentTime;
          newSpeaker.on("loaded", () => {
            if (
              !this.playingTracks.some((t) => t?.data.id === newSpeaker.data.id)
            )
              return;
            // offset;
            const currentTime = this.audioContext.currentTime;
            const offset = currentTime - now;
            newSpeaker.playForDuration({
              duration,
              offset,
              fadeInDuration: FADE_IN_DURATION_SECONDS,
              times: Math.ceil(baseTrackDuration / duration),
              pan: panPosition,
            });
          });
          newSpeaker.loadBuffer();
        } else
          newSpeaker.playForDuration({
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
  calculateVolumesByLocation() {
    this.speakers.filter((speaker) => {
      speaker.calculatedVolume = speaker.volumeByLocation(this.listenerPoint);
      return speaker.calculatedVolume > speaker.minVolume;
    });
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

  get currentBaseTrack() {
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
