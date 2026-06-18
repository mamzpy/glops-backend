export interface StoredPladwayMedia {
  storagePath: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string | null;
}

export interface PladwayCacheStorage {
  downloadAndStore(input: {
    sourceUrl: string;
    creativeId: string;
    expectedMimeType?: string | null;
  }): Promise<StoredPladwayMedia>;

  delete(storagePath: string): Promise<void>;
}

export const PLADWAY_CACHE_STORAGE = Symbol('PLADWAY_CACHE_STORAGE');
