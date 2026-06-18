import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import {
  PladwayCacheStorage,
  StoredPladwayMedia,
} from './pladway-cache-storage.interface';

@Injectable()
export class LocalPladwayCacheStorageService implements PladwayCacheStorage {
  private readonly cacheRoot = join(process.cwd(), 'storage', 'pladway-cache');
  private readonly publicBasePath = '/storage/pladway-cache';

  constructor(private readonly httpService: HttpService) {}

  async downloadAndStore(input: {
    sourceUrl: string;
    creativeId: string;
    expectedMimeType?: string | null;
  }): Promise<StoredPladwayMedia> {
    await fs.mkdir(this.cacheRoot, { recursive: true });

    const response = await firstValueFrom(
      this.httpService.get(input.sourceUrl, {
        responseType: 'stream',
        timeout: 30000,
      }),
    );

    const contentTypeHeader = response.headers['content-type'];
    const mimeType =
      typeof contentTypeHeader === 'string' ? contentTypeHeader : null;

    if (
      input.expectedMimeType &&
      mimeType &&
      !mimeType.toLowerCase().includes(input.expectedMimeType.toLowerCase())
    ) {
      throw new Error(
        `Unexpected media mime type. Expected ${input.expectedMimeType}, received ${mimeType}`,
      );
    }

    const extension = this.resolveExtension(mimeType, input.sourceUrl);
    const fileName = `${input.creativeId}${extension}`;
    const storagePath = join(this.cacheRoot, fileName);

    await pipeline(response.data, createWriteStream(storagePath));

    const stat = await fs.stat(storagePath);

    if (stat.size <= 0) {
      await fs.unlink(storagePath).catch(() => undefined);
      throw new Error('Downloaded media file is empty');
    }

    return {
      storagePath,
      publicUrl: `${this.publicBasePath}/${fileName}`,
      sizeBytes: stat.size,
      mimeType,
    };
  }

  async delete(storagePath: string): Promise<void> {
    await fs.unlink(storagePath).catch(() => undefined);
  }

  private resolveExtension(mimeType: string | null, sourceUrl: string): string {
    if (mimeType?.includes('video/mp4')) return '.mp4';
    if (mimeType?.includes('image/jpeg')) return '.jpg';
    if (mimeType?.includes('image/png')) return '.png';
    if (mimeType?.includes('text/html')) return '.html';

    try {
      const pathname = new URL(sourceUrl).pathname;
      const extension = pathname.match(/\.[a-zA-Z0-9]+$/)?.[0];

      return extension ?? '.bin';
    } catch {
      return '.bin';
    }
  }
}
