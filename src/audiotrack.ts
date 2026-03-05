/* This is what audiotracks data looks like (v3 API):
[{
	"id": 8,
	"min_volume": 0.7,
	"max_volume": 0.7,
	"min_duration": 200.0,
	"max_duration": 250.0,
	"min_dead_air": 1.0,
	"max_dead_air": 3.0,
	"min_fade_in_time": 2.0,
	"max_fade_in_time": 4.0,
	"min_fade_out_time": 0.3,
	"max_fade_out_time": 1.0,
	"min_pan_pos": 0.0,
	"max_pan_pos": 0.0,
	"min_pan_duration": 10.0,
	"max_pan_duration": 20.0,
	"repeat_recordings": false,
	"is_active": true,
	"start_with_silence": false,
	"banned_duration": 600,
	"tag_filters": [],
	"project_id": 9
}]
*/

import { ApiClient } from "./api-client";
import { IAudioTrackData } from "./types/audioTrack";

const REQUEST_PATH = "/audiotracks/";

export class Audiotrack {
  private _projectId: number;
  private _apiClient: ApiClient;
  constructor(projectId: number, options: { apiClient: ApiClient }) {
    this._projectId = projectId;
    this._apiClient = options.apiClient;
  }

  toString(): string {
    return `Roundware Audiotracks (#${this._projectId})`;
  }

  async connect(data: any = {}): Promise<IAudioTrackData[]> {
    data.project_id = this._projectId;
    data.active = true;

    return await this._apiClient.get<IAudioTrackData[]>(REQUEST_PATH, data);
  }
}
