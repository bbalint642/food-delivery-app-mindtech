import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Read lazily (not via `env()`) so `prisma generate` also works
    // without a database URL, e.g. during `npm ci` in a Docker build.
    url: process.env.DATABASE_URL,
  },
});
