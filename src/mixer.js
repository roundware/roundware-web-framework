export class Mixer {
  constructor(client,audioCtx) {
    //this.client = client;
    // TODO: need to tell the client to notify us when geoposition or tags change,
    // so we can recompute the playlist
    this.audioCtx = audioCtx;
    this.audiotracks = client.audiotracks();
    this.assets = client.assets();
    this.speakers = client.speakers();
  }

  toString() {
    return 'Roundware Mixer';
  }

  play() {
    console.log(`Mixer playing ${this.audiotracks.length} track(s)`);

    const { file: fileURL } = this.assets[0];

    // H/T https://teropa.info/blog/2016/07/28/javascript-systems-music.html#playing-the-sound
    fetch(fileURL).
      then(response => response.arrayBuffer()).
      then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer)).
      then(audioBuffer => {
        let sourceNode = this.audioCtx.createBufferSource();

        sourceNode.buffer = audioBuffer;
        sourceNode.connect(this.audioCtx.destination);
        sourceNode.start();
      }).
      catch(e => console.error(e));

    //debugger; // eslint-disable-line no-debugger
    //const REAL_TIME_FREQUENCY = 440;
    //const ANGULAR_FREQUENCY = REAL_TIME_FREQUENCY * 2 * Math.PI;

    //let myBuffer = this.audioCtx.createBuffer(1, 88200, 44100);
    //let myArray = myBuffer.getChannelData(0);

    //for (let sampleNumber = 0 ; sampleNumber < 88200 ; sampleNumber++) {
      //myArray[sampleNumber] = generateSample(sampleNumber);
    //}

    //function generateSample(sampleNumber) {
      //let sampleTime = sampleNumber / 44100;
      //let sampleAngle = sampleTime * ANGULAR_FREQUENCY;
      //return Math.sin(sampleAngle);
    //}

    //let src = this.audioCtx.createBufferSource();
    //src.buffer = myBuffer;
    //src.connect(this.audioCtx.destination);
    //src.start();

    // get assets, speakers, audiotracks, figure out what to play in what order
    // just try to get the first asset and first speaker playing through the audioCtx...
  }
}
