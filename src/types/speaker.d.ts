import { IAudioContext } from "standardized-audio-context";
import { SpeakerConfig } from "./roundware";

export interface ISpeakerData {
  id: number;
  maxvolume: number;
  minvolume: number;
  attenuation_border: any;
  boundary: any;
  attenuation_distance: number;
  uri: string;
  shape: {
    type: string;
    coordinates: number[][][][];
  };
}

export interface ISpeakerFilters {}

export interface ISpeakerPlayer {
  isSafeToPlay: boolean;
  playing: boolean;
  audio: HTMLAudioElement;
  loaded: boolean;
  loadedPercentage: number;
  id: number;
  config: SpeakerConfig;
  play(): Promise<boolean>;
  pause(): void;
  timerStart(): void;
  timerStop(): void;
  fade(destinationVolume?: number, duration?: number): void;
  fadeOutAndPause(): void;
  log(string: string): void;
  onLoadingProgress(callback: (newPercent: number) => void): void;
  onEnd(callback: () => void): void;
}

export type SpeakerConstructor = {
  audioContext: IAudioContext;
  uri: string;
  id: number;
  config: SpeakerConfig;
};
