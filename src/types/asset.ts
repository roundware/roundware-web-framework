export interface IAsset {
  toString(): string;
  connect<T>(): Promise<T>;
}

export interface IAssetFilters {}
