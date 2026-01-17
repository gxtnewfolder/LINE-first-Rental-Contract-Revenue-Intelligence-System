# Rental Management System

ระบบจัดการการปล่อยเช่าตึกสำหรับใช้งานภายในครอบครัว (2 ตึก, ~10 ห้อง)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **ORM**: Prisma v7
- **Database**: PostgreSQL 16 (Docker)
- **Runtime**: Bun / Node.js 18+
- **Styling**: Tailwind CSS 4

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Setup environment
cp .env.example .env.local

# 3. Install dependencies
bun install

# 4. Run migrations
bunx prisma migrate dev

# 5. Seed test data
bunx prisma db seed

# 6. Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
rental-system/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Admin web UI routes
│   ├── api/                  # API routes
│   │   ├── webhooks/line/    # LINE webhook
│   │   ├── cron/             # Cron job endpoints
│   │   ├── buildings/        # Building CRUD
│   │   ├── rooms/            # Room CRUD
│   │   ├── tenants/          # Tenant CRUD
│   │   ├── contracts/        # Contract management
│   │   ├── payments/         # Payment tracking
│   │   └── analytics/        # Reports & stats
│   ├── sign/[contractId]/    # Public signature page
│   └── generated/prisma/     # Prisma generated client
│
├── domain/                   # Business logic (pure functions)
│   ├── contract/             # Contract FSM & validation
│   ├── payment/              # Payment status transitions
│   ├── inflation/            # Rent adjustment logic
│   └── analytics/            # Report types
│
├── services/                 # Service layer
│   ├── building.service.ts
│   ├── room.service.ts
│   ├── tenant.service.ts
│   ├── contract.service.ts
│   ├── payment.service.ts
│   ├── analytics.service.ts
│   └── notification.service.ts
│
├── integrations/             # External services
│   ├── line/                 # LINE Messaging API
│   └── pdf/                  # PDF generation
│
├── ai/                       # AI modules (decision support)
│   ├── summary/              # Thai language summaries
│   ├── anomaly/              # Income anomaly detection
│   └── rent/                 # Rent adjustment advisor
│
├── lib/                      # Shared utilities
│   ├── db.ts                 # Prisma client singleton
│   └── config.ts             # Environment config
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Migration history
│   └── seed.ts               # Test data
│
├── docs/                     # Design documentation
│   ├── architecture.md
│   ├── contract-automation.md
│   ├── line-integration.md
│   ├── analytics.md
│   ├── rent-adjustment.md
│   └── ai-insights.md
│
└── docker-compose.yml        # PostgreSQL container
```

## Available Scripts

```bash
# Development
bun run dev         # Start dev server
bun run build       # Build for production
bun run lint        # Run ESLint

# Database
bun run db:up       # Start PostgreSQL
bun run db:down     # Stop PostgreSQL
bun run db:reset    # Reset database (loses data!)

# Prisma
bunx prisma studio  # Open database GUI
bunx prisma migrate dev --name <name>  # Create migration
bunx prisma db seed # Seed test data
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `LINE_CHANNEL_ACCESS_TOKEN` - LINE API token
- `LINE_CHANNEL_SECRET` - LINE webhook secret
- `OWNER_LINE_IDS` - Authorized owner LINE user IDs

## Documentation

Design documents are in the `docs/` folder:
- [Architecture](docs/architecture.md)
- [Contract Automation](docs/contract-automation.md)
- [LINE Integration](docs/line-integration.md)
- [Analytics](docs/analytics.md)
- [Rent Adjustment](docs/rent-adjustment.md)
- [AI Insights](docs/ai-insights.md)

## License

Private - Family Internal Use
