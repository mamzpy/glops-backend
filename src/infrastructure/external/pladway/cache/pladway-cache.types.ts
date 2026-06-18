import { PladwayCacheStatus } from '@prisma/client';

export interface PladwayCacheInput {
  adId: string | null;
  creativeId: string;
  sourceUrl: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
}

export interface PladwayCacheResult {
  status: PladwayCacheStatus;
  sourceUrl: string;
  cachedUrl: string | null;
}
