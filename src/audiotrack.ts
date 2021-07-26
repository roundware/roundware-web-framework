/* This is what audiotracks data looks like:
[{
	"id": 8,
	"minvolume": 0.7,
	"maxvolume": 0.7,
	"minduration": 200.0,
	"maxduration": 250.0,
	"mindeadair": 1.0,
	"maxdeadair": 3.0,
	"minfadeintime": 2.0,
	"maxfadeintime": 4.0,
	"minfadeouttime": 0.3,
	"maxfadeouttime": 1.0,
	"minpanpos": 0.0,
	"maxpanpos": 0.0,
	"minpanduration": 10.0,
	"maxpanduration": 20.0,
	"repeatrecordings": false,
	"active": true,
	"start_with_silence": false,
	"banned_duration": 600,
	"tag_filters": [],
	"project_id": 9
}] 
*/

import { IApiClient } from "./api-client";

const REQUEST_PATH = "/audiotracks/";
export interface AudioTrackData {

	id: number,
	minvolume: number,
	maxvolume: number,
	minduration: number,
	maxduration: number,
	mindeadair: number,
	maxdeadair: number,
	minfadeintime: number,
	maxfadeintime: number,
	minfadeouttime: number,
	maxfadeouttime: number,
	minpanpos: number,
	maxpanpos: number,
	minpanduration: number,
	maxpanduration: number,
	repeatrecordings: boolean,
	active: boolean,
	start_with_silence: boolean,
	banned_duration: number,
	tag_filters: unknown[],
	project_id: number

}
export interface IAudioTrack {
	toString(): string;
	connect(data: object): Promise<AudioTrackData>
}
export class Audiotrack {
	private _projectId: number;
	private _apiClient: IApiClient;
	constructor(projectId: number, options: { apiClient: IApiClient }) {
		this._projectId = projectId;
		this._apiClient = options.apiClient;
	}

	toString(): string {
		return `Roundware Audiotracks (#${this._projectId})`;
	}

	async connect(data: any = {}): Promise<AudioTrackData> {
		data.project_id = this._projectId;
		data.active = true;

		return await this._apiClient.get<AudioTrackData>(REQUEST_PATH, data);
	}
}
