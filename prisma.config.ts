// Prisma v7 configuration
import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local development
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://dev:dev@localhost:5433/rental_dev",
  },
});
