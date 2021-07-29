import { Point } from "@turf/helpers";
import { Coordinates } from ".";
import { IPlaylist } from "./playlist";

export interface IMixer {
  playlist: IPlaylist | undefined;
  playing: boolean;
  mixParams: unknown;
  skip(): void;
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
