/*
@see https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/AudioTrack.swift

 Audiotracks data looks like this:

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
export class PlaylistAudiotrack {
  constructor({ audioCtx, audioData = {}, playlist }) {
    this.data = audioData;
    this.playlist = playlist;
    this.playing = false;

    this.buildAudio(audioCtx);
    //self.id = id
    //self.volume = volume
    //self.duration = duration
    //self.deadAir = deadAir
    //self.fadeInTime = fadeInTime
    //self.fadeOutTime = fadeOutTime
    //self.repeatRecordings = repeatRecordings
    //self.tags = tags
    //self.bannedDuration = bannedDuration
    //self.startWithSilence = startWithSilence
    //self.fadeOutWhenFiltered = fadeOutWhenFiltered
    
                //return AudioTrack(
                //id: it["id"]!.int!,
                //volume: (it["minvolume"]!.float!)...(it["maxvolume"]!.float!),
                //duration: (it["minduration"]!.float!)...(it["maxduration"]!.float!),
                //deadAir: (it["mindeadair"]!.float!)...(it["maxdeadair"]!.float!),
                //fadeInTime: (it["minfadeintime"]!.float!)...(it["maxfadeintime"]!.float!),
                //fadeOutTime: (it["minfadeouttime"]!.float!)...(it["maxfadeouttime"]!.float!),
                //repeatRecordings: it["repeatrecordings"]?.bool ?? false,
                //tags: it["tag_filters"]?.array?.map { $0.int! },
                //bannedDuration: it["banned_duration"]?.double ?? 600,
                //startWithSilence: it["start_with_silence"]?.bool ?? true,
                //fadeOutWhenFiltered: it["fadeout_when_filtered"]?.bool ?? true
  }

  buildAudio(audioCtx) {
    const audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';

    audioElement.addEventListener('ended',() => {
      audioElement.src = '';
      if (this.playing) this.play(); // makes play() recursive
    }); 

    const audioSrc = audioCtx.createMediaElementSource(audioElement);
    audioSrc.connect(audioCtx.destination);

    this.audioElement = audioElement;
  }

  async play() {
    if (this.playing) return;

    const { playlist, audioElement } = this;

    if (audioElement.src === '' || audioElement.ended) {
      const asset = playlist.next(this);

      if (!asset) return;

      const { file: audioURL, id: assetId } = asset;

      audioElement.src = audioURL;
      this.currentAssetId = assetId;
    }

    const logline = `play ${this}: asset #${this.currentAssetId}`;
    console.log(logline);

    try {
      await audioElement.play();
      this.playing = true;
    } catch(err) {
      console.error(`Unable to ${logline}`,err);
    }
  }

  async pause() {
    if (!this.playing) return;

    console.log(`Pausing ${this}`);

    if (this.audioElement) await this.audioElement.pause();
    this.playing = false;
  }

  toString() {
    const { id } = this.data;
    return `PlaylistAudiotrack (Audiotrack ID #${id})`;
  }
}
