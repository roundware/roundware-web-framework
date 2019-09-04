/* global require */
const { polygon } = require('@turf/helpers');

/** A Roundware speaker under the control of the client-side mixer */
export class SpeakerTrack {
  constructor({ audioCtx, data }) {
    this.audioCtx = audioCtx;
    
    const {
      id: speakerId,
      maxvolume: maxVolume,
      minvolume: minVolume,
      attenuation_border,
      boundary,
      attenuation_distance: attenuationDistance,
      uri
    } = data;

    this.speakerId = speakerId;
    this.maxVolume = maxVolume;
    this.minVolume = minVolume;
    this.attenuationDistance = attenuationDistance;

    this.audio = new Audio(uri);
    this.audio.crossOrigin = 'anonymous';

    const audioSrc = audioCtx.createMediaElementSource(this.audio);
    audioSrc.connect(audioCtx.destination);

    this.innerShape = polygon(attenuation_border,{ name: `Speaker${speakerId}AttenuationBorder` });
    this.outerShape = polygon(boundary,{ name: `Speaker${speakerId}Boundary` });
  }

  toString() {
    const { speakerId } = this.data || {};
    return `SpeakerTrack (${speakerId})`;
  }
  
  async play() {
    //const logline = `${this} (${this.uri})`;

    //try {
      //await this.audio.play();
      //console.log('Playing',logline);
    //} catch(err) {
      //console.error('Unable to play',logline,err);
    //}

    // build boundaries/shapes
    // build attentuation borders
  }
}
