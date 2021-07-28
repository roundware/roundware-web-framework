import { Point } from "@turf/helpers";
import { AssetT, Coordinates } from ".";

export type PlaylistType = {
  updateParams(params: { listenerPoint?: Point }): unknown;
  currentlyPlayingAssets: AssetT[];
  skip(trackId: number): void;
  replay(trackId: number): void;
};
export interface IMixer {
  playlist: PlaylistType | undefined;
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
