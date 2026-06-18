import { Inject, Injectable, Logger } from '@nestjs/common';
import { PladwayCacheStatus } from '@prisma/client';
import { PLADWAY_CACHE_STORAGE } from './pladway-cache-storage.interface';
import type { PladwayCacheStorage } from './pladway-cache-storage.interface';
import { PladwayCacheInput, PladwayCacheResult } from './pladway-cache.types';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PladwayCacheService {
  private readonly logger = new Logger(PladwayCacheService.name);
  private readonly defaultTtlDays = 7;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PLADWAY_CACHE_STORAGE)
    private readonly storage: PladwayCacheStorage,
  ) {}

  async resolve(input: PladwayCacheInput): Promise<PladwayCacheResult> {
    const existing = await this.prisma.pladwayCachedCreative.findUnique({
      where: { creativeId: input.creativeId },
    });

    if (
      existing?.status === PladwayCacheStatus.READY &&
      existing.cachedUrl &&
      (!existing.expiresAt || existing.expiresAt > new Date())
    ) {
      return {
        status: existing.status,
        sourceUrl: input.sourceUrl,
        cachedUrl: existing.cachedUrl,
      };
    }

    const record =
      existing ??
      (await this.prisma.pladwayCachedCreative.create({
        data: {
          adId: input.adId,
          creativeId: input.creativeId,
          sourceUrl: input.sourceUrl,
          mimeType: input.mimeType,
          width: input.width,
          height: input.height,
          durationSeconds: input.durationSeconds,
          status: PladwayCacheStatus.PENDING,
          expiresAt: this.buildExpiresAt(),
        },
      }));

    void this.downloadInBackground(record.creativeId, input);

    return {
      status: record.status,
      sourceUrl: input.sourceUrl,
      cachedUrl: null,
    };
  }

  private async downloadInBackground(
    creativeId: string,
    input: PladwayCacheInput,
  ): Promise<void> {
    try {
      await this.prisma.pladwayCachedCreative.update({
        where: { creativeId },
        data: {
          status: PladwayCacheStatus.DOWNLOADING,
          downloadAttempts: { increment: 1 },
          lastError: null,
          sourceUrl: input.sourceUrl,
        },
      });

      const stored = await this.storage.downloadAndStore({
        sourceUrl: input.sourceUrl,
        creativeId,
        expectedMimeType: input.mimeType,
      });

      await this.prisma.pladwayCachedCreative.update({
        where: { creativeId },
        data: {
          status: PladwayCacheStatus.READY,
          storagePath: stored.storagePath,
          cachedUrl: stored.publicUrl,
          mimeType: stored.mimeType ?? input.mimeType,
          expiresAt: this.buildExpiresAt(),
          lastError: null,
        },
      });

      this.logger.log(`Cached Pladway creative ${creativeId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await this.prisma.pladwayCachedCreative.update({
        where: { creativeId },
        data: {
          status: PladwayCacheStatus.FAILED,
          lastError: message,
        },
      });

      this.logger.warn(
        `Failed to cache Pladway creative ${creativeId}: ${message}`,
      );
    }
  }

  private buildExpiresAt(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.defaultTtlDays);
    return expiresAt;
  }
}
