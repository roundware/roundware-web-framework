export class PlaylistTrack {
  constructor(audioCtx,audioTrack,nextAssetCallback) {
    this.destination = audioCtx.destination;
    this.audioTrack = audioTrack;
    this.nextAssetCallback = nextAssetCallback;
    this.audioCtx = audioCtx;
  }

  async play() {
    const nextAsset = await this.nextAssetCallback();
    // TODO need to check for play/paused state -- maybe nextAsset returns null

    const { file: audioURL } = nextAsset;
    const audio = new Audio(audioURL);
    audio.crossOrigin = 'anonymous';

    const audioSrc = this.audioCtx.createMediaElementSource(audio);
    
    audioSrc.connect(this.destination);

    const logline = `asset '${audioURL}' for track ${this.audioTrack.id}`;

    try {
      console.log('Playing',logline);
      await audio.play();
    } catch(err) {
      console.error('Unable to play',logline,err);
    }

    this.play(); // wait for next asset, if any
  }
}
