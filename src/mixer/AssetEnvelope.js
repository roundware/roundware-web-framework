import { random } from '../utils';

export class AssetEnvelope {
  constructor(trackOptions,asset) {
    const { 
      randomFadeInDuration, 
      randomFadeOutDuration, 
      fadeOutMultiplier,
      durationLowerBound,
      durationUpperBound
    } = trackOptions;

    const { activeRegionLowerBound, activeRegionUpperBound, activeRegionLength } = asset;

    this.asset = asset;
    this.assetId = asset.id;

    this.minDuration = Math.min(durationLowerBound,activeRegionLength);
    this.maxDuration = Math.min(durationUpperBound,activeRegionLength);
    this.duration = random(this.minDuration,this.maxDuration);

    const latestStart = activeRegionUpperBound - this.duration;
    this.start = random(activeRegionLowerBound,latestStart);

    this.fadeInDuration = Math.min(randomFadeInDuration,this.duration / 2);
    this.fadeOutDuration = Math.min(randomFadeOutDuration,this.duration / 2) * fadeOutMultiplier;
    this.startFadingOutSecs = this.duration - this.fadeInDuration - this.fadeOutDuration;
  }

  toString() {
    const { asset: { id: assetId } } = this;
    return `AssetEnvelope #${assetId}`;
  }
}
