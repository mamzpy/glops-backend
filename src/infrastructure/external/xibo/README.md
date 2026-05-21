# Xibo Integration Adapter

OR1-109 technical prototype. Validates that the GLOPS backend can orchestrate Xibo via REST API without direct database access.

## What is proven

- OAuth2 client credentials authentication
- Read Xibo metadata, displays, display groups, layouts and campaigns
- Create a schedule event
- Read the scheduled event back from Xibo
- Validate the create → read-back round trip

## Run locally

Requires Xibo CMS running locally via Docker and `.env` configured with local Xibo API credentials:

```env
XIBO_API_URL=http://localhost
XIBO_CLIENT_ID=your-client-id
XIBO_CLIENT_SECRET=your-client-secret
```

Start the NestJS backend:

```bash
npm run start:dev
```

By default, the backend runs on:

```txt
http://localhost:3000
```

The `/xibo/*` endpoints are exposed by the NestJS backend. Internally, the backend calls the Xibo CMS API configured by `XIBO_API_URL`.

Demo endpoints:

```txt
GET  http://localhost:3000/xibo/about
GET  http://localhost:3000/xibo/displays
GET  http://localhost:3000/xibo/display-groups
GET  http://localhost:3000/xibo/layouts
GET  http://localhost:3000/xibo/campaigns
POST http://localhost:3000/xibo/schedule-events
GET  http://localhost:3000/xibo/schedule-events?displayGroupId=1
```

Suggested demo flow:

```txt
1. GET  http://localhost:3000/xibo/about
2. GET  http://localhost:3000/xibo/display-groups
3. GET  http://localhost:3000/xibo/layouts
4. POST http://localhost:3000/xibo/schedule-events
5. GET  http://localhost:3000/xibo/schedule-events?displayGroupId=1
```

Note: `displayGroupId=1` and `campaignId=1` are local demo values and may differ in another Xibo environment.

## Open questions

- Xibo behavior when the OPT player is offline
- Real-time switching reliability via XMR
- Proof-of-play retrieval for billing/audit
- Station-to-display-group mapping strategy