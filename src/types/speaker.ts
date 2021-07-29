export interface ISpeakerData {
  id: string;
  maxvolume: number;
  minvolume: number;
  attenuation_border: any;
  boundary: any;
  attenuation_distance: number;
  uri: string;
}
export interface ISpeaker {
  toString(): string;
  connect(data: object): Promise<ISpeakerData[]>;
}

export interface ISpeakerFilters {}
