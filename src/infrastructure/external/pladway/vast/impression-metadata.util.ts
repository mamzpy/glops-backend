export interface PladwayImpressionMetadata {
  ctsp: number | null;
  priceCpm: number | null;
  impressionMultiplier: number | null;
  estimatedValue: number | null;
  campaignId: number | string | null;
  advertiserId: number | string | null;
  creativeId: string | null;
  displayId: number | string | null;
  timezone: string | null;
  coordinates: {
    lat: number | null;
    lon: number | null;
  } | null;
  raw: Record<string, unknown>;
}

export function extractPladwayMetadataFromImpressionUrl(
  impressionUrl: string | undefined,
): PladwayImpressionMetadata | null {
  if (!impressionUrl) {
    return null;
  }

  try {
    const url = new URL(impressionUrl);
    const encodedData = url.searchParams.get('data');

    if (!encodedData) {
      return null;
    }

    const decoded = Buffer.from(encodedData, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded) as Record<string, unknown>;

    const ctsp = toNullableNumber(parsed.ctsp);
    const priceCpm = ctsp !== null ? ctsp / 1000 : null;

    const pc = toRecord(parsed.pc);
    const impressionMultiplier = toNullableNumber(pc.total);

    const estimatedValue =
      priceCpm !== null && impressionMultiplier !== null
        ? roundToDecimals(priceCpm * impressionMultiplier, 6)
        : null;

    const crd = toRecord(parsed.crd);
    const lat = toNullableNumber(crd.lat);
    const lon = toNullableNumber(crd.lon);

    return {
      ctsp,
      priceCpm,
      impressionMultiplier,
      estimatedValue,
      campaignId: toNullableNumberOrString(parsed.cmp),
      advertiserId: toNullableNumberOrString(parsed.adv),
      creativeId: toNullableString(parsed.cid),
      displayId: toNullableNumberOrString(parsed.did),
      timezone: toNullableString(parsed.tzid),
      coordinates:
        lat !== null || lon !== null
          ? {
              lat,
              lon,
            }
          : null,
      raw: parsed,
    };
  } catch {
    return null;
  }
}

function toRecord(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === 'object'
    ? (input as Record<string, unknown>)
    : {};
}

function toNullableNumber(input: unknown): number | null {
  return typeof input === 'number' && Number.isFinite(input) ? input : null;
}

function toNullableString(input: unknown): string | null {
  return typeof input === 'string' && input.length > 0 ? input : null;
}

function toNullableNumberOrString(input: unknown): number | string | null {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input;
  }

  if (typeof input === 'string' && input.length > 0) {
    return input;
  }

  return null;
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
