export interface ISpeakerData {
  id: number;
  maxvolume: number;
  minvolume: number;
  attenuation_border: any;
  boundary: any;
  attenuation_distance: number;
  uri: string;
  shape: {
    type: string;
    coordinates: number[][][][];
  };
}

export interface ISpeakerFilters {}
