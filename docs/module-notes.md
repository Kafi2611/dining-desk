# Module Notes

One section per PR. Fill in after each PR is done.

## Template

- **PR / branch:**
- **What was built:**
- **Main files:**
- **Pattern (if any):**
- **Tests:**
- **What to say in the viva:**

## PR 1: chore/project-setup

- **PR / branch:** PR 1, `chore/project-setup`
- **What was built:** Next.js app, Prisma with `Hall` and `Settings`, Docker setup, Vitest, CI.
- **Main files:** `Dockerfile`, `docker-compose.yml`, `prisma/schema.prisma`, `prisma/seed.ts`, `vitest.config.mts`, `.github/workflows/ci.yml`
- **Pattern (if any):** none
- **Tests:** one placeholder test, so CI is green from day 1.
- **What to say in the viva:** Docker runs the database and the app. CI runs lint, tests and a Docker build on every PR.
