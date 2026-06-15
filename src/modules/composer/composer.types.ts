export type ComposerSelectedSource = 'PLADWAY' | 'LOCAL_RESERVATION' | 'NONE';

export type ComposerDecisionReason =
  | 'PLADWAY_AD_AVAILABLE'
  | 'PLADWAY_NO_AD'
  | 'NO_PROVIDER_IMPLEMENTED';

export interface ComposerAdPreviewInput {
  optId: string;
  stationId?: string;
  placementId?: string;
}

export interface ComposerAdPreviewResponse {
  optId: string;
  stationId: string | null;
  placementId: string | null;
  selectedSource: ComposerSelectedSource;
  decisionReason: ComposerDecisionReason;
}
