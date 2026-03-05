export interface IProjectData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  default_language_id?: number;
  language_ids: number[];
  audio_format: string;
  auto_submit: boolean;
  max_recording_length_sec: number;
  listen_enabled: boolean;
  geo_listen_enabled: boolean;
  speak_enabled: boolean;
  geo_speak_enabled: boolean;
  recording_radius: number;
  out_of_range_distance: number;
  repeat_mode: string;
  ordering: string;
  sharing_url: string;
  legal_agreement: string;
  is_active: boolean;

  // v3-specific fields
  recording_method?: string;
  allow_photos?: boolean;
  allow_text?: boolean;
  allow_speak_tags?: boolean;
  use_audio_welcome?: boolean;
  survey_link?: string;
  auto_reset_time_sec?: number;
  speaker_shape?: string;
  speaker_shape_scale?: number;
  ui_config_json?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;

  /** @deprecated v2 field name — use max_recording_length_sec */
  max_recording_length?: number;
  /** @deprecated v2 field — removed in v3 */
  pub_date?: string;
  /** @deprecated v2 field — removed in v3 */
  files_url?: string;
  /** @deprecated v2 field — removed in v3 */
  files_version?: string;
  /** @deprecated v2 field — removed in v3 */
  audio_stream_bitrate?: string;
  /** @deprecated v2 field — removed in v3 */
  demo_stream_enabled?: boolean;
  /** @deprecated v2 field — removed in v3 */
  demo_stream_url?: string;
  /** @deprecated v2 field — removed in v3 */
  demo_stream_message?: string;
  /** @deprecated v2 field — removed in v3 */
  sharing_message?: string;
  /** @deprecated v2 field — removed in v3 */
  out_of_range_message?: string;
  /** @deprecated v2 field — removed in v3 */
  out_of_range_url?: string;
  /** @deprecated v2 field — removed in v3 */
  listen_questions_dynamic?: boolean;
  /** @deprecated v2 field — removed in v3 */
  speak_questions_dynamic?: boolean;
  /** @deprecated v2 field — removed in v3 */
  reset_tag_defaults_on_startup?: boolean;
  /** @deprecated v2 field — removed in v3 */
  timed_asset_priority?: boolean;
}
