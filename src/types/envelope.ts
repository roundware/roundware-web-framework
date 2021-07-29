import { IAudioData } from ".";

export interface IEnvelope {
  upload(
    audioData: IAudioData,
    fileName: string,
    data?: {
      latitude?: number;
      longitude?: number;
      tag_ids?: string;
      media_type?: string;
    }
  ): Promise<{
    detail: string;
  }>;
  toString(): string;
  connect(): Promise<void>;
}
