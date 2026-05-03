# GLOPS Backend

Backend service for the GLOPS platform (Green Low Footprint Optimized Platform for Petrol Stations).

Built with **NestJS + TypeScript + Prisma + MySQL**.

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

Current implementation focuses on:
- project structure and architectural boundaries
- configuration and validation
- Prisma/MySQL integration
- device authentication flow (JWT-based)
- initial domain/module organization

Several integration layers (IFSF, Gilbarco SDK flows, Xibo, messaging/orchestration) are currently placeholders pending additional SDK documentation and infrastructure decisions.

## Project Structure

```
src/
├── main.ts                        # App entry point, global pipes, logger
├── app.module.ts                  # Root module, wires everything together

├── modules/                       # Business domain modules
│   ├── auth/                      # Device authentication, JWT issuance
│   ├── station/                   # Station data, device registration
│   ├── session/                   # Session lifecycle, cart, timeouts
│   ├── catalog/                   # Products, templates, station overrides
│   ├── order/                     # Order creation and state machine
│   │   └── dto/                   # Order-specific request/response shapes
│   ├── payment/                   # Payment attempts, reconciliation
│   │   └── dto/                   # Payment-specific request/response shapes
│   ├── fulfillment/               # Device command orchestration and fulfillment flows
│   │   ├── commands/              # Command models and handlers
│   │   └── dto/                   # Fulfillment-specific shapes
│   └── content/                   # Advertising/content orchestration, Xibo integration, screen state

├── common/                        # NestJS cross-cutting concerns
│   ├── guards/                    # DeviceAuthGuard and others
│   ├── decorators/                # @CurrentDevice() and others
│   ├── filters/                   # Global exception filters
│   ├── interceptors/              # Logging, response transformation
│   └── exceptions/                # Custom exception classes

├── shared/                        # Pure TypeScript, no NestJS dependencies
│   ├── enums/                     # OrderStatus, PaymentStatus, SessionStatus etc.
│   ├── types/                     # Plain interfaces, safe to share with FE
│   └── constants/                 # Timeout defaults, event names, currency codes

├── infrastructure/                # External integrations
│   ├── database/                  # PrismaService, DatabaseModule
│   ├── messaging/                 # Async orchestration and integration flow coordination
│   ├── sdk/                       # Gilbarco OpenOSP SDK integration layer (CefSharp/browser bridge)
│   ├── ifsf/                      # IFSF integration/adaptation layer
│   └── external/
│       ├── xibo/                  # Xibo API client / content integration
│       ├── loyalty/               # Loyalty/private card validation
│       └── payment/               # External/mobile payment integration clients

└── config/
    ├── configuration.ts           # Config factory, typed access
    └── validation.schema.ts       # Joi schema, validates env at startup
```

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

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

Required variables:

```
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

### Start the App

```bash
npm run start:dev
```

---

## Database

### Two-User Strategy

The project uses two separate MySQL users by design:

| User | Purpose | Permissions |
|---|---|---|
| `glops_user` | Runtime (NestJS app) | SELECT, INSERT, UPDATE, DELETE on `glops` |
| `glops_migrator` | Migrations (Prisma) | Full access on `glops` + `glops_shadow` |

This follows the principle of least privilege. The app never runs with migration-level permissions.

> **Production note:** In production, use separate runtime and migration database users with properly scoped permissions managed by the DevOps/DBA team.

### Migrations

Migrations are managed by Prisma Migrate:

```bash
# Create and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply pending migrations (CI/production)
npx prisma migrate deploy

# Reset database (dev only - destroys all data)
npx prisma migrate reset
```

---

## Architecture Decisions

### DTOs stay inside modules

DTOs are endpoint-specific and contain NestJS/class-validator decorators. They are not shared across modules or with the frontend. Only stable plain TypeScript types in `shared/types/` are candidates for sharing.

### shared/ contains no NestJS dependencies

`shared/enums/`, `shared/types/`, `shared/constants/` must remain pure TypeScript with no framework imports. This keeps them safe to reference from anywhere including future shared packages.

### infrastructure/ for all external concerns

Database, messaging, SDK bridge, IFSF, Xibo, and payment providers all live under `infrastructure/`. Business logic in `modules/` never imports directly from external SDKs — always through the infrastructure layer.


### Device authentication is machine-to-machine

OTP terminals authenticate directly with the backend using a device credential (deviceId + secret → JWT). The `stationId` is always derived from the authenticated token — never trusted from the request body.

User-level authentication/recognition (e.g. loyalty or private cards) is still under analysis and may involve external systems.

---

## Architectural Approach

- Async-first mindset — orders, payments, fulfillment, and SDK interactions are naturally asynchronous
- Event-driven architecture is under evaluation for orchestration and integration flows
- Clear separation of responsibilities:
  - Session = user interaction lifecycle
  - Order = business entity and source of truth
  - Payment = external async process, observer/reconciler only
  - Fulfillment = device execution, command-based
- Adapter-oriented integrations — external systems (Xibo, IFSF, loyalty, payment providers) are isolated behind infrastructure boundaries
- Vendor-agnostic mindset — orchestration/business logic should avoid tight coupling to specific third-party platforms where possible  

---

## Key Conventions

- `stationId` always comes from the JWT token, never from request body
- Persisted state machines should use Prisma enums as the source of truth. Application-only enums may live in `shared/enums/`.
- Every command needs a `correlationId` and `idempotencyKey`
- `UNKNOWN` state is never treated as `FAILED`
- Session ending does not mean order/payment ending — they are independent lifecycles

---

## Future Considerations

- **Caching layer (e.g. Redis):** for session handling, catalog resolution, and performance optimization
- **Token lifecycle:** current device tokens use fixed expiry — refresh strategy to be evaluated
- **IFSF integration:** full specification pending from Gilbarco, may impact fulfillment design
- **Offline handling:** OPT can go offline, so session recovery and reconciliation need further definition
- **Local vs central persistence:** some station/catalog/session data may require local caching or synchronization at terminal level