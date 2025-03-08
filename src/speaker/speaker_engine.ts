import { sample } from "lodash";
import { IAudioBuffer, IAudioContext } from "standardized-audio-context";
import { Logger } from "../helpers/Logger";
import { IMixParams } from "../types/index";
import { ISpeakerData } from "../types/speaker";
import { SpeakerPrefetchSyncPlayer } from "./players/SpeakerPrefetchSyncPlayer";
import { SpeakerTrack } from "./speaker_track";
import { SpeakerVolumeProcessor } from "./speaker_volume_processor";
import { BufferEffectsProcessor } from "./buffer_effects_processor";
import { Point } from "geojson";
export class SpeakerEngine extends Logger {
  speakerTracks: SpeakerTrack[] | undefined;
  mixParams: IMixParams | undefined;
  playing: boolean = false;
  endedSpeakersLength: number = 0;
  listenerPoint: Point;

  volumeProcessor: SpeakerVolumeProcessor;

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
          },
          speakerEngine: that,
        })
    );

    this.speakerTracks.forEach((s) =>
      s.player.onEnd(() => that.handleSpeakerEnd())
    );
    this.updateParams(this.playing, this.mixParams || {});
    console.debug("SpeakerEngine initialized");
    this.volumeProcessor = new SpeakerVolumeProcessor(this.speakerTracks || []);

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
    this.updateVolumes();
  }

  updateVolumes() {
    if (Array.isArray(this.speakerTracks)) {
      if (this.playing === false) {
        this.speakerTracks.forEach((t) => t.player.fadeOutAndPause());
        return;
      }

      // calculate volumes;
      this.calculateVolumes();

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

  calculateVolumes() {
    const mode =
      this.mixParams?.speakerConfig?.mode.split("-").reverse()[0] || "";

    // test for basePlusMax${number}Random using regex
    if (new RegExp(/basePlusMax\d+Random/).test(mode)) {
      const max = parseInt(mode.match(/\d+/)![0]);

      // [0,1,2,3,4,5,6,7,8,9]
      const lastNoneRootHolded = this.volumeProcessor.holdList.slice(
        this.volumeProcessor.holdList.length - (max - 1)
      );

      this.volumeProcessor.log("Last non root holded", lastNoneRootHolded);

      this.volumeProcessor = this.volumeProcessor
        .clearHolds()
        .byLocation(this.listenerPoint)
        .holdMinVolumes()
        .holdRoot(this.listenerPoint);

      const selectedRoot =
        this.volumeProcessor.holdList[this.volumeProcessor.holdList.length - 1];

      if (!selectedRoot) {
        this.removeAllLoopListeners();
      } else if (
        this.loopListening.length == 0 ||
        !this.loopListening?.some((t) => t.speakerId === selectedRoot.speakerId)
      ) {
        this.removeAllLoopListeners();

        // so next time only nulls are replaces
        this.volumeProcessor.holdList.push(
          // max-1  null values for now.
          ...new Array(max - 1).fill(null)
        );

        this.addLoopListener(selectedRoot as SpeakerTrack);
      } else {
        // already listening to the selected speaker make sure all the volumes are as is last calculated.
        this.volumeProcessor.holdList.push(...lastNoneRootHolded);

        this.volumeProcessor = this.volumeProcessor.restToZero();
      }

      // default mode;
    } else {
      this.volumeProcessor.clearHolds().byLocation(this.listenerPoint);
      // all playing at location-based volume.
    }
  }

  loopCallbackFunction() {
    const mode =
      this.mixParams?.speakerConfig?.mode.split("-").reverse()[0] || "";
    this.log("Loop Callback", mode);
    this.volumeProcessor.logHoldlist();
    if (new RegExp(/basePlusMax\d+Random/).test(mode)) {
      const max = parseInt(mode.match(/\d+/)![0]);
      this.log("basePlusMax N Random");
      this.volumeProcessor.maxNRandom(
        max,
        this.listenerPoint,
        this.mixParams?.speakerConfig?.replaceWithNoneProbability || 0.3
      );

      // modify lengths;
      if (Array.isArray(this.mixParams?.speakerConfig?.lengths)) {
        // last (max) from hold list
        const lastN = this.volumeProcessor.holdList.slice(
          this.volumeProcessor.holdList.length - max
        ) as SpeakerTrack[];

        const base = lastN[0];

        for (let i = 0; i < lastN.length - 1; i++) {
          const speaker = lastN[i + 1];
          // get random length
          const randomLength = sample(this.mixParams?.speakerConfig?.lengths);
          this.log(`basePluxMaxNRandom ${i + 1} random length ${randomLength}`);
          if (speaker && typeof randomLength === "number") {
            if (
              speaker.player instanceof SpeakerPrefetchSyncPlayer &&
              base.player instanceof SpeakerPrefetchSyncPlayer
            ) {
              if (!base.player.originalBuffer) {
                throw new Error(
                  "Base player does not have its original buffer loaded"
                );
              }

              if (!speaker.player.originalBuffer) {
                throw new Error(
                  "Speaker player does not have its original buffer loaded"
                );
              }

              const newBuffer = new BufferEffectsProcessor(
                speaker.player.originalBuffer,
                this.audioContext,
                this.mixParams?.speakerConfig?.effects || {}
              )
                .trim(0, randomLength * base.player.originalBuffer.duration)
                .microFadeInAndOut()
                .delayAndClip()
                .getBuffer();

              speaker.player.updateBufferAndPlayNow(newBuffer);
              if (
                Array.isArray(this.mixParams.speakerConfig.effects?.pan) &&
                typeof this.mixParams.speakerConfig.effects.pan[i] === "number"
              ) {
                speaker.player.setPanPosition(
                  this.mixParams.speakerConfig.effects.pan[i]
                );
              }
            } else {
              throw new Error(
                "Speaker player is not instance of SpeakerPrefetchSyncPlayer"
              );
            }
          }
        }
      }
    }
    this.log("Updating volumes due to loop point");
    this.speakerTracks?.forEach((s) => s.updateVolume());
    this.volumeProcessor.logHoldlist();
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
}
