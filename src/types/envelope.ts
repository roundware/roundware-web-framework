export interface IEnvelopeData {
  id: number;
  session_id: number;
  created_at: string;

  /** @deprecated v2 field name — use created_at */
  created?: string;
  /** @deprecated v2 field — in v3, envelope has a single asset (use asset.envelope_id instead) */
  asset_ids?: number[];
}
