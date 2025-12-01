import pointToPolygonDistance from "@turf/point-to-polygon-distance";
import { sample } from "lodash";
import {
  IAudioBuffer,
  IAudioContext,
  IConvolverNode,
  IDelayNode,
  IGainNode,
} from "standardized-audio-context";
import { EventEmitter } from "../event_emitter";
import { EffectsConfig, IMixParams, SpeakerConfig } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { FADE_IN_DURATION_SECONDS, isNearlyZero } from "../utils";
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { SpeakerTrack } from "./speaker_track";
import { LoadingStrategy, SpeakerUtils } from "./speaker_utils";

const DEBUG_LOOP_SYNC = true; // Enable detailed loop sync debugging
const SYNC_DEBUG_PREFIX = "[SYNC_DEBUG]"; // Consistent prefix for all sync debugging

// Expose debug flag globally for SpeakerTrack access
if (typeof window !== "undefined") {
  (window as any).DEBUG_LOOP_SYNC = DEBUG_LOOP_SYNC;

  // Add method to toggle debug mode
  (window as any).toggleLoopSyncDebug = (enabled?: boolean) => {
    const currentValue = (window as any).DEBUG_LOOP_SYNC;
    const newValue = enabled !== undefined ? enabled : !currentValue;
    (window as any).DEBUG_LOOP_SYNC = newValue;
    console.log(
      `${SYNC_DEBUG_PREFIX} Loop sync debugging ${
        newValue ? "enabled" : "disabled"
      }`
    );
    return newValue;
  };

  // Add method to test debug output
  (window as any).testSyncDebug = () => {
    console.log(`${SYNC_DEBUG_PREFIX} TEST: Debug output is working!`);
    return true;
  };
}

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
  variantChanged: (speakerId: number, newUri: string) => void;
}> {
  mixParams: IMixParams = {};
  speakers: SpeakerTrack[] = [];
  audioContext: IAudioContext;
  playingTracks: (number | null)[] = [];

  // Track speakers that are currently fading out due to being out of range
  private fadingOutSpeakers: Set<number> = new Set();

  // Track consecutive low volume readings to prevent premature fade-outs
  private lowVolumeCounts: Map<number, number> = new Map();

  private timingCheckInterval: NodeJS.Timeout | null = null;
  private lastTimingCheck: number = 0;
  private driftHistory: number[] = [];
  private maxDriftHistory = 10;

  group: Map<number, number | null> = new Map();

  // Master mixer for centralized audio processing
  private masterGainNode: IGainNode<IAudioContext>;
  private masterDelayNode: IDelayNode<IAudioContext> | null = null;
  private masterFeedbackGainNode: IGainNode<IAudioContext> | null = null;
  private masterReverbNode: IConvolverNode<IAudioContext> | null = null;
  private masterDryGainNode: IGainNode<IAudioContext>;
  private masterWetGainNode: IGainNode<IAudioContext>;
  private masterEffectsSendNode: IGainNode<IAudioContext>;

  // Variant preprocessing for reduced loop point drift
  private variantPreprocessingTimers: Map<number, NodeJS.Timeout> = new Map();
  private preprocessedVariantBuffers: Map<number, IAudioBuffer> = new Map();
  private readonly VARIANT_PREPROCESSING_TIME = 0.05; // 50ms before loop point
  private readonly MICRO_FADE_DURATION = 0.05; // 50ms micro-fade

  constructor(
    speakersData: ISpeakerData[],
    audioContext: IAudioContext,
    config: SpeakerConfig
  ) {
    super();
    this.audioContext = audioContext;

    // Initialize master mixer first
    this.masterGainNode = this.audioContext.createGain();
    this.masterDryGainNode = this.audioContext.createGain();
    this.masterWetGainNode = this.audioContext.createGain();
    this.masterEffectsSendNode = this.audioContext.createGain();

    // Connect dry signal to master gain
    this.masterDryGainNode.connect(this.masterGainNode);

    // Connect wet signal to master gain
    this.masterWetGainNode.connect(this.masterGainNode);

    // Connect master gain to destination
    this.masterGainNode.connect(this.audioContext.destination);

    // Initialize effects if configured
    this.initializeMasterEffects(config.effects);

    // Set initial wet/dry ratio
    if (config.effects?.wetDryRatio !== undefined) {
      this.updateWetDryRatio(config.effects.wetDryRatio);
    }

    this.speakers = speakersData.map(
      (data) =>
        new SpeakerTrack({
          data,
          audioContext,
          config,
          groupId: SpeakerUtils.getRootForSpeaker(data, speakersData),
          masterMixerNode: this.masterDryGainNode,
          masterEffectsSendNode: this.masterEffectsSendNode,
        } as any)
    );

    this.emit("init");

    // Log that SpeakerEngine is initialized with debug info
    if (DEBUG_LOOP_SYNC) {
      console.log(
        `${SYNC_DEBUG_PREFIX} INIT: SpeakerEngine initialized with ${this.speakers.length} speakers`
      );
    }

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

  /**
   * Initialize master effects (delay, feedback, reverb) for centralized processing
   */
  private initializeMasterEffects(effects?: EffectsConfig) {
    if (!effects) return;

    console.log("🎵 Initializing master effects:", effects);

    // Create delay effect if configured (only if delayTimeInMs > 0)
    if (effects.delayTimeInMs && effects.delayTimeInMs > 0) {
      console.log("🎵 Creating delay effect:", {
        delayTime: effects.delayTimeInMs || 50,
        feedback: effects.feedback || 0.5,
      });

      this.masterDelayNode = this.audioContext.createDelay(1.0); // Max 1 second delay
      this.masterDelayNode.delayTime.value =
        (effects.delayTimeInMs || 50) / 1000;

      // Create feedback gain node
      this.masterFeedbackGainNode = this.audioContext.createGain();
      this.masterFeedbackGainNode.gain.value = effects.feedback || 0.5;

      // Connect delay with feedback loop
      this.masterDelayNode.connect(this.masterFeedbackGainNode);
      this.masterFeedbackGainNode.connect(this.masterDelayNode);

      // Connect effects send to delay input
      this.masterEffectsSendNode.connect(this.masterDelayNode);

      // Connect delay output to wet gain
      this.masterDelayNode.connect(this.masterWetGainNode);

      console.log("🎵 Delay effect connected");
    }

    // Create reverb effect if configured
    if (effects.wetDryRatio && effects.wetDryRatio > 0) {
      const wetDryRatio = effects.wetDryRatio;

      console.log("🎵 Creating reverb effect:", {
        wetDryRatio: wetDryRatio,
        reverbRoomSize: effects.reverbRoomSize || 0.5,
        reverbDamping: effects.reverbDamping || 0.5,
      });

      // Create reverb convolver node
      this.masterReverbNode = this.audioContext.createConvolver();
      this.masterReverbNode.buffer = this.createReverbImpulseResponse(
        effects.reverbRoomSize || 0.5,
        effects.reverbDamping || 0.5
      );

      // Connect effects send to reverb
      this.masterEffectsSendNode.connect(this.masterReverbNode);
      this.masterReverbNode.connect(this.masterWetGainNode);

      console.log("🎵 Reverb effect connected");
      console.log(
        "🎵 Reverb routing: EffectsSend -> Reverb -> WetGain -> MasterGain"
      );
    }
  }

  /**
   * Get the master mixer node that speakers should connect to
   */
  getMasterMixerNode(): IGainNode<IAudioContext> {
    return this.masterDryGainNode;
  }

  /**
   * Get the effects send node for speakers to connect to
   */
  getMasterEffectsSendNode(): IGainNode<IAudioContext> {
    return this.masterEffectsSendNode;
  }

  /**
   * Get the master delay node for speakers that need delay effects
   */
  getMasterDelayNode(): IDelayNode<IAudioContext> | null {
    return this.masterDelayNode;
  }

  /**
   * Get the master reverb node for speakers that need reverb effects
   */
  getMasterReverbNode(): IConvolverNode<IAudioContext> | null {
    return this.masterReverbNode;
  }

  /**
   * Update wet/dry ratio for reverb effect
   */
  updateWetDryRatio(wetDryRatio: number) {
    if (this.masterWetGainNode && this.masterDryGainNode) {
      this.masterWetGainNode.gain.value = wetDryRatio;
      this.masterDryGainNode.gain.value = 1 - wetDryRatio;
      console.log("🎵 Wet/Dry ratio updated:", {
        wetDryRatio,
        wetLevel: wetDryRatio,
        dryLevel: 1 - wetDryRatio,
      });
    }
  }

  /**
   * Create a reverb impulse response using algorithmic generation
   */
  private createReverbImpulseResponse(
    roomSize: number,
    damping: number
  ): IAudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = Math.floor(sampleRate * roomSize * 3); // 3 seconds max for more obvious reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    console.log("🎵 Creating reverb impulse response:", {
      roomSize,
      damping,
      length,
      sampleRate,
    });

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        // Generate white noise with higher amplitude for more obvious effect
        const noise = (Math.random() * 2 - 1) * 0.8;

        // Apply exponential decay with more dramatic curve
        const decay = Math.pow(1 - damping, i / length);

        // Apply room size scaling with more dramatic effect
        const roomScale = Math.pow(roomSize, 0.3);

        channelData[i] = noise * decay * roomScale;
      }
    }

    console.log("🎵 Reverb impulse response created with length:", length);
    return impulse;
  }

  playing = false;
  public async play(): Promise<void> {
    console.log(this.loadingStrategy, this.mode);

    this.playing = true;

    if (DEBUG_LOOP_SYNC) {
      console.log(
        `${SYNC_DEBUG_PREFIX} PLAY: Starting playback with ${this.speakers.length} speakers`
      );
    }

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

    // Start timing check for debugging
    if (DEBUG_LOOP_SYNC) {
      this.startTimingCheck();
    }
  }

  public async stop(): Promise<void> {
    this.speakers.forEach((track) => {
      // cancel all loops and future processing
      track?.clearListeners("trackFinished");
      track?.clearListeners("trackAborted");
      if (track.bufferSourcePlaying) {
        track.abortBufferSource();
      }
      // Clear variant preprocessing timers
      this.clearVariantPreprocessingTimer(track.data.id);
    });
    this.playing = false;
    this.playingTracks = [];
    this.stopTimingCheck();
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
            // attach a one-time loaded listener to avoid duplicate callbacks across frequent updates
            const onLoaded = () => {
              try {
                baseTrack?.off("loaded", onLoaded);
              } catch {}
              this.playAsBaseTrack(baseTrack, false);
            };
            baseTrack?.on("loaded", onLoaded);
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
    const groupStartTime = this.group.get(track.groupId) ?? currentTime;

    const timeUntilNextLoop = SpeakerUtils.timeUntilClosestLoopPoint({
      currentTime,
      startTime: groupStartTime,
      duration: track.buffer.duration,
    });

    let offset = track.buffer.duration - timeUntilNextLoop;

    if (DEBUG_LOOP_SYNC) {
      console.log(
        `${SYNC_DEBUG_PREFIX} PLAY_BASE_TRACK: Speaker ${
          track.data.id
        }, continued: ${isContinued}, currentTime: ${currentTime.toFixed(
          6
        )}s, groupStart: ${groupStartTime.toFixed(
          6
        )}s, duration: ${track.buffer.duration.toFixed(
          6
        )}s, timeUntilNext: ${timeUntilNextLoop.toFixed(6)}s, offset: ${(
          offset * 1000
        ).toFixed(2)}ms`
      );
    }

    if (isNearlyZero(offset, 0.015)) {
      offset = 0;
      if (this.group.get(track.groupId) === null) {
        this.group.set(track.groupId, currentTime);
        console.log(
          `🎵 SYNC: Setting group ${
            track.groupId
          } start time to ${currentTime.toFixed(3)}s`
        );
      }
    } else {
      // Check if offset is too large (more than half a loop duration)
      const maxAcceptableOffset = track.buffer.duration * 0.5;
      if (Math.abs(offset) > maxAcceptableOffset) {
        if (DEBUG_LOOP_SYNC) {
          console.log(
            `${SYNC_DEBUG_PREFIX} SYNC_RESET: Large offset detected ${(
              offset * 1000
            ).toFixed(2)}ms, resetting group start time`
          );
        }
        // Reset group start time to get back in sync
        this.group.set(track.groupId, currentTime);
        offset = 0;
      } else {
        console.log(
          `🎵 SYNC: Group ${track.groupId} offset: ${(offset * 1000).toFixed(
            1
          )}ms (not synced)`
        );
      }
    }

    // playing the base track
    track.playWithConfig({
      duration: track.buffer.duration,
      offset,
      fadeInDuration: isContinued ? 0 : FADE_IN_DURATION_SECONDS,
      times: 1,
      pan: 0,
      isNewSpeaker: false, // Base track is not a new speaker
    });
    if (!isContinued) {
      track.on("trackFinished", this.onLoopPointBound);
    }
    this.emit("baseTrackStarted");
  }
  private onLoopPointBound = this.onLoopPoint.bind(this);
  onLoopPoint() {
    if (!this.playing) return;

    const loopPointTime = this.audioContext.currentTime;

    if (DEBUG_LOOP_SYNC) {
      console.log(
        `${SYNC_DEBUG_PREFIX} LOOP_POINT: Starting loop point processing at ${loopPointTime.toFixed(
          6
        )}s`
      );

      // Log group timing information
      this.group.forEach((startTime, groupId) => {
        if (startTime !== null) {
          const timeSinceStart = loopPointTime - startTime;
          const baseTrackId = this.playingTracks[0];
          const baseTrack = baseTrackId
            ? this.getSpeakerTrackById(baseTrackId)
            : null;
          const baseDuration = baseTrack?.buffer?.duration;

          if (baseDuration) {
            const expectedLoopPoint =
              Math.floor(timeSinceStart / baseDuration) * baseDuration;
            const actualOffset = timeSinceStart - expectedLoopPoint;
            console.log(
              `${SYNC_DEBUG_PREFIX} GROUP_${groupId}: Start=${startTime.toFixed(
                6
              )}s, TimeSinceStart=${timeSinceStart.toFixed(
                6
              )}s, ExpectedLoop=${expectedLoopPoint.toFixed(6)}s, Offset=${(
                actualOffset * 1000
              ).toFixed(2)}ms`
            );
          }
        }
      });
    }

    this.calculateVolumesByLocation();

    const latestBaseTrack = this.latestBaseTrack;
    const currentBaseTrackId = this.currentBaseTrackId;

    if (this.latestBaseTrack?.data.id != this.currentBaseTrackId) {
      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} BASE_TRACK_CHANGE: Switching from ${currentBaseTrackId} to ${
            latestBaseTrack?.data.id
          } at ${loopPointTime.toFixed(6)}s`
        );
      }

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
      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} BASE_TRACK_CONTINUE: Continuing base track ${currentBaseTrackId} at ${loopPointTime.toFixed(
            6
          )}s`
        );
      }
      const currentBaseTrack = this.getSpeakerTrackById(currentBaseTrackId);
      this.playAsBaseTrack(currentBaseTrack, true);
    }

    this.updateNonBaseTracks();

    // Process variant switching for all playing tracks including base track
    this.playingTracks.forEach((track) => {
      const speaker = track ? this.getSpeakerTrackById(track) : null;
      if (!speaker) return;

      // Check for variant switching on all tracks
      const previousLoopCount = speaker.getVariantLoopCount();
      const previousVariantUri = speaker.getCurrentUri();
      speaker.incrementVariantLoopCount();

      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} VARIANT_CHECK: Speaker ${
            speaker.data.id
          } loop count: ${previousLoopCount} -> ${speaker.getVariantLoopCount()}, target: ${speaker.getVariantLoopTarget()}, current: ${previousVariantUri}`
        );
      }

      if (speaker.shouldSwitchVariant()) {
        const newVariantUri = speaker.selectNextVariant();

        if (DEBUG_LOOP_SYNC) {
          console.log(
            `${SYNC_DEBUG_PREFIX} VARIANT_SWITCH: Speaker ${
              speaker.data.id
            } switching from ${previousVariantUri} to ${newVariantUri} at ${loopPointTime.toFixed(
              6
            )}s`
          );
        }

        this.emit("variantChanged", speaker.data.id, newVariantUri);

        // Try to use preprocessed variant buffer first
        if (speaker.bufferSourcePlaying) {
          const preprocessedApplied = this.applyPreprocessedVariant(speaker);

          if (preprocessedApplied) {
            console.log(
              `🎵 VARIANT: Applied preprocessed buffer for speaker ${speaker.data.id}`
            );
          } else {
            console.log(
              `🎵 VARIANT: Fallback to old method for speaker ${speaker.data.id}`
            );
            // Fall back to current method if no preprocessed buffer available
            speaker.abortBufferSource();
            this.repeatLoopOnLoopPoint(speaker);
          }
        }
      }

      speaker?.fadeBufferSourceToVolume(speaker.calculatedVolume);

      // Schedule preprocessing for next potential variant switch
      if (speaker.getVariantUris().length > 0) {
        console.log(
          `🎵 VARIANT: Scheduling preprocessing for speaker ${speaker.data.id}`
        );
        this.scheduleVariantPreprocessing(speaker);
      }
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
    // First, ensure all available always-on speakers are playing
    this.ensureAlwaysOnSpeakersArePlaying();

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

    // Get all available speakers (not just unplayed ones)
    const allAvailableSpeakers = this.speakers
      .filter((speaker) => {
        return (
          speaker.calculatedVolume > speaker.minVolume &&
          !this.isAlwaysOnSpeaker(speaker.data.id) // exclude always-on speakers
        );
      })
      .map((s) => s.data.id);

    // Get speakers that are not currently playing (for new selections)
    const unplayedAvailableSpeakers = allAvailableSpeakers.filter(
      (id) => !this.playingTracks.includes(id)
    );

    for (let i = 1; i < this.mode.maxRandom; i++) {
      const speakerId = this.playingTracks[i];
      const speaker = speakerId ? this.getSpeakerTrackById(speakerId) : null;

      // Skip probabilistic logic for always-on speakers - they should always play when available
      if (speaker && this.isAlwaysOnSpeaker(speaker.data.id)) {
        // Check if always-on speaker is still in range
        if (speaker.calculatedVolume > speaker.minVolume) {
          // Just repeat the loop for always-on speakers that are still in range
          this.repeatLoopOnLoopPoint(speaker);
        } else {
          // Always-on speaker is out of range - start graceful fade-out
          if (!this.fadingOutSpeakers.has(speaker.data.id)) {
            if (DEBUG_LOOP_SYNC) {
              console.log(
                `${SYNC_DEBUG_PREFIX} SPEAKER_OUT_OF_RANGE: Always-on speaker ${
                  speaker.data.id
                } is out of range (volume: ${speaker.calculatedVolume.toFixed(
                  3
                )}, min: ${speaker.minVolume.toFixed(
                  3
                )}) - starting graceful fade-out`
              );
            }
            this.startGracefulFadeOut(speaker, i);
          }
        }
        continue;
      }

      // Check if we should rotate this specific speaker
      const speakerRotationProbability =
        this.mixParams.speakerConfig?.speakerRotationProbability || 0;
      const shouldRotate = SpeakerUtils.shouldDoSomethingWithProbability(
        speakerRotationProbability,
        "rotate speaker"
      );

      // Check if current speaker is still available
      // Always-on speakers should only be considered available if they're actually in range
      const isCurrentSpeakerStillAvailable =
        speaker && speaker.calculatedVolume > speaker.minVolume;

      // Debug logging for speaker availability
      if (speaker && DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} SPEAKER_AVAILABILITY: Speaker ${
            speaker.data.id
          } - volume: ${speaker.calculatedVolume.toFixed(
            3
          )}, min: ${speaker.minVolume.toFixed(
            3
          )}, available: ${isCurrentSpeakerStillAvailable}, shouldRotate: ${shouldRotate}`
        );
      }

      if (isCurrentSpeakerStillAvailable && !shouldRotate) {
        // Current speaker is still available and we're not rotating - just update its loop configuration
        // This prevents ping-pong effect while allowing fractional/random updates
        const lengths = this.mixParams.speakerConfig?.loopFractions ?? [1];
        const randomLength = sample(lengths);
        if (!randomLength) throw new Error(`Random length not found`);

        if (!this.playingTracks[0]) {
          throw new Error(`Base track not found`);
        }

        const baseTrack = this.getSpeakerTrackById(this.playingTracks[0]);
        if (!baseTrack?.buffer) throw new Error(`Base track buffer not found`);

        const baseTrackDuration = baseTrack.buffer.duration;
        const isReverse = randomLength < 0;
        const duration = baseTrackDuration * Math.abs(randomLength);
        const panPosition =
          this.mixParams.speakerConfig?.effects?.pan?.[i - 1] ?? 0;

        // Update the speaker with new loop configuration
        const calculatedTimes = Math.ceil(baseTrackDuration / duration);

        if (DEBUG_LOOP_SYNC) {
          console.log(
            `${SYNC_DEBUG_PREFIX} LOOP_CONFIG: Speaker ${
              speaker.data.id
            } - randomLength=${randomLength}, duration=${duration.toFixed(
              3
            )}s, baseDuration=${baseTrackDuration.toFixed(
              3
            )}s, times=${calculatedTimes}, isReverse=${isReverse}`
          );
        }

        speaker.playWithConfig({
          duration,
          offset: 0,
          times: calculatedTimes,
          fadeInDuration: 0, // No fade since it's continuing
          pan: panPosition,
          isReverse,
          isNewSpeaker: false, // This is a continuation, not a new speaker
        });
        continue;
      }

      // Current speaker is no longer available, doesn't exist, or we're rotating it - need to replace
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

        // repeat the loop if speaker exists
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

      // replace with new speaker - but only if there are unplayed speakers available
      if (unplayedAvailableSpeakers.length === 0) {
        // No unplayed speakers available - keep current speaker if it's still available
        if (speaker && speaker.calculatedVolume > speaker.minVolume) {
          this.repeatLoopOnLoopPoint(speaker);
        } else {
          // Current speaker is out of range and no replacements available - fade out gracefully
          if (speaker) {
            this.fadeOutLoopFromLoopPoint(speaker);
          }
          this.playingTracks[i] = null;
        }
        continue;
      }

      const newSpeakerId = sample(unplayedAvailableSpeakers);
      const newSpeaker = this.speakers.find((s) => s.data.id === newSpeakerId);

      if (newSpeaker) {
        if (speaker) {
          speaker.clearListeners("trackFinished"); // will not loop when finished!
          this.fadeOutLoopFromLoopPoint(speaker);
        }

        this.playingTracks[i] = newSpeaker.data.id;
        this.emit("newSpeaker", newSpeaker);

        // Remove from unplayed list
        const index = unplayedAvailableSpeakers.indexOf(newSpeakerId);
        if (index > -1) {
          unplayedAvailableSpeakers.splice(index, 1);
        }

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
        // Check if this is a reverse playback (negative fraction)
        const isReverse = randomLength < 0;
        const duration = baseTrackDuration * Math.abs(randomLength);

        const panPosition =
          this.mixParams.speakerConfig?.effects?.pan?.[i - 1] ?? 0;

        if (!newSpeaker.buffer) {
          let now = this.audioContext.currentTime;
          // attach a one-time loaded listener to avoid duplicate callbacks across frequent updates
          const onLoaded = () => {
            try {
              newSpeaker.off("loaded", onLoaded);
            } catch {}
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
              isReverse,
              isNewSpeaker: true,
            });
          };
          newSpeaker.on("loaded", onLoaded);
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
            isReverse,
            isNewSpeaker: true,
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
      isReverse: speaker.loopConfig.isReverse,
      isNewSpeaker: false, // This is a fade-out scenario, not a new speaker
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

    if (DEBUG_LOOP_SYNC) {
      console.log(
        `${SYNC_DEBUG_PREFIX} REPEAT_LOOP: Speaker ${
          track.data.id
        } repeating loop at ${this.audioContext.currentTime.toFixed(
          6
        )}s, baseDuration: ${baseTrackDuration.toFixed(6)}s`
      );
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
        isReverse: track.loopConfig.isReverse,
        isNewSpeaker: false, // This is a track repetition, not a new speaker
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
        isReverse: track.loopConfig.isReverse,
        isNewSpeaker: false, // This is a track repetition, not a new speaker
      });
    }
  }

  calculateVolumesByLocation() {
    this.speakers.filter((speaker) => {
      speaker.calculatedVolume = speaker.volumeByLocation(this.listenerPoint);
      return speaker.calculatedVolume > speaker.minVolume;
    });

    // Apply volume changes to all currently playing speakers
    // This ensures speakers fade out when listener moves away, even if they're not selected for updates
    this.playingTracks.forEach((trackId, index) => {
      if (trackId !== null) {
        const speaker = this.getSpeakerTrackById(trackId);
        if (speaker && speaker.bufferSourcePlaying) {
          // Reset low volume count if speaker volume is above minVolume
          if (speaker.calculatedVolume > speaker.minVolume) {
            this.lowVolumeCounts.delete(speaker.data.id);

            // Apply the new volume (only if not fading out)
            if (DEBUG_LOOP_SYNC) {
              console.log(
                `${SYNC_DEBUG_PREFIX} VOLUME_UPDATE: Speaker ${
                  speaker.data.id
                } volume updated to ${speaker.calculatedVolume.toFixed(3)}`
              );
            }
            speaker.fadeBufferSourceToVolume(speaker.calculatedVolume);
          } else if (
            speaker.calculatedVolume <= speaker.minVolume &&
            !this.fadingOutSpeakers.has(speaker.data.id)
          ) {
            // Increment low volume count
            const currentCount = this.lowVolumeCounts.get(speaker.data.id) || 0;
            const newCount = currentCount + 1;
            this.lowVolumeCounts.set(speaker.data.id, newCount);

            // Only start graceful fade-out after 3 consecutive low volume readings
            // This prevents premature fade-outs due to GPS accuracy issues
            if (newCount >= 3) {
              if (DEBUG_LOOP_SYNC) {
                console.log(
                  `${SYNC_DEBUG_PREFIX} SPEAKER_VOLUME_MIN: Speaker ${
                    speaker.data.id
                  } volume dropped to min for ${newCount} consecutive readings (${speaker.calculatedVolume.toFixed(
                    3
                  )}) - starting graceful fade-out`
                );
              }
              // Start graceful fade-out process
              this.startGracefulFadeOut(speaker, index);
            } else {
              if (DEBUG_LOOP_SYNC) {
                console.log(
                  `${SYNC_DEBUG_PREFIX} SPEAKER_VOLUME_LOW: Speaker ${
                    speaker.data.id
                  } volume low (${speaker.calculatedVolume.toFixed(
                    3
                  )}) - count: ${newCount}/3`
                );
              }
            }
          }
        }
      }
    });
  }

  getSpeakerTrackById(id: number) {
    const found = this.speakers.find((s) => s.data.id === id);
    if (!found) throw new Error(`Speaker track not found: ${id}`);
    return found;
  }

  /**
   * Start a graceful 4-second fade-out for a speaker that has gone out of range
   */
  private startGracefulFadeOut(speaker: SpeakerTrack, slotIndex: number) {
    // Mark speaker as fading out
    this.fadingOutSpeakers.add(speaker.data.id);

    // Start the fade-out process
    speaker.fadeOutAndStopBufferSource();

    // Set up cleanup after fade completes
    setTimeout(() => {
      // Remove from playing tracks and clean up
      this.playingTracks[slotIndex] = null;
      this.fadingOutSpeakers.delete(speaker.data.id);
      this.lowVolumeCounts.delete(speaker.data.id); // Clean up low volume count
      this.emit("replacingWithNone", speaker.data.id);

      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} SPEAKER_FADE_COMPLETE: Speaker ${speaker.data.id} fade-out completed - removed from playing tracks`
        );
      }
    }, 4000); // 4-second fade duration
  }

  /**
   * Check if a speaker is configured to always play when available
   */
  private isAlwaysOnSpeaker(speakerId: number): boolean {
    const alwaysOnSpeakers =
      this.mixParams.speakerConfig?.alwaysOnWhenAvailable || [];
    return alwaysOnSpeakers.includes(speakerId);
  }

  /**
   * Ensure all available always-on speakers are playing
   */
  private ensureAlwaysOnSpeakersArePlaying() {
    const alwaysOnSpeakers =
      this.mixParams.speakerConfig?.alwaysOnWhenAvailable || [];

    // Find available always-on speakers that are not currently playing
    const availableAlwaysOnSpeakers = this.speakers.filter((speaker) => {
      return (
        alwaysOnSpeakers.includes(speaker.data.id) &&
        speaker.calculatedVolume > speaker.minVolume &&
        !this.playingTracks.includes(speaker.data.id)
      );
    });

    // Add available always-on speakers to playing tracks
    for (const speaker of availableAlwaysOnSpeakers) {
      // Find an available slot (skip slot 0 which is for base track)
      let availableSlot = -1;
      for (let i = 1; i < this.mode.maxRandom; i++) {
        if (this.playingTracks[i] === null) {
          availableSlot = i;
          break;
        }
      }

      if (availableSlot !== -1) {
        this.playingTracks[availableSlot] = speaker.data.id;
        this.emit("newSpeaker", speaker);

        // Start playing the speaker
        if (!this.playingTracks[0]) {
          throw new Error(`Base track not found`);
        }

        const baseTrack = this.getSpeakerTrackById(this.playingTracks[0]);
        if (!baseTrack?.buffer) throw new Error(`Base track buffer not found`);

        const baseTrackDuration = baseTrack.buffer.duration;
        const lengths = this.mixParams.speakerConfig?.loopFractions ?? [1];
        const randomLength = sample(lengths);
        if (!randomLength) throw new Error(`Random length not found`);

        // Check if this is a reverse playback (negative fraction)
        const isReverse = randomLength < 0;
        const duration = baseTrackDuration * Math.abs(randomLength);
        const panPosition =
          this.mixParams.speakerConfig?.effects?.pan?.[availableSlot - 1] ?? 0;

        if (!speaker.buffer) {
          let now = this.audioContext.currentTime;
          const onLoaded = () => {
            try {
              speaker.off("loaded", onLoaded);
            } catch {}
            if (!this.playingTracks.some((t) => t === speaker.data.id)) return;
            const currentTime = this.audioContext.currentTime;
            const offset = currentTime - now;
            speaker.playWithConfig({
              duration,
              offset,
              fadeInDuration: FADE_IN_DURATION_SECONDS,
              times: Math.ceil(baseTrackDuration / duration),
              pan: panPosition,
              isReverse,
              isNewSpeaker: true,
            });
          };
          speaker.on("loaded", onLoaded);
          speaker.loadBuffer();
        } else {
          speaker.playWithConfig({
            duration,
            offset: 0,
            times: Math.ceil(baseTrackDuration / duration),
            fadeInDuration: FADE_IN_DURATION_SECONDS,
            pan: panPosition,
            isReverse,
            isNewSpeaker: true,
          });
        }
      }
    }
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

    // prioritize always-on speakers for base track selection
    const alwaysOnAvailable = availableSpeakers.filter((speaker) =>
      this.isAlwaysOnSpeaker(speaker.data.id)
    );

    let baseSpeaker;
    if (alwaysOnAvailable.length > 0) {
      // if there are always-on speakers available, use them for base track selection
      baseSpeaker = SpeakerUtils.findBaseSpeaker(
        alwaysOnAvailable.map((s) => s.data),
        this.listenerPoint
      );
    } else {
      // fall back to normal base speaker selection
      baseSpeaker = SpeakerUtils.findBaseSpeaker(
        availableSpeakers.map((s) => s.data),
        this.listenerPoint
      );
    }

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

  /**
   * Preprocess variant switching to reduce loop point drift
   * This method processes the new variant buffer 50ms before the loop point
   */
  private preprocessVariantSwitch(speaker: SpeakerTrack) {
    if (!speaker.shouldSwitchVariant()) {
      return; // No variant switch needed
    }

    const newVariantUri = speaker.selectNextVariant();
    const newVariantBuffer = speaker.getVariantBuffer(newVariantUri);

    if (!newVariantBuffer) {
      console.warn(
        `Variant buffer not found for ${newVariantUri}, falling back to current method`
      );
      return;
    }

    // Get current loop configuration
    const { duration, times, isReverse } = speaker.loopConfig;
    if (!duration || !times) {
      console.warn("Missing loop configuration for variant preprocessing");
      return;
    }

    // Process the new variant buffer with current configuration
    const effectsConfig = { ...speaker.config?.effects };
    if (speaker.getVariantUris().length > 0 && newVariantUri !== speaker.uri) {
      effectsConfig.microFadeInDurationInMs =
        speaker.config.variantCrossfadeDurationMs ?? 1000;
    }

    try {
      const processedBuffer = new BufferEffectsProcessor(
        newVariantBuffer,
        this.audioContext,
        effectsConfig
      )
        .composeBuffer({
          duration,
          times,
          fadeInDuration: 0, // No fade for preprocessing
          fadeInStartVolume: 1.0,
          isReverse,
        })
        .getBuffer();

      // Store the preprocessed buffer
      this.preprocessedVariantBuffers.set(speaker.data.id, processedBuffer);
      console.log(
        `🎵 VARIANT: Preprocessed buffer for speaker ${speaker.data.id} (${newVariantUri})`
      );

      // Schedule the micro-fade down to happen only 15ms before loop point
      this.scheduleMicroFadeDown(speaker);
    } catch (error) {
      console.error("Error preprocessing variant buffer:", error);
    }
  }

  /**
   * Schedule micro-fade down to happen 15ms before loop point
   */
  private scheduleMicroFadeDown(speaker: SpeakerTrack) {
    // Calculate time until next loop point
    const currentTime = this.audioContext.currentTime;
    const baseTrackId = this.playingTracks[0];
    const baseTrack = baseTrackId
      ? this.getSpeakerTrackById(baseTrackId)
      : null;

    if (!baseTrack?.buffer) {
      return; // No base track to sync with
    }

    const timeUntilNextLoop = SpeakerUtils.timeUntilClosestLoopPoint({
      currentTime,
      startTime: this.group.get(baseTrack.groupId) ?? currentTime,
      duration: baseTrack.buffer.duration,
    });

    // Schedule fade-down to start 15ms before loop point
    const fadeDownDelay = (timeUntilNextLoop - this.MICRO_FADE_DURATION) * 1000;

    if (fadeDownDelay > 0) {
      setTimeout(() => {
        this.startMicroFadeDown(speaker);
      }, fadeDownDelay);
    } else {
      // If we're too close to loop point, start fade immediately
      this.startMicroFadeDown(speaker);
    }
  }

  /**
   * Start micro-fade down of current variant before loop point
   */
  private startMicroFadeDown(speaker: SpeakerTrack) {
    if (!speaker.bufferSourcePlaying || !speaker.getGainNode()) {
      return;
    }

    const gainNode = speaker.getGainNode()!;
    const currentVolume = gainNode.gain.value;
    const targetVolume = 0.001; // Nearly zero

    // Schedule micro-fade down
    gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(currentVolume, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      this.audioContext.currentTime + this.MICRO_FADE_DURATION
    );
  }

  /**
   * Apply preprocessed variant buffer at loop point
   */
  private applyPreprocessedVariant(speaker: SpeakerTrack) {
    const preprocessedBuffer = this.preprocessedVariantBuffers.get(
      speaker.data.id
    );
    if (!preprocessedBuffer) {
      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} VARIANT_APPLY: No preprocessed buffer available for speaker ${speaker.data.id}`
        );
      }
      return false; // No preprocessed buffer available
    }

    if (DEBUG_LOOP_SYNC) {
      console.log(
        `${SYNC_DEBUG_PREFIX} VARIANT_APPLY: Applying preprocessed buffer for speaker ${
          speaker.data.id
        } at ${this.audioContext.currentTime.toFixed(6)}s`
      );
    }

    // Clear the preprocessed buffer
    this.preprocessedVariantBuffers.delete(speaker.data.id);

    // Abort current buffer source
    if (speaker.bufferSourcePlaying) {
      speaker.abortBufferSource();
    }

    // Create new buffer source with preprocessed buffer
    const newBufferSource = this.audioContext.createBufferSource();
    newBufferSource.buffer = preprocessedBuffer;
    newBufferSource.loop = false;
    speaker.setBufferSource(newBufferSource);

    // Reconnect audio graph
    const gainNode = speaker.getGainNode();
    if (gainNode) {
      newBufferSource.connect(gainNode);
    }

    // Start playback immediately
    const currentTime = this.audioContext.currentTime;
    newBufferSource.start(currentTime);
    speaker.bufferSourcePlaying = true;
    speaker.startedAtContextTime = currentTime;

    // Set up track finished handler
    newBufferSource.onended = () => {
      if (!newBufferSource || !newBufferSource.buffer) {
        throw new Error(
          "Previously playing source was not cleared before track ended"
        );
      }
      speaker.bufferSourcePlaying = false;
      const remainingTime = SpeakerUtils.findRemainingTime(
        this.audioContext.currentTime,
        speaker.startedAtContextTime,
        newBufferSource.buffer.duration
      );
      speaker.clearBufferSourcePublic();
      if (
        remainingTime <= 0.05 ||
        Math.abs(newBufferSource.buffer.duration - remainingTime) <= 0.05
      ) {
        speaker.emit("trackFinished");
      } else {
        speaker.emit("trackAborted", remainingTime);
      }
    };

    // Micro-fade up
    this.startMicroFadeUp(speaker);

    return true;
  }

  /**
   * Start micro-fade up of new variant after loop point
   */
  private startMicroFadeUp(speaker: SpeakerTrack) {
    const gainNode = speaker.getGainNode();
    if (!gainNode) {
      return;
    }

    const targetVolume = speaker.calculatedVolume;

    // Schedule micro-fade up
    gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      this.audioContext.currentTime + this.MICRO_FADE_DURATION
    );
  }

  /**
   * Schedule variant preprocessing for a speaker
   */
  private scheduleVariantPreprocessing(speaker: SpeakerTrack) {
    // Clear any existing timer
    this.clearVariantPreprocessingTimer(speaker.data.id);

    // Calculate time until next loop point
    const currentTime = this.audioContext.currentTime;
    const baseTrackId = this.playingTracks[0];
    const baseTrack = baseTrackId
      ? this.getSpeakerTrackById(baseTrackId)
      : null;

    if (!baseTrack?.buffer) {
      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} VARIANT_SCHEDULE: No base track buffer for speaker ${speaker.data.id}`
        );
      }
      return; // No base track to sync with
    }

    const timeUntilNextLoop = SpeakerUtils.timeUntilClosestLoopPoint({
      currentTime,
      startTime: this.group.get(baseTrack.groupId) ?? currentTime,
      duration: baseTrack.buffer.duration,
    });

    if (DEBUG_LOOP_SYNC) {
      console.log(
        `${SYNC_DEBUG_PREFIX} VARIANT_SCHEDULE: Speaker ${
          speaker.data.id
        }, timeUntilNext: ${timeUntilNextLoop.toFixed(
          6
        )}s, preprocessingTime: ${this.VARIANT_PREPROCESSING_TIME}s`
      );
    }

    // Only schedule if we have enough time for preprocessing
    if (timeUntilNextLoop > this.VARIANT_PREPROCESSING_TIME) {
      const preprocessingDelay =
        (timeUntilNextLoop - this.VARIANT_PREPROCESSING_TIME) * 1000;

      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} VARIANT_SCHEDULE: Scheduling preprocessing for speaker ${
            speaker.data.id
          } in ${preprocessingDelay.toFixed(1)}ms`
        );
      }

      const timer = setTimeout(() => {
        this.preprocessVariantSwitch(speaker);
        this.variantPreprocessingTimers.delete(speaker.data.id);
      }, preprocessingDelay);

      this.variantPreprocessingTimers.set(speaker.data.id, timer);
    } else {
      if (DEBUG_LOOP_SYNC) {
        console.log(
          `${SYNC_DEBUG_PREFIX} VARIANT_SCHEDULE: Not enough time for preprocessing speaker ${
            speaker.data.id
          } (${timeUntilNextLoop.toFixed(6)}s <= ${
            this.VARIANT_PREPROCESSING_TIME
          }s)`
        );
      }
    }
  }

  /**
   * Clear variant preprocessing timer for a speaker
   */
  private clearVariantPreprocessingTimer(speakerId: number) {
    const timer = this.variantPreprocessingTimers.get(speakerId);
    if (timer) {
      clearTimeout(timer);
      this.variantPreprocessingTimers.delete(speakerId);
    }
    // Also clear any preprocessed buffer
    this.preprocessedVariantBuffers.delete(speakerId);
  }

  /**
   * Start periodic timing check to detect audio context drift
   */
  private startTimingCheck() {
    this.stopTimingCheck();
    this.lastTimingCheck = this.audioContext.currentTime;

    this.timingCheckInterval = setInterval(() => {
      const currentTime = this.audioContext.currentTime;
      const expectedTime = this.lastTimingCheck + 0.1; // 100ms intervals
      const drift = currentTime - expectedTime;

      // Track drift history for analysis
      this.driftHistory.push(drift);
      if (this.driftHistory.length > this.maxDriftHistory) {
        this.driftHistory.shift();
      }

      if (Math.abs(drift) > 0.005) {
        // More than 5ms drift
        const avgDrift =
          this.driftHistory.reduce((a, b) => a + b, 0) /
          this.driftHistory.length;
        const maxDrift = Math.max(...this.driftHistory.map(Math.abs));
        const minDrift = Math.min(...this.driftHistory.map(Math.abs));

        console.log(
          `${SYNC_DEBUG_PREFIX} TIMING_DRIFT: Audio context drift detected: ${(
            drift * 1000
          ).toFixed(2)}ms at ${currentTime.toFixed(6)}s (avg: ${(
            avgDrift * 1000
          ).toFixed(2)}ms, max: ${(maxDrift * 1000).toFixed(2)}ms, min: ${(
            minDrift * 1000
          ).toFixed(2)}ms)`
        );

        // If we detect a large drift, it might indicate audio context issues
        if (Math.abs(drift) > 0.05) {
          // 50ms or more
          console.log(
            `${SYNC_DEBUG_PREFIX} TIMING_DRIFT: LARGE DRIFT DETECTED! This may indicate audio context suspension, browser tab switching, or system audio issues.`
          );
        }
      }

      this.lastTimingCheck = currentTime;
    }, 100);
  }

  /**
   * Stop timing check
   */
  private stopTimingCheck() {
    if (this.timingCheckInterval) {
      clearInterval(this.timingCheckInterval);
      this.timingCheckInterval = null;
    }
  }

  toString() {
    return "Roundware Speaker Engine";
  }
}
