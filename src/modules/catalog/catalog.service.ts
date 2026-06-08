import { Inject, Injectable } from '@nestjs/common';

import {
  COMMERCE_ADAPTER,
  type CommerceAdapter,
} from '../../infrastructure/external/commerce/commerce-adapter.interface';

export type CatalogOfferResponse = {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  serviceType: string;
  imageUrl?: string;
};

@Injectable()
export class CatalogService {
  constructor(
    @Inject(COMMERCE_ADAPTER)
    private readonly commerceAdapter: CommerceAdapter,
  ) {}

  async getActiveOffers(stationId: string): Promise<CatalogOfferResponse[]> {
    const offers = await this.commerceAdapter.getActiveOffers(stationId);

    return offers.map((offer) => ({
      id: offer.id,
      name: offer.name,
      description: offer.description,
      price: offer.price,
      active: offer.active,
      serviceType: offer.serviceType,
      imageUrl: offer.imageUrl,
    }));
  }
}