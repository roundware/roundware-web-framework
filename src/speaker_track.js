import * as turf from '@turf/turf'; // TODO try to use smaller packages since turf is so modular

const convertLinesToPolygon = shape => turf.lineToPolygon(shape);

/** A Roundware speaker under the control of the client-side mixer, representing 'A polygonal geographic zone within which an ambient audio stream broadcasts continuously to listeners. 
 * Speakers can overlap, causing their audio to be mixed together accordingly.  Volume attenuation happens linearly over a specified distance from the edge of the Speaker’s defined zone.'
 * (quoted from https://github.com/loafofpiecrust/roundware-ios-framework-v2/blob/client-mixing/RWFramework/RWFramework/Playlist/Speaker.swift)
 * */
export class SpeakerTrack {
  constructor({ audioCtx, startingListenerPoint, data }) {
    const {
      id: speakerId,
      maxvolume: maxVolume,
      minvolume: minVolume,
      attenuation_border,
      boundary,
      attenuation_distance: attenuationDistance,
      uri,
    } = data;

    this.audioCtx = audioCtx;
    this.speakerId = speakerId;
    this.maxVolume = maxVolume;
    this.minVolume = minVolume;
    this.attenuationDistance = attenuationDistance;
    this.uri = uri;
    this.listenerPoint = startingListenerPoint;
    this.playing = false;

    this.attenuationBorder = convertLinesToPolygon(attenuation_border);
    this.attenuationPoints = turf.explode(this.attenuationBorder);

    this.outerBoundary = convertLinesToPolygon(boundary);
  }

  outerBoundaryContains(point) {
    return turf.booleanPointInPolygon(point,this.outerBoundary);
  }

  attenuationShapeContains(point) {
    return turf.booleanPointInPolygon(point,this.attenuationBorder);
  }

  distance(toPoint) {
    return turf.distance(this.outerBoundary,toPoint);
  }

  attenuationRatio(atPoint) {
    const nearestPoint = turf.nearestPoint(
      atPoint,
      this.attenuationPoints
    );

    const distToInnerShape = turf.distance(nearestPoint,atPoint);
    const ratio = 1 - (distToInnerShape / this.attenuationDistance);

    console.log('attenuationRatio',this,nearestPoint,distToInnerShape,ratio);

    return ratio;
  }

  calculateCurrentVolume() {
    const { listenerPoint } = this;

    if (this.attenuationShapeContains(listenerPoint)) {
      return this.maxVolume;
    } else if (this.outerBoundaryContains(listenerPoint)) {
      const range = this.maxVolume - this.minVolume;
      const volumeGradient = this.minVolume + (range * this.attenuationRatio(listenerPoint));
      return volumeGradient;
    } else {
      return this.minVolume;
    }
  }

  buildAudio() {
    if (this.audio) return this.audio;

    const { audioCtx, uri } = this;
    const audio = new Audio(uri);

    audio.crossOrigin = 'anonymous';
    audio.loop = true;

    const audioSrc = audioCtx.createMediaElementSource(audio);
    const gainNode = audioCtx.createGain();

    audioSrc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    this.gainNode = gainNode;
    this.audio = audio;

    return this.audio;
  }

  updateListenerPoint(point) {
    this.listenerPoint = point;
    //console.info('ULP',this.listenerPoint);
    this.updateVolume();
  }

  updateVolume() {
    const newVolume = this.calculateCurrentVolume();

    console.log(`Setting ${this} volume: ${newVolume}`);

    if (newVolume <= 0.05 && this.gainNode) {
      // only set the gain if the node has been created; if we never got near enough to hear the speaker, avoid lazily creating
      this.gainNode.gain.value = 0;
      console.log(`Silenced ${this}`);
      return;
    }

    this.buildAudio();
        
    this.gainNode.gain.value = newVolume;
    console.info(`Set ${this} volume ${newVolume}`);

    // TODO setup fading per below swift code
    
    //fadeTimer?.removeAllObservers(thenStop: true)
    //if let player = self.player {
        //let totalDiff = vol - player.volume
        //let delta: Float = 0.075
        //fadeTimer = .every(.seconds(Double(delta))) { timer in
            //let currDiff = vol - player.volume
            //if currDiff.sign != totalDiff.sign || abs(currDiff) < 0.05 {
                //// we went just enough or too far
                //player.volume = vol
                
                //if vol < 0.05 {
                    //// we can't hear it anymore, so pause it.
                    //player.pause()
                //}
                //timer.removeAllObservers(thenStop: true)
            //} else {
                //player.volume += totalDiff * delta / Speaker.fadeDuration
            //}
        //}
    //}
  }

  get logline() {
    return `${this} (${this.uri})`;
  }

  async play() {
    const audio = this.buildAudio();
    this.updateVolume();

    try {
      console.log('Playing',this.logline);
      await audio.play();
      this.playing = true;
    } catch(err) {
      console.error('Unable to play',this.logline,err);
    }
  }

  async pause() {
    if (!this.audio) return; // may not have been created yet, so there's nothing to pause
    
    try {
      console.log('Pausing',this.logline);
      await this.audio.pause();
      this.playing = false;
    } catch(err) {
      console.error('Unable to pause',this.logline,err);
    }
  }

  toString() {
    const { speakerId } = this;
    return `SpeakerTrack (${speakerId})`;
  }
}
