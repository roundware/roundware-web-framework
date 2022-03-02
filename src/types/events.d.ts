export type EventType =
  | "start_session"
  | "play_stream"
  | "pause_stream"
  | "filter_stream"
  | "location_update"
  | "change_listen_mode"
  | "start_record"
  | "end_record"
  | "upload_asset"
  | "share_map";

export type EventPayload = {
  latitude?: number;
  longitude?: number;
  tag_ids?: number[];
  session_id?: string;
  event_type?: EventType;
  client_time?: string;
  data?: string;
};
