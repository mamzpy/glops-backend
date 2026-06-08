import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type {
  CommerceAdapter,
  OfferItem,
} from '../commerce-adapter.interface';

@Injectable()
export class StrapiCommerceAdapter implements CommerceAdapter {
  private readonly logger = new Logger(StrapiCommerceAdapter.name);
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('strapi.baseUrl');
    this.apiToken = this.configService.getOrThrow<string>('strapi.apiToken');
  }

  async getActiveOffers(stationId: string): Promise<OfferItem[]> {
    this.logger.log(`Fetching active offers for station ${stationId}`);

    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/api/offers`, {
        headers: this.getAuthHeaders(),
        params: {
          'filters[active][$eq]': true,
          populate: 'image',
        },
      }),
    );

    const data = response.data?.data ?? [];

    return data
      .map((item: unknown) => this.mapStrapiOffer(item))
      .filter((offer: OfferItem) =>
        this.isOfferAvailableForStation(offer, stationId),
      );
  }

  async getOfferById(
    offerId: string,
    stationId: string,
  ): Promise<OfferItem | null> {
    this.logger.log(`Fetching offer ${offerId} for station ${stationId}`);

    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/api/offers`, {
        headers: this.getAuthHeaders(),
        params: {
          'filters[id][$eq]': String(offerId),
          'filters[active][$eq]': true,
          populate: 'image',
        },
      }),
    );

    const item = response.data?.data?.[0];

    if (!item) {
      return null;
    }

    const offer = this.mapStrapiOffer(item);

    if (!this.isOfferAvailableForStation(offer, stationId)) {
      return null;
    }

    return offer;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
    };
  }

  private mapStrapiOffer(raw: unknown): OfferItem {
    const item = raw as {
      id: number | string;
      name?: string;
      description?: string | null;
      price?: number | string;
      active?: boolean;
      serviceType?: string | null;
      image?: { url?: string } | null;
      stationIds?: string[] | null;
    };

    const relativeImageUrl = item.image?.url;

    return {
      id: String(item.id),
      name: String(item.name ?? ''),
      description: item.description ?? '',
      price: Number(item.price ?? 0),
      active: Boolean(item.active),
      serviceType: item.serviceType ?? '',
      imageUrl: relativeImageUrl
        ? `${this.baseUrl}${relativeImageUrl}`
        : undefined,
      stationIds: Array.isArray(item.stationIds) ? item.stationIds : [],
    };
  }

  private isOfferAvailableForStation(
    offer: OfferItem,
    stationId: string,
  ): boolean {
    if (!offer.stationIds || offer.stationIds.length === 0) {
      return true;
    }

    return offer.stationIds.includes(stationId);
  }
}