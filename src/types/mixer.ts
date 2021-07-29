import { Point } from "@turf/helpers";
import { AssetT, Coordinates } from ".";
import { IPlaylist } from "./playlist";

export interface IMixer {
  playlist: IPlaylist | undefined;
  playing: boolean;
  mixParams: unknown;
  updateParams(params: {
    listenerLocation?: Coordinates;
    listenerPoint?: Point;
    geoListenMode?: number;
  }): void;
}

export interface SpeakerTrack {}
export interface AudioTrack {
  id: string | number;
}
