export interface IParticipantResponse {
  id: number;
  device_id: string;
  client_type: string;
  participant_token: string | null;
  created_at: string;
  updated_at: string;
}
