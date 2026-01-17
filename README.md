# Next.js + Prisma 7 Starter Template

A modern full-stack web application template combining [Next.js 16](https://nextjs.org) with [Prisma 7](https://www.prisma.io) for type-safe database access, featuring React 19, TypeScript, Tailwind CSS, and ESLint.

## Tech Stack

- **Framework**: [Next.js 16.1.1](https://nextjs.org) - React framework with App Router
- **ORM**: [Prisma 7.2.0](https://www.prisma.io) - Type-safe database toolkit
- **Database**: SQLite (configured, adapters for PostgreSQL and LibSQL included)
- **UI**: [React 19.2.3](https://react.dev) with [Tailwind CSS 4](https://tailwindcss.com)
- **Language**: [TypeScript 5](https://www.typescriptlang.org)
- **Styling**: PostCSS with Tailwind CSS
- **Linting**: [ESLint 9](https://eslint.org)

## Prerequisites

- Node.js 18+ (or equivalent runtime)
- npm, yarn, pnpm, or bun package manager

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Configure Database

Edit `prisma/schema.prisma` to set up your database:

```prisma
datasource db {
  provider = "sqlite"  # or "postgresql", "libsql", etc.
  url      = env("DATABASE_URL")
}
```

For SQLite, create a `.env.local` file:

```env
DATABASE_URL="file:./dev.db"
```

For PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### 3. Set Up Database Schema

Create your data models in `prisma/schema.prisma`, then migrate:

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

Configure the seed script in `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view your application.

## Project Structure

```
next-prisma7/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   └── generated/               # Auto-generated Prisma Client
│       └── prisma/
│           ├── client.ts        # Prisma Client
│           ├── models.ts        # Data models
│           └── enums.ts         # Enum types
├── lib/
│   └── db.ts                    # Prisma Client singleton
├── prisma/
│   ├── schema.prisma            # Data schema
│   └── seed.ts                  # Database seeding script
├── public/                      # Static assets
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
└── eslint.config.mjs            # ESLint configuration
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Database Management

### Prisma Studio

Inspect and manage your database visually:

```bash
npx prisma studio
```

### Database Migrations

Create a new migration after schema changes:

```bash
npx prisma migrate dev --name <migration_name>
```

Reset the database (development only):

```bash
npx prisma migrate reset
```

### Generate Prisma Client

Regenerate Prisma Client after schema changes:

```bash
npx prisma generate
```

## Using Prisma Client

Access the database from your Next.js app via the singleton instance in `lib/db.ts`:

```typescript
import { db } from '@/lib/db'

// Example: Query users
const users = await db.user.findMany()

// Example: Create a record
const newUser = await db.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
})
```

## Database Adapters

This project includes adapters for multiple database systems:

- **SQLite**: `@prisma/adapter-better-sqlite3` or `@prisma/adapter-libsql`
- **PostgreSQL**: `@prisma/adapter-pg`

Switch providers in `prisma/schema.prisma` and update your connection string.

## Type Safety

All database queries are fully type-safe. TypeScript automatically infers types from your Prisma schema:

```typescript
// Types are inferred from schema
const user: typeof db.$types.result.User = await db.user.findFirst()
```

## Styling

Tailwind CSS is pre-configured with PostCSS. Add utility classes directly to your components:

```tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <h1 className="text-4xl font-bold text-white">Welcome</h1>
    </div>
  )
}
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn Tutorial](https://nextjs.org/learn)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## Deployment

### Vercel (Recommended)

Deploy directly from your Git repository:

```bash
vercel deploy
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

## Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL="file:./dev.db"
```

For production, set these in your deployment platform (Vercel, Docker, etc.).

## Troubleshooting

### Prisma Client not found
Regenerate the client:
```bash
npx prisma generate
```

### Database connection errors
Verify `DATABASE_URL` is correct and the database server is running.

### Type errors after schema changes
Regenerate Prisma Client and rebuild:
```bash
npx prisma generate
npm run build
```

## Contributing

Feel free to fork and customize this template for your projects.

## License

MIT

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
