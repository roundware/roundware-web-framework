import { point } from "@turf/helpers";
import pointToPolygonDistance from "@turf/point-to-polygon-distance";
import { IAudioContext } from "standardized-audio-context";
import { IMixParams, SpeakerConfig } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { SpeakerTrack } from "./speaker_track";
import { LoadingStrategy, SpeakerUtils } from "./speaker_utils";
import { EventEmitter } from "../event_emitter";
import { random, sample } from "lodash";

export class SpeakerEngine extends EventEmitter<{
  init: () => void;
  play: () => void;
  stop: () => void;
  updateParams: (params: IMixParams) => void;
  baseTrackStarted: () => void;
  loopPointReached: () => void;
  playingTracksUpdated: () => void;
  speakerNear: (distance: number) => void;
  baseTrackChanged: () => void;
}> {
  mixParams: IMixParams = {};
  speakers: SpeakerTrack[] = [];
  audioContext: IAudioContext;
  playingTracks: (SpeakerTrack | null)[] = [];

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
    this.playingTracks.forEach((track) => {
      track?.off("baseTrackEnded", this.onLoopPointBound);
      track?.stopUrgently();
    });
    this.playing = false;
    this.emit("stop");
  }

  updateParams(params: IMixParams) {
    this.mixParams = params;

    if (this.loadingStrategy === LoadingStrategy.PROGRESSIVE) {
      // distance
      const minDistanceToLoad =
        this.mixParams.speakerConfig?.prefetchDistanceMeters || 0;

      this.speakers.forEach((speaker) => {
        const distance = pointToPolygonDistance(
          this.listenerPoint,
          speaker.data.shape!
        );

        if (distance < minDistanceToLoad) {
          this.emit("speakerNear", distance);
          speaker.loadBuffer();
        } else {
          speaker.unload();
        }
      });

      if (this.mode.maxRandom > 0 && this.playing) {
        this.onLocationUpdateProgressiveBasePlusMaxNRandom();
      }
    }
  }

  onLocationUpdateProgressiveBasePlusMaxNRandom() {
    // find speakers to play;
    if (this.mode.maxRandom > 0) {
      this.calculateVolumesByLocation();
      const baseTrack = this.latestBaseTrack;

      const previousBaseTrack = this.currentBaseTrack;

      this.playingTracks[0] = baseTrack || null;

      if (previousBaseTrack?.data.id !== baseTrack?.data.id) {
        this.emit("baseTrackChanged");

        // new base track selected
        if (!baseTrack?.buffer) {
          baseTrack?.loadBuffer();
          baseTrack?.on("loaded", () => {
            this.playAsBaseTrack(baseTrack);
          });
        } else {
          this.playAsBaseTrack(baseTrack);
        }
        // rest stop playing for now;
        this.speakers.forEach((track) => {
          if (track.data.id === baseTrack?.data.id) return;
          track.off("baseTrackEnded", this.onLoopPointBound);
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

  playAsBaseTrack(track: SpeakerTrack) {
    // too late to play (for ex. loading took time)
    if (!this.playing || this.currentBaseTrack?.data.id !== track.data.id) {
      track.off("baseTrackEnded", this.onLoopPointBound);
      track.fadeOutAndStopBufferSource();
      return;
    }

    track.playAsBaseTrack();
    if (!track.bufferSource) {
      throw new Error("Buffer Source not available for setting up loop point");
    }
    track.on("baseTrackEnded", this.onLoopPointBound);
    this.emit("baseTrackStarted");
  }
  private onLoopPointBound = this.onLoopPoint.bind(this);
  onLoopPoint() {
    if (!this.playing) return;

    this.calculateVolumesByLocation();

    const latestBaseTrack = this.latestBaseTrack;
    const currentBaseTrack = this.currentBaseTrack;

    if (this.latestBaseTrack?.data.id !== this.currentBaseTrack?.data.id) {
      if (currentBaseTrack) {
        currentBaseTrack.off("baseTrackEnded", this.onLoopPointBound);
        currentBaseTrack.fadeOutAndStopBufferSource();
      }
      if (latestBaseTrack) this.playAsBaseTrack(latestBaseTrack);
      this.playingTracks = [latestBaseTrack || null];
      this.emit("playingTracksUpdated");
    } else if (currentBaseTrack) {
      // continue with current base track;
      this.playAsBaseTrack(currentBaseTrack);
    }

    this.recalculateNonBaseTracks();

    this.playingTracks.forEach((track) => {
      track?.fadeBufferSourceToVolume(track.calculatedVolume);
    });

    this.speakers.forEach((speaker) => {
      speaker.off("baseTrackEnded", this.onLoopPointBound);
      speaker.fadeOutAndStopBufferSource();
    });

    this.emit("loopPointReached");
  }

  recalculateNonBaseTracks() {
    let availableSpeakers = this.speakers.filter((speaker) => {
      return (
        speaker.calculatedVolume > speaker.minVolume &&
        !this.playingTracks.includes(speaker)
      );
    });

    // loopPointUpdateProbability; should ignore this call?
    const loopPointUpdateProbability =
      this.mixParams.speakerConfig?.loopPointUpdateProbability || 1;

    // return if should not update
    if (Math.random() < loopPointUpdateProbability) return;

    for (let i = 1; i < this.playingTracks.length; i++) {
      // slotConsiderationProbability
      const slotConsiderationProbability =
        this.mixParams.speakerConfig?.slotConsiderationProbability || 1;

      // return if should not update
      if (Math.random() > slotConsiderationProbability) return;

      const speaker = this.playingTracks[i];

      // should replace with none?
      const replaceWithNoneProbability =
        this.mixParams.speakerConfig?.replaceWithNoneProbability || 0;
      if (Math.random() < replaceWithNoneProbability) {
        // replace with none
        this.playingTracks[i] = null;
        if (speaker && speaker.buffer) {
          const remainingTime = SpeakerUtils.findRemainingTime(this.audioContext.currentTime, 
            speaker.startedAtContextTime,
            speaker.buffer.duration
          );
          if (remainingTime > 0.01) {
            setTimeout(() => {
              speaker.fadeOutAndStopBufferSource();
            }, remainingTime * 1000);
          } else speaker.fadeOutAndStopBufferSource();
        }
        return;
      }

      // replace with new speaker
      const newSpeaker = sample(availableSpeakers);

      if (newSpeaker) {
        if (speaker && speaker.buffer) {
          const remainingTime = SpeakerUtils.findRemainingTime(this.audioContext.currentTime, 
            speaker.startedAtContextTime,
            speaker.buffer.duration
          );
          if (remainingTime > 0.01) {
            setTimeout(() => {
              speaker.fadeOutAndStopBufferSource();
            }, remainingTime * 1000);
          } else speaker.fadeOutAndStopBufferSource();
        }

        this.playingTracks[i] = newSpeaker;
        availableSpeakers = availableSpeakers.filter(
          (s) => s.data.id !== newSpeaker.data.id
        );
        // find a new random length;
        const lengths = this.mixParams.speakerConfig?.loopFractions ?? [1];
        const randomLength = sample(lengths);
        if (!randomLength) throw new Error(`Random length not found`);
        if (!this.playingTracks[0]?.buffer)
          throw new Error(`Base track buffer not found`);
        const duration = this.playingTracks[0].buffer.duration * randomLength;
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
            newSpeaker.playWithDuration(duration, offset);
          });
          newSpeaker.loadBuffer();
        } else newSpeaker.playWithDuration(duration);
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
    // find speakers available in this region
    const availableSpeakers = this.speakers.filter((speaker) => {
      return speaker.calculatedVolume > speaker.minVolume;
    });

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
