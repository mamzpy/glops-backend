# Medusa Backend Integration Spike

**Project:** The GLOPS Project  
**Scope:** Medusa evaluation for e-shop / catalog / cart flow  
**Status:** Draft technical note  
**Suggested repository path:** `docs/architecture/medusa-backend-integration-spike.md`

---

## 1. Purpose

This document summarizes the first local backend-oriented evaluation of **Medusa** as a possible commerce engine for the GLOPS e-shop flow.

The goal of this spike is not to define the final architecture yet, but to verify whether Medusa can cover the basic commerce capabilities needed for an OPT e-shop scenario, and to identify where the GLOPS backend would still be required.

The main questions are:

- Can Medusa manage products, variants, prices, inventory and catalog data?
- Can Medusa expose products through APIs?
- Can an anonymous cart be created and managed through APIs?
- Where does Medusa stop being plug-and-play for the GLOPS flow?
- Which responsibilities should remain in the GLOPS backend?

---

## 2. Local Test Environment

The local test was performed with a standard Medusa installation.

### Runtime

- Medusa backend running locally on port `9000`
- PostgreSQL running in Docker
- Medusa Admin available at:

```text
http://localhost:9000/app
```

### Local PostgreSQL container

A dedicated PostgreSQL container was used for this spike:

```bash
docker run --name glops-medusa-postgres \
  -e POSTGRES_USER=medusa \
  -e POSTGRES_PASSWORD=medusa \
  -e POSTGRES_DB=medusa \
  -p 5433:5432 \
  -d postgres:16
```

### Medusa project creation

```bash
npx create-medusa-app@latest glops-medusa-local \
  --db-url "postgres://medusa:medusa@localhost:5433/medusa"
```

The Next.js starter storefront was not installed, because this spike focuses on backend/admin/API capabilities.

---

## 3. Medusa Capabilities Observed

From the Admin dashboard, Medusa provides several built-in commerce concepts:

- Products
- Product variants
- SKUs
- Categories
- Collections
- Inventory
- Stock locations
- Regions
- Sales channels
- Price lists
- Customers
- Orders
- Draft orders
- Promotions
- Publishable API keys
- Store API

This confirms that Medusa is not just a UI/storefront tool. It provides a ready commerce backend and admin system.

---

## 4. GLOPS-style Product Test

A simple GLOPS-style product was created from Medusa Admin.

### Product

```text
Title: Caffè Espresso
Subtitle: Bar
Handle: caffe-espresso
Description: Caffè espresso acquistabile da OPT e ritirabile al bar/stazione.
```

### Variant

```text
Variant: Standard
SKU: BAR-CAFFE-ESPRESSO
Price: 1.20 EUR
Stock: 100
Stock location: European Warehouse
```

The product was published and made available in the default sales channel.

---

## 5. Store API Test

A publishable API key was created in Medusa Admin and used to call the Store API.

### 5.1 Read Products

```bash
curl "http://localhost:9000/store/products" \
  -H "x-publishable-api-key: <PUBLISHABLE_API_KEY>"
```

The API returned the available products, including products, variants, options, SKUs, images and metadata.

### 5.2 Read the GLOPS-style Product by Handle

```bash
curl "http://localhost:9000/store/products?handle=caffe-espresso" \
  -H "x-publishable-api-key: <PUBLISHABLE_API_KEY>"
```

The response included the created product:

```text
Product: Caffè Espresso
SKU: BAR-CAFFE-ESPRESSO
Variant ID: variant_...
Price: 1.20 EUR
```

This confirms that a simple GLOPS-style product can be created in Medusa Admin and exposed through the Store API.

---

## 6. Anonymous Cart Flow Test

The next step was to test whether Medusa supports an anonymous cart flow, which is relevant for an OPT/e-shop scenario where the end user may not be logged in.

### 6.1 Create Cart

```bash
curl -X POST "http://localhost:9000/store/carts" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: <PUBLISHABLE_API_KEY>" \
  -d '{
    "region_id": "<REGION_ID>"
  }'
```

Result:

```text
Cart created successfully
Customer: null
Currency: EUR
Items: []
```

### 6.2 Add Product Variant to Cart

```bash
curl -X POST "http://localhost:9000/store/carts/<CART_ID>/line-items" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: <PUBLISHABLE_API_KEY>" \
  -d '{
    "variant_id": "<VARIANT_ID>",
    "quantity": 1
  }'
```

The cart accepted both:

- a sample Medusa product
- the GLOPS-style product `Caffè Espresso`

After adding `Caffè Espresso`, the cart contained:

```text
Product: Caffè Espresso
SKU: BAR-CAFFE-ESPRESSO
Quantity: 1
Unit price: 1.20 EUR
```

The cart total was recalculated correctly.

### 6.3 Read Cart

```bash
curl "http://localhost:9000/store/carts/<CART_ID>" \
  -H "x-publishable-api-key: <PUBLISHABLE_API_KEY>"
```

The cart was retrievable by ID and contained the expected line items and totals.

---

## 7. API Flow Proven

The following backend/API flow was successfully tested:

```mermaid
sequenceDiagram
    autonumber
    participant Client as Test Client / OPT-like caller
    participant Medusa as Medusa Store API
    participant DB as Medusa DB

    Client->>Medusa: GET /store/products
    Medusa->>DB: Read products, variants, prices
    DB-->>Medusa: Product catalog
    Medusa-->>Client: Products list

    Client->>Medusa: POST /store/carts
    Medusa->>DB: Create anonymous cart
    DB-->>Medusa: Cart record
    Medusa-->>Client: Cart ID

    Client->>Medusa: POST /store/carts/{cartId}/line-items
    Medusa->>DB: Add variant to cart
    DB-->>Medusa: Updated cart
    Medusa-->>Client: Cart with line items and totals

    Client->>Medusa: GET /store/carts/{cartId}
    Medusa->>DB: Read cart state
    DB-->>Medusa: Cart state
    Medusa-->>Client: Cart details
```

This confirms that Medusa can manage the basic product/catalog/cart flow through APIs.

---

## 8. Payment / Checkout Observation

An attempt was made to complete the cart directly:

```bash
curl -X POST "http://localhost:9000/store/carts/<CART_ID>/complete" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: <PUBLISHABLE_API_KEY>"
```

Medusa returned:

```text
Payment collection has not been initiated for cart
```

This is an important finding.

It means that Medusa does not allow direct cart completion immediately after adding items. A payment collection/payment flow must be initiated before the cart can become an order.

For GLOPS, this is likely where custom backend orchestration becomes necessary.

---

## 9. Proposed GLOPS-Oriented Payment Flow

The GLOPS e-shop payment flow is not expected to behave exactly like a standard online ecommerce checkout.

A possible GLOPS-oriented flow is:

```mermaid
sequenceDiagram
    autonumber
    participant OPT_UI as OPT Frontend
    participant GLOPS as GLOPS Backend
    participant MEDUSA as Medusa Commerce Engine
    participant PSP as External PSP

    OPT_UI->>GLOPS: Start e-shop session
    GLOPS->>GLOPS: Validate OPT and resolve station context

    OPT_UI->>GLOPS: Request catalog
    GLOPS->>MEDUSA: Read products for mapped channel/location
    MEDUSA-->>GLOPS: Products, prices, availability
    GLOPS-->>OPT_UI: Station-specific catalog

    OPT_UI->>GLOPS: Add item to cart
    GLOPS->>MEDUSA: Create/update cart
    MEDUSA-->>GLOPS: Cart ID, items, totals
    GLOPS-->>OPT_UI: Cart state

    OPT_UI->>GLOPS: Confirm purchase
    GLOPS->>PSP: Start payment attempt
    PSP-->>GLOPS: Payment result callback

    alt Payment confirmed
        GLOPS->>MEDUSA: Complete checkout / create order
        MEDUSA-->>GLOPS: Medusa order reference
        GLOPS-->>OPT_UI: Order confirmed
    else Payment failed / expired / unknown
        GLOPS-->>OPT_UI: Payment not completed
    end
```

 

This keeps Medusa responsible for commerce primitives while GLOPS remains responsible for station/session/payment orchestration.

---

## 10. Suggested Architecture

Medusa should not replace the GLOPS backend completely.

A more suitable architecture is:

```mermaid
flowchart LR
    OPT_UI[OPT Frontend]
    GLOPS[GLOPS Backend]
    MEDUSA[Medusa Commerce Engine]
    MEDUSA_DB[(Medusa DB)]
    GLOPS_DB[(GLOPS DB)]
    PSP[External PSP]

    OPT_UI -->|GLOPS API| GLOPS
    GLOPS -->|catalog / cart / order APIs| MEDUSA
    MEDUSA --> MEDUSA_DB

    GLOPS -->|session / payment / audit data| GLOPS_DB
    GLOPS -->|payment init / callback| PSP
```

In this model:

- Medusa owns standard commerce data and logic.
- GLOPS owns OPT/session/station/payment/audit logic.
- The OPT frontend calls GLOPS, not Medusa directly, for controlled business flows.

---

## 11. Responsibility Split

| Area | Suggested Owner | Notes |
|---|---|---|
| Products | Medusa | Product catalog and sellable items |
| Variants / SKU | Medusa | Sellable product variants |
| Prices | Medusa | Standard prices and price lists |
| Inventory | Medusa | Stock per location |
| Cart | Medusa | Cart primitives and totals |
| Order primitives | Medusa | Standard commerce order model |
| OPT device authentication | GLOPS Backend | Device identity must not be delegated to Medusa |
| Station / structure context | GLOPS Backend | Determines which catalog/location applies |
| E-shop session | GLOPS Backend | Links OPT session to Medusa cart/order |
| Payment attempts | GLOPS Backend | PSP-specific tracking, callbacks, reconciliation |
| Audit / event history | GLOPS Backend | Stores key flow events such as cart creation, payment attempt, PSP callback and Medusa order creation for traceability and reconciliation. |
| Mapping Medusa ↔ GLOPS | GLOPS Backend | Stores references between GLOPS entities and Medusa entities |
---

## 12. Possible Data Mapping

```mermaid
flowchart TD
    A[Struttura / Station] --> B[Medusa Stock Location]
    A --> C[Medusa Sales Channel]
    D[CatalogoShop] --> E[Medusa Product Catalog / Product Set]
    F[Articolo] --> G[Medusa Product]
    G --> H[Medusa Variant / SKU]
    I[OPT Session] --> J[Medusa Cart]
    K[GLOPS PaymentAttempt] --> L[Medusa Payment / Checkout Flow]
    M[GLOPS Order Reference] --> N[Medusa Order]
```

This mapping is still provisional and should be validated with the functional/domain model.

---

## 13. Key Open Questions

The spike confirms that Medusa can support catalog and cart basics. The main points that still need clarification are:

1. **Station-specific catalog and inventory**
   - Need to decide how a station/struttura maps to Medusa concepts such as sales channel, stock location, metadata or custom model.
   - This is important to understand how each OPT receives the correct products, prices and availability.

2. **Non-shipping / pickup items**
   - The test product `Caffè Espresso` was added to the cart successfully, but the cart line item still had `requires_shipping: true`.
   - For bar/service/pickup items, the correct Medusa modeling must be clarified.

3. **Payment integration**
   - Medusa requires a payment collection before a cart can be completed.
   - GLOPS likely needs to manage the external PSP / QR / mobile payment flow and complete the Medusa checkout only after payment confirmation.

4. **Frontend integration path**
   - For a quick demo, the frontend could call Medusa directly.
   - For the real GLOPS architecture, the frontend should likely call the GLOPS Backend, which then orchestrates Medusa access with OPT, station, session and payment context.
  
---  

## 14. Initial Conclusion

Medusa appears suitable as a candidate commerce engine for standard e-shop capabilities:

- product management
- variant/SKU management
- pricing
- inventory
- stock locations
- sales channels
- anonymous cart creation
- cart line items and totals



The recommended direction is:

```text
Medusa = commerce engine
GLOPS Backend = orchestration and integration layer
OPT Frontend = user interface
```

The local spike confirms that Medusa can cover catalog/cart basics, while payment, fulfillment and station-specific behavior remain the key areas for backend analysis and customization.
