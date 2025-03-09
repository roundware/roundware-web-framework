import { sample } from "lodash";
import { IAudioBuffer, IAudioContext } from "standardized-audio-context";
import { Logger } from "../helpers/Logger";
import { IMixParams } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { SpeakerPrefetchSyncPlayer } from "./players/SpeakerPrefetchSyncPlayer";
import { SpeakerTrack } from "./speaker_track";

import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { Point } from "geojson";
import centerOfMass from "@turf/center-of-mass";
import distance from "@turf/distance";
export class SpeakerEngine extends Logger {
  speakerTracks: SpeakerTrack[] | undefined;
  mixParams: IMixParams | undefined;
  playing: boolean = false;
  endedSpeakersLength: number = 0;
  listenerPoint: Point;

  constructor(
    speakers: ISpeakerData[],
    private audioContext: IAudioContext,
    mixParams: IMixParams
  ) {
    super();
    this.mixParams = mixParams;
    this.listenerPoint = mixParams?.listenerPoint!.geometry;
    this.endedSpeakersLength = 0;

    const that = this;

    this.speakerTracks = speakers.map(
      (speakerData) =>
        new SpeakerTrack({
          audioContext: that.audioContext,
          data: speakerData,
          config: mixParams.speakerConfig || {
            mode: "stream-sync",
            loop: false,
            loopFractions: [1],
          },
          speakerEngine: that,
        })
    );

    this.speakerTracks.forEach((s) =>
      s.player.onEnd(() => that.handleSpeakerEnd())
    );
    this.updateParams(this.playing, this.mixParams || {});
    console.debug("SpeakerEngine initialized");

    this.loopCallbackFunction = this.loopCallbackFunction.bind(this);
  }

  updateParams(playing: boolean, { listenerLocation, ...params }: IMixParams) {
    this.mixParams = { ...this.mixParams, ...params };
    this.playing = playing;
    if (
      params &&
      params.listenerPoint &&
      params.listenerPoint.geometry &&
      params.listenerPoint.geometry.coordinates
    ) {
      this.listenerPoint = params.listenerPoint.geometry;
    }
    this.log("Updating volumes due to location change");
    this.updateVolumeOnLocationChange();
  }

  updateVolumeOnLocationChange() {
    if (Array.isArray(this.speakerTracks)) {
      if (this.playing === false) {
        this.speakerTracks.forEach((t) => t.player.fadeOutAndPause());
        return;
      }

      // calculate volumes;
      this.calculateLocationBaseVolumes();

      this.speakerTracks.forEach((t) => {
        t.updateVolume();
      });
    }
  }

  loopListening: SpeakerTrack[] = [];

  removeAllLoopListeners() {
    this.loopListening.forEach((track) => {
      track.player.removeEventListener("loop", this.loopCallbackFunction);
    });
  }

  addLoopListener(track: SpeakerTrack) {
    track.player.addEventListener("loop", this.loopCallbackFunction);
    this.loopListening.push(track);
    this.log("Added new loop listener", track);
  }

  calculateLocationBaseVolumes() {
    const mode =
      this.mixParams?.speakerConfig?.mode.split("-").reverse()[0] || "";

    // test for basePlusMax${number}Random using regex
    if (new RegExp(/basePlusMax\d+Random/).test(mode)) {
      this.calculateLocationVolumeBasePlusMaxNRandom();
    } else {
      this.calculateLocationVolumeDefault();
    }
  }

  calculateLocationVolumeDefault() {
    this.speakerTracks?.forEach((t) => {
      t.calculatedVolume = t.volumeByLocation(this.listenerPoint);
    });
  }

  basePlusMaxNRandomList: (SpeakerTrack | null)[] = [];

  calculateLocationVolumeBasePlusMaxNRandom(max = this.getMax()) {
    if (!this.speakerTracks) return;
    // [0,1,2,3,4,5,6,7,8,9]
    this.speakerTracks?.forEach((t) => {
      t.calculatedVolume = t.volumeByLocation(this.listenerPoint);
    });

    const currentBaseSpeaker = SpeakerEngine.findBaseSpeaker(
      this.speakerTracks.filter((t) => t.calculatedVolume > 0),
      this.listenerPoint
    );

    const previousBaseSpeaker = this.basePlusMaxNRandomList[0];

    if (!currentBaseSpeaker) {
      this.basePlusMaxNRandomList = new Array(max).fill(null);
      // make rest zero;
      this.speakerTracks.forEach((t) => {
        t.calculatedVolume = 0;
      });

      this.logBasePlusMaxNRandom("No Base");
      this.removeAllLoopListeners();
    } else if (
      this.loopListening.length == 0 ||
      previousBaseSpeaker?.speakerId !== currentBaseSpeaker.speakerId
    ) {
      this.removeAllLoopListeners();

      this.basePlusMaxNRandomList = [
        currentBaseSpeaker,
        ...new Array(max - 1).fill(null),
      ];

      // make rest zero except base;
      this.speakerTracks.forEach((t) => {
        if (t.speakerId !== currentBaseSpeaker.speakerId) {
          t.calculatedVolume = 0;
        }
      });

      this.logBasePlusMaxNRandom("New Base");
      this.addLoopListener(currentBaseSpeaker);
    } else {
      this.logBasePlusMaxNRandom("Base Unchanged");
    }
  }

  getMax() {
    const mode =
      this.mixParams?.speakerConfig?.mode.split("-").reverse()[0] || "";

    if (new RegExp(/basePlusMax\d+Random/).test(mode)) {
      return parseInt(mode.match(/\d+/)![0]);
    }

    return 0;
  }

  loopCallbackFunction() {
    const mode =
      this.mixParams?.speakerConfig?.mode.split("-").reverse()[0] || "";
    this.log("Loop Callback", mode);

    if (new RegExp(/basePlusMax\d+Random/).test(mode)) {
      const loopPointUpdateProbability =
        this.mixParams?.speakerConfig?.loopPointUpdateProbability ?? 1;

      if (Math.random() >= loopPointUpdateProbability) {
        this.logBasePlusMaxNRandom("Skipping loop point update");
        return;
      }

      const max = this.getMax();

      this.logBasePlusMaxNRandom("Before");

      if (!Array.isArray(this.speakerTracks)) return;

      // modify lengths;
      if (Array.isArray(this.mixParams?.speakerConfig?.loopFractions)) {
        let available = this.speakerTracks
          .map((t) => {
            t.calculatedVolume = t.volumeByLocation(this.listenerPoint);
            return t;
          })
          .filter((t) => t.calculatedVolume > (t.minVolume || 0))
          .filter((t) => !this.basePlusMaxNRandomList.includes(t));

        const baseLoop = this.basePlusMaxNRandomList[0]?.player;

        if (!(baseLoop instanceof SpeakerPrefetchSyncPlayer)) {
          this.log("Base loop is of wrong type", baseLoop);
          return;
        }

        const baseLoopDuration = baseLoop.currentBuffer?.duration ?? 0;

        for (let i = 1; i < max; i++) {
          // should we even consider?
          const considerationProbability =
            this.mixParams?.speakerConfig?.slotConsiderationProbability ?? 0.5;

          if (Math.random() >= considerationProbability) {
            this.logBasePlusMaxNRandom("Skipping slot " + i);
            continue; // keep this slot as is;
          }

          // should replace with none?
          const replaceWithNoneProbability =
            this.mixParams?.speakerConfig?.replaceWithNoneProbability ?? 0.5;

          if (Math.random() >= replaceWithNoneProbability) {
            this.basePlusMaxNRandomList[i] = null;
            this.logBasePlusMaxNRandom("Replacing with none " + i);
            continue;
          }

          // need replace with another!
          if (available.length == 0) {
            continue; // nothing we can do;
          }

          const randomTrack = sample(available);
          if (randomTrack) {
            this.basePlusMaxNRandomList[i] = randomTrack;
            this.logBasePlusMaxNRandom(
              "Replacing with random " + i + " New:" + randomTrack.speakerId
            );
            if (randomTrack.player instanceof SpeakerPrefetchSyncPlayer) {
              const panPosition =
                this.mixParams.speakerConfig.effects?.pan?.[i] ?? 0;
              randomTrack.player.setPanPosition(panPosition);

              this.logBasePlusMaxNRandom(
                "Pan Position " + i + " " + panPosition
              );
              const loadedBuffer = randomTrack.player.getOriginalBuffer();

              if (!loadedBuffer) {
                this.log("Buffer not loaded yet", randomTrack.speakerId);
                continue;
              }

              const fraction =
                sample(this.mixParams.speakerConfig.loopFractions) ?? 1;

              this.logBasePlusMaxNRandom("Fraction " + i + " " + fraction);

              const effectsProcessor = new BufferEffectsProcessor(
                loadedBuffer,
                randomTrack.player.context,
                this.mixParams.speakerConfig.effects || {}
              );
              randomTrack.player.updateBufferAndPlayNow(
                effectsProcessor
                  .trim(0, baseLoopDuration * fraction)
                  .microFadeInAndOut()
                  .getBuffer()
              );
            }

            available = available.filter(
              (t) => t.speakerId !== randomTrack.speakerId
            );
          } else {
            this.log("No available track found for slot", i);
          }
        }

        // set all others to zero;
        this.speakerTracks.forEach((t) => {
          if (
            !this.basePlusMaxNRandomList.some(
              (lt) => lt?.speakerId === t.speakerId
            )
          ) {
            t.calculatedVolume = 0;
          }
        });
      }
      this.logBasePlusMaxNRandom("Final");
    }
    this.log("Updating volumes due to loop point");
    this.speakerTracks?.forEach((s) => s.updateVolume());
  }

  logBasePlusMaxNRandom(step: string) {
    this.log(
      "basePlusMaxNRandom ",
      step,
      this.basePlusMaxNRandomList.map((t) =>
        t
          ? {
              speakerId: t.speakerId,
            }
          : null
      )
    );
  }

  allSpeakersEndCallback = () => {};
  onAllSpeakersEnd(callback: () => void) {
    this.allSpeakersEndCallback = callback;
  }

  replay() {
    this.endedSpeakersLength = 0;
    const that = this;
    this.speakerTracks?.forEach((s) => {
      s.player.pause();
      s.player.replay();
      that.play();
    });
  }

  play() {
    this.speakerTracks?.forEach((s) => {
      s.player.timerStart();
      s.play();
    });
  }

  stop() {
    this.speakerTracks?.forEach((s) => {
      s.player.timerStop();
      s.pause();
    });
  }

  handleSpeakerEnd() {
    this.endedSpeakersLength += 1;
    console.log(
      `some speaker ended`,
      this.endedSpeakersLength,
      this.speakerTracks?.length
    );
    if (this.endedSpeakersLength == this.speakerTracks?.length) {
      this.allSpeakersEndCallback();
    }
  }

  static findBaseSpeaker(tracks: SpeakerTrack[], currentLocation: Point) {
    // which is base.
    const allIds = new Set(tracks.map((a) => a.speakerId));

    // find oldest ancestor
    const base = tracks
      .filter((node) =>
        node.speakerData?.parents?.every((parentId) => !allIds.has(parentId))
      )
      .sort((a, b) => {
        const centerOfMassA = centerOfMass(a.speakerData!.shape);
        const centerOfMassB = centerOfMass(b.speakerData!.shape);

        return (
          distance(currentLocation, centerOfMassA) -
          distance(currentLocation, centerOfMassB)
        );
      })[0];

    return base;
  }
}
