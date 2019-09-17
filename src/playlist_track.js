export class PlaylistTrack {
  constructor({ audioCtx, audioData = {}, playlist }) {
    this.data = audioData;
    this.playlist = playlist;

    this.playing = false;

    const audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';

    audioElement.addEventListener('ended',() => {
      this.playing = false;
      console.log(this,'ended playing');
      this.play(); // makes play() recursive
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

      const { file: audioURL } = asset;

      audioElement.src = audioURL;
    }

    console.log(`Playing on ${this}: '${audioElement.src}'`);
    await audioElement.play();

    this.playing = true;
  }

  async pause() {
    if (!this.playing) return;

    console.log('Pausing',this);

    if (this.audioElement) await this.audioElement.pause();
    this.playing = false;
  }

  toString() {
    const { id } = this.data;
    return `PlaylistTrack (audiotrack ${id})`;
  }
}
