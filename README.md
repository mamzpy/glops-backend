# GLOPS Backend

Backend service for the GLOPS platform (Green Low Footprint Optimized Platform for Petrol Stations).

Built with NestJS + TypeScript + Prisma + MySQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | Prisma 5 |
| Database | MySQL 8.4 |
| Runtime | Node.js |
| Containerization | Docker |

---

## Current Scope

Current implementation includes:

- Project structure and architectural boundaries
- Configuration module with Joi validation at startup
- Prisma/MySQL integration with two-user database strategy
- Device authentication flow (JWT-based, machine-to-machine)
- Auth guard (`DeviceAuthGuard`) with active device status validation
- `@CurrentDevice()` decorator for typed access to authenticated device context
- Global exception filter with structured JSON error responses
- First protected endpoint (`GET /station/me`)
- Dev seed utility for local bootstrapping

Several integration layers (IFSF, Gilbarco SDK flows, Xibo, messaging/orchestration) are currently placeholders pending SDK documentation and infrastructure decisions.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Required variables:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=                        # min 32 characters
JWT_EXPIRES_IN=24h
DATABASE_URL=                      # runtime user
SHADOW_DATABASE_URL=               # migration user (Prisma shadow DB)
SESSION_INACTIVITY_TIMEOUT=120
SCAN_TIMEOUT=30
PAYMENT_WAIT_TIMEOUT=120
SUSPEND_RECOVERY_TIMEOUT=60
XIBO_API_URL=
XIBO_CLIENT_ID=
XIBO_CLIENT_SECRET=
```

### Start the Database

```bash
docker compose up -d
```

This starts MySQL 8.4 with two users:
- `glops_user` — runtime user, limited permissions
- `glops_migrator` — migration user, elevated permissions for Prisma shadow database

### Run Migrations

```bash
npx prisma migrate dev
```

### Seed Development Data

```bash
npx prisma db seed
```

This creates a test device in the database:

| Field | Value |
|---|---|
| deviceId | `otp-terminal-01` |
| secret | `test-secret` |
| stationId | `station-001` |
| type | `OTP_TERMINAL` |
| status | `ACTIVE` |

The seed uses `upsert` — safe to run multiple times.

### Start the App

```bash
npm run start:dev
```

---

## Authentication Flow

Device authentication is machine-to-machine. OPT terminals authenticate using a `deviceId` + `secret` pair and receive a JWT.

### Login

```
POST /auth/device/login
Content-Type: application/json

{
  "deviceId": "otp-terminal-01",
  "secret": "test-secret"
}
```

Response:

```json
{
  "accessToken": "<jwt>"
}
```

The JWT payload contains:

```json
{
  "sub": "<device uuid>",
  "deviceId": "otp-terminal-01",
  "stationId": "station-001",
  "type": "OTP_TERMINAL",
  "iat": 0000000000,
  "exp": 0000000000
}
```

### Using the Token

Pass the token as a Bearer header on protected endpoints:

```
Authorization: Bearer <accessToken>
```

Devices with status `BLOCKED` or `MAINTENANCE` are rejected at the guard level even with a valid token.

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| POST | `/auth/device/login` | Authenticate a device, receive JWT |

### Protected (requires Bearer token)

| Method | Path | Description |
|---|---|---|
| GET | `/station/me` | Returns station context from authenticated device JWT |

---

## Error Response Format

All errors return a consistent JSON structure via the global exception filter:

```json
{
  "statusCode": 401,
  "timestamp": "2026-05-06T10:06:02.161Z",
  "path": "/station/me",
  "method": "GET",
  "message": "Missing authorization token",
  "error": "Unauthorized"
}
```

Validation errors include an array of messages:

```json
{
  "statusCode": 400,
  "timestamp": "2026-05-06T10:00:00.000Z",
  "path": "/auth/device/login",
  "method": "POST",
  "message": ["deviceId must be a string", "secret should not be empty"],
  "error": "Bad Request"
}
```

---

## Database

### Two-User Strategy

| User | Purpose | Permissions |
|---|---|---|
| `glops_user` | Runtime (NestJS app) | SELECT, INSERT, UPDATE, DELETE on `glops` |
| `glops_migrator` | Migrations (Prisma) | Full access on `glops` + `glops_shadow` |

This follows the principle of least privilege. The app never runs with migration-level permissions.

> **Production note:** In production, runtime and migration users should be managed by the DevOps/DBA team with properly scoped permissions.

### Migrations

```bash
# Create and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply pending migrations (CI/production)
npx prisma migrate deploy

# Reset database (dev only — destroys all data)
npx prisma migrate reset
```

---

## Project Structure

```
src/
├── main.ts                        # App entry point, global pipes, filter, logger
├── app.module.ts                  # Root module, wires everything together

├── modules/                       # Business domain modules
│   ├── auth/                      # Device authentication, JWT issuance
│   │   ├── dto/                   # Auth-specific request/response shapes
│   │   └── types/                 # Auth-specific payload/request types
│   ├── station/                   # Station context, device registration
│   ├── session/                   # Session lifecycle, cart, timeouts
│   ├── catalog/                   # Products, templates, station overrides
│   ├── order/                     # Order creation and state machine
│   │   └── dto/
│   ├── payment/                   # Payment attempts, reconciliation
│   │   └── dto/
│   ├── fulfillment/               # Device command orchestration
│   │   ├── commands/
│   │   └── dto/
│   └── content/                   # Xibo integration, screen state orchestration

├── common/                        # NestJS cross-cutting concerns
│   ├── guards/                    # DeviceAuthGuard
│   ├── decorators/                # @CurrentDevice()
│   ├── filters/                   # HttpExceptionFilter (global)
│   ├── interceptors/              # Logging, response transformation (placeholder)
│   └── exceptions/                # Custom exception classes (placeholder)

├── shared/                        # Pure TypeScript — no NestJS dependencies
│   ├── enums/                     # SessionStatus, OrderStatus, PaymentStatus etc.
│   ├── types/                     # Plain interfaces, safe to share with frontend
│   └── constants/                 # Timeout defaults, event names, currency codes

├── infrastructure/                # External integrations
│   ├── database/                  # PrismaService, DatabaseModule
│   ├── messaging/                 # Async event layer (placeholder)
│   ├── sdk/                       # Gilbarco SDK contracts/adapters (placeholder)
│   ├── ifsf/                      # HyperITech/IFSF adapter (placeholder)
│   └── external/
│       ├── xibo/                  # Xibo API client (placeholder)
│       ├── loyalty/               # Loyalty/private card validation (placeholder)
│       └── payment/               # Payment provider clients (placeholder)

└── config/
    ├── configuration.ts           # Typed config factory
    └── validation.schema.ts       # Joi schema — validates env at startup
```

---

## Architecture Decisions

**DTOs stay inside modules**
DTOs are endpoint-specific and contain NestJS/class-validator decorators. They are not shared across modules. Only stable plain TypeScript types in `shared/types/` are candidates for sharing.

**`shared/` contains no NestJS dependencies**
`shared/enums/`, `shared/types/`, `shared/constants/` are pure TypeScript. No framework imports. Safe to reference from anywhere, including future shared packages.

**`infrastructure/` for all external concerns**
Database, messaging, SDK bridge, IFSF, Xibo, and payment providers all live under `infrastructure/`. Business logic in `modules/` should avoid importing external SDKs directly.

**Device authentication is machine-to-machine**
OPT terminals authenticate with a `deviceId` + `secret` credential pair. The `stationId` is always derived from the authenticated JWT — never trusted from the request body.

**Enum strategy**
Prisma enums (defined in `schema.prisma`) are the source of truth for persisted states and imported from `@prisma/client`. Application-only enums that are not persisted live in `shared/enums/`. As new models are added to the schema, their enums migrate from `shared/enums/` to Prisma.

---

## Architectural Approach

- **Async-first** — orders, payments, fulfillment, and SDK interactions are naturally asynchronous
- **Event-driven architecture** under evaluation for orchestration and integration flows
- **Clear separation of responsibilities:**
  - Session = user interaction lifecycle
  - Order = business entity and source of truth
  - Payment = external async process, observer/reconciler only
  - Fulfillment = device execution, command-based
- **Adapter-oriented integrations** — external systems isolated behind infrastructure boundaries
- **Vendor-agnostic mindset** — business logic avoids tight coupling to specific third-party platforms

---

## Key Conventions

- `stationId` always comes from the JWT token, never from the request body
- Persisted state enums are defined in Prisma and imported from `@prisma/client`
- Every command needs a `correlationId` and `idempotencyKey`
- `UNKNOWN` state is never treated as `FAILED`
- Session ending does not mean order/payment ending — they are independent lifecycles

---

## Future Considerations

- **Caching layer (Redis):** for session handling, catalog resolution, and performance
- **Token lifecycle:** current device tokens use fixed expiry — refresh strategy to be evaluated
- **IFSF integration:** full specification pending from Gilbarco
- **Offline handling:** OPT terminals can go offline — session recovery and reconciliation need further definition
- **Local vs central persistence:** some station/catalog/session data may require local caching or sync at terminal level