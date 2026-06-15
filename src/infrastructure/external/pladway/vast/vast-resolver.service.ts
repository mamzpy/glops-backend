import { Injectable, Logger } from '@nestjs/common';
import { VASTClient } from '@dailymotion/vast-client';

import { PladwayAdResult, PladwayTrackingUrls } from '../pladway.types';

@Injectable()
export class VastResolverService {
  private readonly logger = new Logger(VastResolverService.name);

  async resolve(url: string): Promise<PladwayAdResult> {
    this.logger.log(`Requesting Pladway VAST url=${url}`);

    try {
      const client = new VASTClient();
      const response = (await client.get(url)) as Record<string, unknown>;

      const ads = this.getArray(response.ads);

      this.logger.log(`Pladway VAST response received ads=${ads.length}`);

      if (ads.length === 0) {
        return {
          available: false,
          source: 'PLADWAY_VAST',
          priceCpm: null,
          reason: 'EMPTY_VAST',
        };
      }

      const ad = this.getRecord(ads[0]);
      const creatives = this.getArray(ad.creatives);

      const linearCreative = creatives
        .map((creative) => this.getRecord(creative))
        .find((creative) => creative.type === 'linear');

      if (!linearCreative) {
        this.logger.warn(
          `No linear creative found for adId=${this.toNullableString(ad.id)}`,
        );

        return {
          available: false,
          source: 'PLADWAY_VAST',
          priceCpm: null,
          reason: 'NO_LINEAR_CREATIVE',
          raw: response,
        };
      }

      const mediaFiles = this.getArray(linearCreative.mediaFiles);
      const mediaFile = mediaFiles
        .map((media) => this.getRecord(media))
        .find((media) => {
          const fileUrl = this.toNullableString(media.fileURL);
          return Boolean(fileUrl);
        });

      if (!mediaFile) {
        this.logger.warn(
          `No media file found for adId=${this.toNullableString(ad.id)}`,
        );

        return {
          available: false,
          source: 'PLADWAY_VAST',
          priceCpm: null,
          reason: 'NO_MEDIA_FILE',
          raw: response,
        };
      }

      const result: PladwayAdResult = {
        available: true,
        source: 'PLADWAY_VAST',
        priceCpm: null,
        adId: this.toNullableString(ad.id),
        creativeId:
          this.toNullableString(linearCreative.id) ??
          this.toNullableString(linearCreative.adId),
        durationSeconds: this.toNullableNumber(linearCreative.duration),
        media: {
          url: this.toStringOrThrow(mediaFile.fileURL, 'mediaFile.fileURL'),
          mimeType: this.toNullableString(mediaFile.mimeType),
          deliveryType: this.toNullableString(mediaFile.deliveryType),
          width: this.toNullableNumber(mediaFile.width),
          height: this.toNullableNumber(mediaFile.height),
        },
        impressionUrls: this.extractUrlTemplates(ad.impressionURLTemplates),
        trackingUrls: this.extractTrackingUrls(linearCreative.trackingEvents),
        wrappersResolved: null,
      };

      this.logger.log(
        `Pladway VAST resolved adId=${result.adId ?? 'n/a'} mediaType=${
          result.media.mimeType ?? 'n/a'
        } mediaUrl=${result.media.url}`,
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown VAST resolver error';

      this.logger.error(`Pladway VAST resolver failed: ${errorMessage}`);

      return {
        available: false,
        source: 'PLADWAY_VAST',
        priceCpm: null,
        reason: 'VAST_ERROR',
        errorMessage,
      };
    }
  }

  private extractTrackingUrls(input: unknown): PladwayTrackingUrls {
    const trackingEvents: PladwayTrackingUrls = {
      start: [],
      firstQuartile: [],
      midpoint: [],
      thirdQuartile: [],
      complete: [],
    };

    const events = this.getRecord(input);

    for (const [eventName, value] of Object.entries(events)) {
      trackingEvents[eventName] = this.extractUrlTemplates(value);
    }

    return trackingEvents;
  }

  private extractUrlTemplates(input: unknown): string[] {
    return this.getArray(input)
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        const record = this.getRecord(item);

        return (
          this.toNullableString(record.url) ??
          this.toNullableString(record.URL) ??
          this.toNullableString(record.uri) ??
          this.toNullableString(record.template)
        );
      })
      .filter((url): url is string => Boolean(url));
  }

  private getArray(input: unknown): unknown[] {
    return Array.isArray(input) ? input : [];
  }

  private getRecord(input: unknown): Record<string, unknown> {
    return input !== null && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};
  }

  private toNullableString(input: unknown): string | null {
    return typeof input === 'string' && input.length > 0 ? input : null;
  }

  private toNullableNumber(input: unknown): number | null {
    return typeof input === 'number' && Number.isFinite(input) ? input : null;
  }

  private toStringOrThrow(input: unknown, fieldName: string): string {
    const value = this.toNullableString(input);

    if (!value) {
      throw new Error(`Missing required field: ${fieldName}`);
    }

    return value;
  }
}
