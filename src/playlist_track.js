export class PlaylistTrack {
  constructor({ audioCtx, audioData = {}, playlist }) {
    this.audioCtx = audioCtx;
    this.destination = audioCtx.destination;
    this.data = audioData;
    this.playlist = playlist;
    this.playing = false;
  }

  toString() {
    const { id } = this.data;
    return `PlaylistTrack (audiotrack ${id})`;
  }

  pause() {
    console.log('Pausing',this);
    this.playing = false;
  }

  async play() {
    const { playlist, audioCtx, destination } = this;
    this.playing = true;

    while (this.playing) {
      const asset = playlist.next(self);

      if (!asset) {
        console.log(this,'shutdown');
        return this.pause();
      }

      const { file: audioURL } = asset;
      const audio = new Audio(audioURL);
      audio.crossOrigin = 'anonymous';

      const audioSrc = audioCtx.createMediaElementSource(audio);
      audioSrc.connect(destination);

      const logline = `asset '${audioURL}' for ${this}`;

      const whilePlayingPromise = new Promise(resolve =>
        audio.addEventListener('ended',evt => resolve(evt))
      );

      try {
        await audio.play();
        console.log('Playing',logline);

        await whilePlayingPromise;
        console.log('Finished playing',logline);
      } catch(err) {
        console.error('Unable to play',logline,err);
      }
    }
  }
}
