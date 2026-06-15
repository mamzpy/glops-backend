import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import type {
  PladwayAdResult,
  PladwayImpressionInput,
  PladwayImpressionResponse,
  PladwayImpressionResult,
  PladwayVastExampleType,
} from './pladway.types';
import { PLADWAY_VAST_EXAMPLE_URLS } from './vast/vast.types';
import { VastResolverService } from './vast/vast-resolver.service';

const ALLOWED_PLADWAY_TRACKING_HOSTS = new Set([
  'dmp.pladway.com',
  'ad.pladway.com',
]);

@Injectable()
export class PladwayService {
  private readonly logger = new Logger(PladwayService.name);

  constructor(
    private readonly vastResolverService: VastResolverService,
    private readonly httpService: HttpService,
  ) {}

  async testVast(type: PladwayVastExampleType): Promise<PladwayAdResult> {
    const url = PLADWAY_VAST_EXAMPLE_URLS[type];

    if (!url) {
      throw new BadRequestException(
        `Invalid VAST example type. Supported values: ${Object.keys(
          PLADWAY_VAST_EXAMPLE_URLS,
        ).join(', ')}`,
      );
    }

    return this.vastResolverService.resolve(url);
  }

  async requestAdForOpt(input: {
    optId: string;
    stationId?: string;
    placementId?: string;
  }): Promise<PladwayAdResult> {
    this.logger.log(
      `Requesting Pladway ad for optId=${input.optId}, stationId=${
        input.stationId ?? 'n/a'
      }, placementId=${input.placementId ?? 'n/a'}`,
    );

    // Temporary OR1-213 implementation:
    // use the official Pladway full VAST example until real Pladway key/OpenRTB docs arrive.
    return this.vastResolverService.resolve(PLADWAY_VAST_EXAMPLE_URLS.full);
  }

  async fireImpressions(
    input: PladwayImpressionInput,
  ): Promise<PladwayImpressionResponse> {
    if (input.impressionUrls.length === 0) {
      throw new BadRequestException('At least one impression URL is required');
    }

    this.logger.log(
      `Firing Pladway impressions for optId=${input.optId}, stationId=${
        input.stationId ?? 'n/a'
      }, adId=${input.adId ?? 'n/a'}, creativeId=${
        input.creativeId ?? 'n/a'
      }, count=${input.impressionUrls.length}`,
    );

    const results = await Promise.all(
      input.impressionUrls.map((url) => this.fireSingleImpression(url)),
    );

    const successCount = results.filter((result) => result.success).length;
    const failureCount = results.length - successCount;

    return {
      firedAt: new Date().toISOString(),
      total: results.length,
      successCount,
      failureCount,
      results,
    };
  }

  private async fireSingleImpression(
    url: string,
  ): Promise<PladwayImpressionResult> {
    try {
      this.assertAllowedTrackingUrl(url);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 10_000,
          maxRedirects: 3,
        }),
      );

      return {
        url,
        success: true,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        url,
        success: false,
        statusCode: this.getErrorStatusCode(error),
        errorMessage: this.getErrorMessage(error),
      };
    }
  }

  private assertAllowedTrackingUrl(url: string): void {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('Invalid impression URL');
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Only HTTPS impression URLs are allowed');
    }

    if (!ALLOWED_PLADWAY_TRACKING_HOSTS.has(parsedUrl.hostname)) {
      throw new BadRequestException(
        `Impression URL host is not allowed: ${parsedUrl.hostname}`,
      );
    }
  }

  private getErrorStatusCode(error: unknown): number | null {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
        };
      };

      return axiosError.response?.status ?? null;
    }

    return null;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();

      if (typeof response === 'string') {
        return response;
      }

      if (
        response &&
        typeof response === 'object' &&
        'message' in response &&
        typeof response.message === 'string'
      ) {
        return response.message;
      }
    }

    if (error instanceof InternalServerErrorException) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown impression tracking error';
  }
}
