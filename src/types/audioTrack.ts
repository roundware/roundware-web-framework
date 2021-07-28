export interface IAudioTrackData {
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
  tag_filters: unknown[];
  project_id: number;
}
export interface IAudioTrack {
  toString(): string;
  connect(data: object): Promise<IAudioTrackData>;
}
