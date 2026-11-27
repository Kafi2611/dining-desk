# Merge conflict: PR 4 (meal-tokens) and PR 5 (transaction-history)

## Which files
1. `prisma/schema.prisma`
2. `src/lib/container.ts`
3. `docs/module-notes.md`

## Why it happened
`feature/meal-tokens` and `feature/transaction-history` were both created from the same `main` commit (`906d409`).
Both branches added their changes at the **end** of the same file, or in the same lines:

- `schema.prisma`: PR 4 added the `MealType` / `TokenKind` enums and the `MealToken` model at the end. PR 5 added the `HistorySort` enum at the end.
- `container.ts`: PR 4 added the token imports and `TokenService`. PR 5 added the history imports and `historyService`. Both edited the same import lines.
- `module-notes.md`: both PRs added a new section at the end of the file.

PR 4 was merged first. Git could not decide how to combine the two edits in PR 5, so it showed "This branch has conflicts".

## How it was fixed
1. `git fetch`, then updated local `main`, then `git merge main` on `feature/transaction-history`.
2. Opened each file, found the `<<<<<<<`, `=======`, `>>>>>>>` markers and kept **both** sides:
   - `schema.prisma`: `MealToken` part first, then the `HistorySort` enum. The `User.mealTokens` relation from PR 4 and the `Transaction` index from PR 5 merged by themselves.
   - `container.ts`: kept both sets of imports, `historyService` and `tokenService`.
   - `module-notes.md`: kept the PR 4 section and the PR 5 section.
3. Ran `prisma generate`. Ran `prisma migrate deploy` on a fresh test database (both migrations apply) and `prisma migrate diff` (no difference). Applied on the dev database.
4. Ran lint and all unit tests (91 pass).
5. Committed `fix(merge): resolve schema.prisma conflict with meal-tokens` and pushed.
