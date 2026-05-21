# Xibo Integration Adapter

This module contains the current Xibo CMS integration prototype for OR1-109.

The purpose is to prove that the GLOPS backend can interact with Xibo through the official REST API, without direct database access.

## What this module proves

The current implementation proves that the backend can:

- authenticate against Xibo using OAuth2 client credentials
- read Xibo CMS metadata
- read display groups used as scheduling targets
- read layouts/campaign references
- create a schedule event in Xibo
- read scheduled events back from Xibo

This demonstrates a complete backend-to-Xibo round trip:

```txt
GLOPS Backend
  → Xibo REST API authentication
  → read display groups/layouts
  → create schedule event
  → read scheduled event back