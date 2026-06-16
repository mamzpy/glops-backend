# Pladway Integration

This module contains the first backend integration with Pladway for the OR1-213 verification activity.

The goal of this integration is to verify which information can be retrieved from Pladway responses and how it can be used by the Composer flow.

## Scope

The current implementation focuses on:

* requesting ads from Pladway VAST endpoints;
* parsing VAST responses with a maintained VAST parser;
* extracting playable creative/media information;
* extracting impression/tracking URLs;
* exposing the result to the Composer preview flow;
* confirming playback impressions through the backend.

The VAST parsing is handled with:

```bash
@dailymotion/vast-client
```

## Implemented Endpoints

### Test Pladway VAST

```http
GET /pladway/test-vast?type=full
GET /pladway/test-vast?type=empty
GET /pladway/test-vast?type=wrapper
GET /pladway/test-vast?type=html5
```

This endpoint calls predefined Pladway VAST URLs and returns a normalized backend response.

Example:

```bash
curl "http://localhost:3000/pladway/test-vast?type=full"
```

### Composer Preview by OPT ID

```http
GET /composer/ad-preview?optId=opt-terminal-03
```

This endpoint simulates an OPT requesting the next ad decision from Composer.

Example:

```bash
curl "http://localhost:3000/composer/ad-preview?optId=opt-terminal-03"
```

### Composer Preview for Authenticated Device

```http
GET /composer/ad-preview/me
```

This endpoint uses the authenticated device token to resolve the OPT/station context.

Example flow:

```bash
TOKEN=$(curl -s -X POST "http://localhost:3000/auth/device/login" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"opt-terminal-03"}' | jq -r '.accessToken')

curl "http://localhost:3000/composer/ad-preview/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Confirm Impression After Playback

```http
POST /composer/ad-playback/impression
```

This endpoint confirms that playback happened and then fires the impression URL through the backend.

Example:

```bash
curl -X POST "http://localhost:3000/composer/ad-playback/impression" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "PLADWAY",
    "optId": "opt-terminal-03",
    "stationId": "station-001",
    "adId": "example-ad-id",
    "creativeId": "example-creative-id",
    "impressionUrls": [
      "https://dmp.pladway.com/example-impression-url"
    ]
  }'
```

Impression URLs are validated before being called.
Currently allowed Pladway hosts:

* `dmp.pladway.com`
* `ad.pladway.com`

## Demo Device Mapping

Seed data includes the following demo OPT/station mapping:

| Station       | OPT devices                                             |
| ------------- | ------------------------------------------------------- |
| `station-001` | `opt-terminal-01`, `opt-terminal-03`, `opt-terminal-04` |
| `station-002` | `opt-terminal-02`                                       |

This allows testing both manual and authenticated Composer preview flows.

## Normalized Pladway Result

The Pladway service returns a normalized result that can be consumed by Composer.

Main fields:

```ts
{
  available: boolean;
  source: 'PLADWAY';
  adId?: string | null;
  creativeId?: string | null;
  durationSeconds?: number | null;
  mediaFile?: {
    url: string;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
    delivery?: string | null;
  } | null;
  impressionUrls: string[];
  trackingEvents?: Record<string, string[]>;
  priceCpm?: number | null;
  rawProvider?: string;
}
```

## Verification Findings

### Campaign / Creative Information

The tested VAST responses provide partial creative information, including:

* `adId`
* `creativeId`
* playable media file
* media type
* duration
* impression URL
* tracking events, when available

In the tested VAST responses, complete campaign metadata was not available, such as:

* campaign name
* advertiser name
* targeting details

### Price / CPM

The tested VAST responses do not expose a clear CPM or bid price field.

For this reason, the backend keeps:

```ts
priceCpm: null
```

CPM should be handled only when the official OpenRTB / bid API response structure is available.

### Location / Display Context

The backend can resolve the display context on the GLOPS side through the authenticated OPT device.

Example:

```text
opt-terminal-03 -> station-001
```

This gives Composer the local OPT/station context before requesting or selecting an ad.

The final mapping between GLOPS OPT/station and Pladway placement/location parameters depends on the official Pladway configuration and API documentation.

## Current Composer Decision Behavior

The current Composer preview flow uses Pladway availability to return a simple decision:

* if Pladway returns a valid VAST response with a playable media file, Composer returns `selectedSource = PLADWAY`;
* if Pladway returns an empty response or no playable media, Composer returns `selectedSource = NONE`.

The response includes the extracted Pladway information when available.

## Impression Tracking Flow

The implemented playback confirmation flow is:

1. Composer returns playable media and impression URLs to the client.
2. The client plays the media.
3. After playback confirmation, the client calls the backend impression endpoint.
4. The backend validates the impression URL host.
5. The backend fires the impression URL to Pladway.
6. The backend logs the result.

This keeps impression firing server-side and avoids calling arbitrary external URLs from the client.

## Useful Test Commands

### Build

```bash
npm run build
```

### Test full VAST

```bash
curl "http://localhost:3000/pladway/test-vast?type=full"
```

### Test empty VAST

```bash
curl "http://localhost:3000/pladway/test-vast?type=empty"
```

### Test Composer preview manually

```bash
curl "http://localhost:3000/composer/ad-preview?optId=opt-terminal-03"
```

### Test authenticated Composer preview

```bash
TOKEN=$(curl -s -X POST "http://localhost:3000/auth/device/login" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"opt-terminal-03"}' | jq -r '.accessToken')

curl "http://localhost:3000/composer/ad-preview/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Test impression host validation

Allowed Pladway hosts should be accepted:

```bash
curl -X POST "http://localhost:3000/composer/ad-playback/impression" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "PLADWAY",
    "optId": "opt-terminal-03",
    "stationId": "station-001",
    "adId": "test-ad",
    "creativeId": "test-creative",
    "impressionUrls": [
      "https://dmp.pladway.com/test"
    ]
  }'
```

Non-allowed hosts should be rejected:

```bash
curl -X POST "http://localhost:3000/composer/ad-playback/impression" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "PLADWAY",
    "optId": "opt-terminal-03",
    "stationId": "station-001",
    "adId": "test-ad",
    "creativeId": "test-creative",
    "impressionUrls": [
      "https://example.com/test"
    ]
  }'
```

## Notes

The current implementation confirms that the backend can:

* call Pladway VAST endpoints;
* parse Pladway VAST responses;
* detect full and empty ad responses;
* extract playable media;
* extract impression/tracking information;
* resolve OPT/station context;
* expose the result through Composer;
* fire impression URLs after playback confirmation.

OpenRTB / bid API documentation is required to complete the CPM verification and define the final price-based selection logic.
