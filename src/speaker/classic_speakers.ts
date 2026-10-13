import pointToPolygonDistance from "@turf/point-to-polygon-distance";
import { Point } from "geojson";
import { IAudioContext, IGainNode } from "standardized-audio-context";
import { SpeakerConfig } from "../types/roundware";
import { silenceAudioBase64, UNLOCK_AUDIO_EVENTS } from "../utils";
import { SpeakerTrack } from "./speaker_track";

/** Below this a speaker is silent, and isn't played. */
const AUDIBLE = 0.001;
/** Seconds for a speaker to fade in when first heard, to follow the
 *  listener's movement, and to fade out when left behind. */
const FADE_IN_S = 2;
const VOLUME_RAMP_S = 1;
const FADE_OUT_S = 3;
/** A speaker's stream starts loading this far (meters) before it's heard. */
const WARM_UP_METERS = 30;
/** Audio elements started on Play, ready for speakers heard later: a phone
 *  only lets an element play unprompted once a tap has started it. */
const SPARE_VOICES = 4;
/** In a "-sync" mode, drift beyond this (seconds) is a seek, not a nudge. */
const SEEK_DRIFT_S = 1;
const MAX_NUDGE = 0.1;

/** One audio element, lent to whichever speaker is near. */
class Voice {
  speaker: SpeakerTrack | null = null;
  /** Playing, or fading in; false once fading out. */
  sounding = false;
  /** To be lent to another speaker once faded out. */
  releasing = false;
  /** The browser refused to play it without a tap; tried again on one. */
  blocked = false;
  unlocked = false;
  target = 0;
  timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public audio: HTMLAudioElement,
    public gain: IGainNode<IAudioContext>
  ) {}
}

/**
 * Classic Roundware speakers, as in v2: every speaker the listener can hear
 * plays its whole recording on a loop, louder nearer (SpeakerTrack's
 * volumeByLocation), mixed together. Each is streamed through an audio
 * element, so a 20-minute speaker never sits decoded in memory, and only
 * speakers near the listener are loaded.
 *
 * Speakers keep one clock, the listening time: walking into a speaker joins
 * it where it would be had it played since Play, as v2's did. A "-sync" mode
 * also keeps them on that clock while they play (v2's sync option).
 *
 * The SpeakerEngine uses this for any mode without basePlusMaxNRandom
 * ("classic", and v2's "stream", "prefetch" and their "-sync" forms).
 */
export class ClassicSpeakers {
  playing = false;
  private voices: Voice[] = [];
  private failed = new Set<number>();
  private listenedBefore = 0;
  private playStartedAt: number | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private waitingForTap = false;

  constructor(
    private audioContext: IAudioContext,
    private outputs: IGainNode<IAudioContext>[],
    private onPlayingChanged: (speakerIds: number[]) => void
  ) {}

  /** Seconds listened, the speakers' shared clock. */
  get elapsed() {
    const now =
      this.playStartedAt == null ? 0 : (Date.now() - this.playStartedAt) / 1000;
    return this.listenedBefore + now;
  }

  get playingIds() {
    return this.voices
      .filter((v) => v.sounding && v.speaker)
      .map((v) => v.speaker!.data.id);
  }

  /** On each location update: start, follow and stop speakers. */
  update(speakers: SpeakerTrack[], listener: Point, config: SpeakerConfig) {
    const before = this.playingIds.join();
    const warmUp = Math.max(config.prefetchDistanceMeters ?? 0, WARM_UP_METERS);

    for (const speaker of speakers) {
      const id = speaker.data.id;
      const volume = speaker.volumeByLocation(listener);
      speaker.calculatedVolume = volume;
      let voice = this.voiceFor(id);
      if (this.failed.has(id)) continue;

      const audible = volume > AUDIBLE;
      if (!audible && this.metersAway(speaker, listener) >= warmUp) {
        if (voice) this.release(voice);
        continue;
      }
      voice ??= this.assign(speaker, config);
      if (!this.playing) continue;
      if (audible) this.sound(voice, volume);
      else this.silence(voice);
    }

    // Speakers no longer in the list (deactivated, deleted)
    for (const voice of this.voices) {
      if (voice.speaker && !speakers.includes(voice.speaker)) this.release(voice);
    }

    if (this.playingIds.join() !== before) this.onPlayingChanged(this.playingIds);
  }

  play(speakers: SpeakerTrack[], listener: Point | null, config: SpeakerConfig) {
    if (!this.playing) {
      this.playing = true;
      this.playStartedAt = Date.now();
    }
    while (this.voices.length < SPARE_VOICES) this.newVoice();
    if (listener) this.update(speakers, listener, config);
    // Still in Play's tap: start the spare elements so they may play later.
    this.voices.filter((v) => !v.speaker && !v.unlocked).forEach((v) => this.unlock(v));

    this.stopSync();
    if (config.mode?.includes("sync")) {
      this.syncTimer = setInterval(
        () => this.keepInSync(config),
        config.syncCheckInterval || 2500
      );
    }
  }

  stop() {
    if (this.playStartedAt != null) {
      this.listenedBefore += (Date.now() - this.playStartedAt) / 1000;
    }
    this.playStartedAt = null;
    this.playing = false;
    this.stopSync();
    const wasPlaying = this.playingIds.length > 0;
    for (const voice of this.voices) {
      this.clearTimer(voice);
      voice.audio.pause();
      voice.sounding = false;
      voice.gain.gain.cancelScheduledValues(this.audioContext.currentTime);
      voice.gain.gain.value = 0;
      voice.target = 0;
      if (voice.releasing) this.free(voice);
    }
    if (wasPlaying) this.onPlayingChanged([]);
  }

  /** Let every element go (another speaker mode took over). */
  releaseAll() {
    this.stop();
    this.voices.forEach((v) => v.speaker && this.free(v));
  }

  private voiceFor(speakerId: number) {
    return this.voices.find((v) => v.speaker?.data.id === speakerId);
  }

  private metersAway(speaker: SpeakerTrack, listener: Point) {
    if (!speaker.outerBoundary) return Infinity;
    try {
      return pointToPolygonDistance(listener, speaker.outerBoundary, {
        units: "meters",
      });
    } catch (e) {
      speaker.warnGeometryOnce("distance to its area", e);
      return Infinity;
    }
  }

  private newVoice() {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    const source = this.audioContext.createMediaElementSource(audio);
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    this.outputs.forEach((out) => gain.connect(out));
    const voice = new Voice(audio, gain);
    audio.addEventListener("error", () => this.onError(voice));
    this.voices.push(voice);
    return voice;
  }

  private assign(speaker: SpeakerTrack, config: SpeakerConfig) {
    const voice = this.voices.find((v) => !v.speaker) ?? this.newVoice();
    voice.speaker = speaker;
    voice.releasing = false;
    voice.audio.loop = config.loop !== false;
    voice.audio.src = speaker.uri;
    return voice;
  }

  private sound(voice: Voice, volume: number) {
    this.clearTimer(voice);
    voice.releasing = false;
    if (!voice.sounding) {
      voice.sounding = true;
      if (voice.audio.paused) this.startOnClock(voice);
      this.rampTo(voice, volume, FADE_IN_S);
      voice.speaker!.emit("playing");
    } else if (Math.abs(voice.target - volume) > 0.01) {
      this.rampTo(voice, volume, VOLUME_RAMP_S);
    }
  }

  private silence(voice: Voice) {
    if (!voice.sounding) return;
    voice.sounding = false;
    this.rampTo(voice, 0, FADE_OUT_S);
    this.clearTimer(voice);
    voice.timer = setTimeout(() => {
      voice.timer = null;
      voice.audio.pause();
      if (voice.releasing) this.free(voice);
    }, FADE_OUT_S * 1000);
  }

  private release(voice: Voice) {
    voice.releasing = true;
    if (voice.sounding) this.silence(voice);
    else if (!voice.timer) this.free(voice);
  }

  private free(voice: Voice) {
    this.clearTimer(voice);
    voice.audio.pause();
    voice.audio.src = silenceAudioBase64;
    voice.speaker = null;
    voice.sounding = false;
    voice.releasing = false;
    voice.blocked = false;
  }

  private startOnClock(voice: Voice) {
    const audio = voice.audio;
    const seek = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) audio.currentTime = this.elapsed % d;
    };
    if (audio.readyState >= 1) seek();
    else audio.addEventListener("loadedmetadata", seek, { once: true });
    this.playElement(voice);
  }

  private playElement(voice: Voice) {
    Promise.resolve(voice.audio.play())
      .then(() => {
        voice.unlocked = true;
        voice.blocked = false;
      })
      .catch((e) => {
        if (e?.name !== "NotAllowedError") return;
        voice.blocked = true;
        this.retryOnNextTap();
      });
  }

  private unlock(voice: Voice) {
    voice.audio.src = silenceAudioBase64;
    Promise.resolve(voice.audio.play())
      .then(() => {
        voice.unlocked = true;
        if (!voice.speaker) voice.audio.pause();
      })
      .catch(() => {});
  }

  private retryOnNextTap() {
    if (this.waitingForTap) return;
    this.waitingForTap = true;
    const retry = () => {
      UNLOCK_AUDIO_EVENTS.forEach((e) => window.removeEventListener(e, retry));
      this.waitingForTap = false;
      if (!this.playing) return;
      this.voices
        .filter((v) => v.blocked && v.sounding)
        .forEach((v) => this.startOnClock(v));
    };
    UNLOCK_AUDIO_EVENTS.forEach((e) => window.addEventListener(e, retry));
  }

  private rampTo(voice: Voice, volume: number, seconds: number) {
    const gain = voice.gain.gain;
    const now = this.audioContext.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(volume, now + seconds);
    voice.target = volume;
  }

  private keepInSync(config: SpeakerConfig) {
    const acceptable = (config.acceptableDelayMs ?? 50) / 1000;
    const interval = (config.syncCheckInterval || 2500) / 1000;
    for (const voice of this.voices) {
      const audio = voice.audio;
      const d = audio.duration;
      if (!voice.sounding || audio.paused || !Number.isFinite(d) || d <= 0) {
        continue;
      }
      const expected = this.elapsed % d;
      let drift = expected - audio.currentTime;
      if (drift > d / 2) drift -= d;
      if (drift < -d / 2) drift += d;
      if (Math.abs(drift) <= acceptable) {
        audio.playbackRate = 1;
      } else if (Math.abs(drift) > SEEK_DRIFT_S) {
        audio.currentTime = expected;
        audio.playbackRate = 1;
      } else {
        const nudge = Math.max(-MAX_NUDGE, Math.min(MAX_NUDGE, drift / interval));
        audio.playbackRate = 1 + nudge;
      }
    }
  }

  private stopSync() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = null;
  }

  private onError(voice: Voice) {
    const speaker = voice.speaker;
    if (!speaker || voice.audio.src === silenceAudioBase64) return;
    console.warn(
      `Speaker ${speaker.data.id}: couldn't play ${speaker.uri}; left silent.`,
      voice.audio.error
    );
    this.failed.add(speaker.data.id);
    const wasSounding = voice.sounding;
    this.free(voice);
    if (wasSounding) this.onPlayingChanged(this.playingIds);
  }

  private clearTimer(voice: Voice) {
    if (voice.timer) clearTimeout(voice.timer);
    voice.timer = null;
  }
}
