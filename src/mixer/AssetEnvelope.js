import { random } from '../utils';

export class AssetEnvelope {
  constructor(trackOptions,asset) {
    this.trackOptions = trackOptions;
    this.asset = asset;
    this.assetId = asset.id;

    this.activeRegionLowerBound = asset.start_time;
    this.activeRegionUpperBound = asset.end_time;
    this.activeRegionLength = this.activeRegionUpperBound - this.activeRegionLowerBound;

    this.minDuration = Math.min(trackOptions.durationLowerBound,this.activeRegionLength);
    this.maxDuration = Math.min(trackOptions.durationUpperBound,this.activeRegionLength);
    this.duration = random(this.minDuration,this.maxDuration);

    this.latestStart = this.activeRegionUpperBound - this.duration;
    this.start = random(this.activeRegionLowerBound,this.latestStart);

    const { randomFadeInDuration, randomFadeOutDuration, fadeOutMultiplier } = trackOptions;
    
    this.fadeInDuration = Math.min(randomFadeInDuration,this.duration / 2);
    this.fadeOutDuration = Math.min(randomFadeOutDuration,this.duration / 2) * fadeOutMultiplier;
    this.startFadingOutSecs = this.duration - this.fadeInDuration - this.fadeOutDuration;
  }

  toString() {
    const { asset: { id: assetId } } = this;

    const data = [
      'activeRegionLowerBound',
      'activeRegionUpperBound',
      'activeRegionLength',
      'minDuration',
      'maxDuration',
      'duration',
      'latestStart',
      'start',
      'fadeInDuration',
      'fadeOutDuration',
      'startFadingOutSecs'
    ].map(key => `${key}: ${this[key].toFixed(1)}`).join('; ');

    return `Asset #${assetId} envelope (${data})`;
  }
}
