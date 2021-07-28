export interface IEnvelope {
  toString(): string;
  connect(): Promise<void>;
}
