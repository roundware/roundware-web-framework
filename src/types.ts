import { Point } from "@turf/helpers";
export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Asset = {
  weight: number;
  locationPoint?: Coordinates;
  listenerPoint?: Point;
};

export type MixParams = {
  ordering?: string;
};
