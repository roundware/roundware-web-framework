export interface IAudioTrackData {
  fadeout_when_filtered: boolean;
  id: number;
  min_volume: number;
  max_volume: number;
  min_duration: number;
  max_duration: number;
  min_dead_air: number;
  max_dead_air: number;
  min_fade_in_time: number;
  max_fade_in_time: number;
  min_fade_out_time: number;
  max_fade_out_time: number;
  min_pan_pos: number;
  max_pan_pos: number;
  min_pan_duration: number;
  max_pan_duration: number;
  repeat_recordings: boolean;
  is_active: boolean;
  start_with_silence: boolean;
  banned_duration: number;
  tag_filters: any[];
  project_id: number;
  timed_asset_priority: string;

  /** @deprecated v2 field name — use min_volume */
  minvolume?: number;
  /** @deprecated v2 field name — use max_volume */
  maxvolume?: number;
  /** @deprecated v2 field name — use min_duration */
  minduration?: number;
  /** @deprecated v2 field name — use max_duration */
  maxduration?: number;
  /** @deprecated v2 field name — use min_dead_air */
  mindeadair?: number;
  /** @deprecated v2 field name — use max_dead_air */
  maxdeadair?: number;
  /** @deprecated v2 field name — use min_fade_in_time */
  minfadeintime?: number;
  /** @deprecated v2 field name — use max_fade_in_time */
  maxfadeintime?: number;
  /** @deprecated v2 field name — use min_fade_out_time */
  minfadeouttime?: number;
  /** @deprecated v2 field name — use max_fade_out_time */
  maxfadeouttime?: number;
  /** @deprecated v2 field name — use min_pan_pos */
  minpanpos?: number;
  /** @deprecated v2 field name — use max_pan_pos */
  maxpanpos?: number;
  /** @deprecated v2 field name — use min_pan_duration */
  minpanduration?: number;
  /** @deprecated v2 field name — use max_pan_duration */
  maxpanduration?: number;
  /** @deprecated v2 field name — use repeat_recordings */
  repeatrecordings?: boolean;
  /** @deprecated v2 field name — use is_active */
  active?: boolean;
}
