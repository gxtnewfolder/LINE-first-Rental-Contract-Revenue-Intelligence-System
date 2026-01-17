# Development Workflow

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Copy environment file
cp .env.example .env.local

# 3. Install dependencies
bun install

# 4. Run migrations
bunx prisma migrate dev

# 5. Seed database
bunx prisma db seed

# 6. Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Commands Reference

### Database

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# Reset database (delete all data)
docker compose down -v
docker compose up -d

# View database logs
docker compose logs -f db
```

### Prisma

```bash
# Create migration after schema changes
bunx prisma migrate dev --name <migration_name>

# Apply migrations (production)
bunx prisma migrate deploy

# Reset database + re-seed
bunx prisma migrate reset

# Generate Prisma client
bunx prisma generate

# Open Prisma Studio (GUI)
bunx prisma studio
```

### Development

```bash
# Start dev server
bun run dev

# Type check
bunx tsc --noEmit

# Lint
bun run lint

# Build for production
bun run build
```

---

## First-time Setup

### 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Bun](https://bun.sh/) (or Node.js 18+)
- [VS Code](https://code.visualstudio.com/) with Prisma extension

### 2. Database Setup

```bash
# Start PostgreSQL container
docker compose up -d

# Verify it's running
docker compose ps
# Should show: rental_pg ... Up (healthy)

# Check connection
docker compose exec db psql -U dev -d rental_dev -c "SELECT 1"
```

### 3. Environment Variables

```bash
# Copy template
cp .env.example .env.local

# Edit with your values (optional for basic dev)
# LINE credentials only needed for LINE features
```

### 4. Database Migration

```bash
# Install dependencies
bun install

# Run initial migration
bunx prisma migrate dev --name init

# Seed test data
bunx prisma db seed

# Verify with Prisma Studio
bunx prisma studio
```

---

## Common Issues

### Port 5432 already in use

```bash
# Find what's using the port
lsof -i :5432

# Either stop the other service or change port in .env.local
POSTGRES_PORT=5433
# Then update DATABASE_URL to use 5433
```

### Prisma client out of sync

```bash
# Regenerate client
bunx prisma generate

# If that doesn't work, delete and reinstall
rm -rf node_modules/.prisma
rm -rf app/generated/prisma
bunx prisma generate
```

### Migration conflicts

```bash
# Reset everything (loses data!)
bunx prisma migrate reset

# Or manually resolve
bunx prisma migrate resolve --applied <migration_name>
```

---

## Project Structure After Setup

```
rental-system/
├── .env.local              # Your local environment (git-ignored)
├── .env.example            # Template for team
├── docker-compose.yml      # PostgreSQL container
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts             # Test data
├── app/
│   └── generated/prisma/   # Generated Prisma client
└── lib/
    └── db.ts               # Prisma singleton
```
