export interface IAudioTrackData {
  fadeout_when_filtered: boolean;
  id: number;
  minvolume: number;
  maxvolume: number;
  minduration: number;
  maxduration: number;
  mindeadair: number;
  maxdeadair: number;
  minfadeintime: number;
  maxfadeintime: number;
  minfadeouttime: number;
  maxfadeouttime: number;
  minpanpos: number;
  maxpanpos: number;
  minpanduration: number;
  maxpanduration: number;
  repeatrecordings: boolean;
  active: boolean;
  start_with_silence: boolean;
  banned_duration: number;
  tag_filters: any[];
  project_id: number;
  timed_asset_priority: number;
}
export interface IAudioTrack {
  toString(): string;
  connect(data?: object): Promise<IAudioTrackData[]>;
}
