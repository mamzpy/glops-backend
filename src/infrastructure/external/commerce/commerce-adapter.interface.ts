export interface OfferItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  serviceType: string;
  imageUrl?: string;
  stationIds?: string[];
  
}

export interface CommerceAdapter {
  getActiveOffers(stationId: string): Promise<OfferItem[]>;
  getOfferById(offerId: string, stationId: string): Promise<OfferItem | null>;
}

export const COMMERCE_ADAPTER = 'COMMERCE_ADAPTER';