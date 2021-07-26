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

const REQUEST_PATH = "/audiotracks/";

export class Audiotrack {
  constructor(projectId,options) {
    this.projectId = projectId;
    this.apiClient = options.apiClient;
  }

  toString() {
    return `Roundware Audiotracks (#${this.projectId})`;
  }

  connect(data={}) {
    data.project_id = this.projectId;
    data.active = true;

    return this.apiClient.get(REQUEST_PATH,data);
  }
}
