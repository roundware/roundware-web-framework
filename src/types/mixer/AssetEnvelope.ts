import { IAssetData } from "..";

export interface IAssetEnvelope {
  asset: IAssetData;
  assetId?: string | number;
  minDuration: number;
  maxDuration: number;
  duration: number;
  start: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  startFadingOutSecs: number;
  toString(): string;
}
