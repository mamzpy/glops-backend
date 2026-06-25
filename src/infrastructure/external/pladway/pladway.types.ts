import type { PladwayImpressionMetadata } from './vast/impression-metadata.util';

export type PladwayVastExampleType = 'full' | 'empty' | 'wrapper' | 'html5';

export type PladwayAdSource = 'PLADWAY_VAST';

export interface PladwayMediaFile {
  url: string;
  cachedUrl?: string | null;
  cacheStatus?: string | null;
  mimeType: string | null;
  deliveryType: string | null;
  width: number | null;
  height: number | null;
}

export interface PladwayTrackingUrls {
  start: string[];
  firstQuartile: string[];
  midpoint: string[];
  thirdQuartile: string[];
  complete: string[];
  [eventName: string]: string[];
}

export interface PladwayAdAvailableResult {
  available: true;
  source: PladwayAdSource;
  priceCpm: number | null;
  impressionMultiplier: number | null;
  estimatedValue: number | null;
  pladwayMetadata: PladwayImpressionMetadata | null;
  adId: string | null;
  creativeId: string | null;
  durationSeconds: number | null;
  media: PladwayMediaFile;
  impressionUrls: string[];
  trackingUrls: PladwayTrackingUrls;
  wrappersResolved: number | null;
  raw?: unknown;
}

export interface PladwayAdUnavailableResult {
  available: false;
  source: PladwayAdSource;
  priceCpm?: number | null;
  impressionMultiplier?: number | null;
  estimatedValue?: number | null;
  pladwayMetadata?: PladwayImpressionMetadata | null;
  reason: 'EMPTY_VAST' | 'NO_LINEAR_CREATIVE' | 'NO_MEDIA_FILE' | 'VAST_ERROR';
  errorMessage?: string;
  raw?: unknown;
}

export type PladwayAdResult =
  | PladwayAdAvailableResult
  | PladwayAdUnavailableResult;

export interface PladwayImpressionInput {
  optId: string;
  stationId?: string;
  adId?: string | null;
  creativeId?: string | null;
  impressionUrls: string[];
}

export interface PladwayImpressionResult {
  url: string;
  success: boolean;
  statusCode: number | null;
  errorMessage?: string;
}

export interface PladwayImpressionResponse {
  firedAt: string;
  total: number;
  successCount: number;
  failureCount: number;
  results: PladwayImpressionResult[];
}
