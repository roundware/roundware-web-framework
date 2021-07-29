export interface IAsset {
  toString(): string;
  connect<T>(filters: object): Promise<T>;
}

export interface IAssetFilters {}
