export interface PladwayBidResult {
  available: boolean;
  priceCpm: number | null;
  vastUrl: string | null;
  creativeUrl: string | null;
  raw?: unknown;
}

export interface PladwayBidService {
  requestBid(input: {
    optId: string;
    stationId?: string;
    placementId?: string;
  }): Promise<PladwayBidResult>;
}
