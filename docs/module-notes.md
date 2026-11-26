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

## PR 2: feature/auth

- **PR / branch:** PR 2, `feature/auth` (FR1, FR2)
- **What was built:** `User` model, login with roll + password (bcrypt), `/login`, empty `/student` and `/manager` dashboards. Each role is sent away from the other role's pages. Seed has 1 manager + 4 students (demo password `demo1234`).
- **Main files:** `src/lib/services/auth-service.ts`, `src/lib/services/authorization.ts`, `src/auth.ts`, `src/lib/auth-guard.ts`, `src/app/login/`, `src/app/student/layout.tsx`, `src/app/manager/layout.tsx`, `prisma/seed.ts`
- **Pattern (if any):** none
- **Tests:** `tests/unit/auth-service.test.ts` (right password OK, wrong password refused) and `tests/unit/authorization.test.ts` (student blocked from manager action). Each rule has a `test:` commit before its `feat:` commit.
- **What to say in the viva:** Rules are in `AuthService` and `assertRole`, not in the page. The repository and the password checker are passed in, so tests use mocks. The role layouts call `assertRole` and redirect.
