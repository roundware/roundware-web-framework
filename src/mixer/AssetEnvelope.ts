import { IAssetData } from "../types";
import { IAsset } from "../types/asset";
import { IAssetEnvelope } from "../types/mixer/AssetEnvelope";
import { ITrackOptions } from "../types/mixer/TrackOptions";
import { random } from "../utils";

export class AssetEnvelope implements IAssetEnvelope {
  asset: IAssetData;
  assetId: string | number | undefined;
  minDuration: number;
  maxDuration: number;
  duration: number;
  start: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  startFadingOutSecs: number;

  constructor(trackOptions: ITrackOptions, asset: IAssetData) {
    const {
      randomFadeInDuration,
      randomFadeOutDuration,
      fadeOutMultiplier,
      durationLowerBound,
      durationUpperBound,
    } = trackOptions;

    const {
      activeRegionLowerBound,
      activeRegionUpperBound,
      activeRegionLength,
    } = asset;

    this.asset = asset;
    this.assetId = asset.id;

    this.minDuration = Math.min(durationLowerBound, Number(activeRegionLength));
    this.maxDuration = Math.min(durationUpperBound, Number(activeRegionLength));
    this.duration = random(this.minDuration, this.maxDuration);

    const latestStart = Number(activeRegionUpperBound) - this.duration;
    this.start = random(activeRegionLowerBound, latestStart);

    this.fadeInDuration = Math.min(randomFadeInDuration, this.duration / 2);
    this.fadeOutDuration =
      Math.min(randomFadeOutDuration, this.duration / 2) *
      Number(fadeOutMultiplier);
    this.startFadingOutSecs =
      this.duration - this.fadeInDuration - this.fadeOutDuration;
  }

  toString() {
    const {
      asset: { id: assetId },
    } = this;
    return `AssetEnvelope #${assetId}`;
  }
}
