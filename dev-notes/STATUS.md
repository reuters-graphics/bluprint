# Status

> Single source of truth for current project state. **Update this before ending
> any work session.** Last updated: **2026-07-01**.

## In one line

Mid-way through the **v1.0.0 rewrite** — tooling migration is done and committed;
the new TypeScript-config API is partly built; the CLI doesn't build yet.

## Active work

- **[0001 — v1.0.0 rewrite](./tasks/0001-v1-api-rewrite.md)** — *in progress*.
  Tooling + new `bluprint.config.ts` API + docs site.

## What works right now

- Tooling stack (pnpm, ESM, TS, Vitest, Valibot, changesets, rollup v4, Astro docs) — committed in `ca3eb43`.
- New runtime modules with passing tests: [`config/`](../src/config/), [`profile/`](../src/profile/).
- [`context/`](../src/context/) and [`prompts/`](../src/prompts/) modules in place.

## What's broken / unfinished

- ⛔ **Build fails** — no `src/cli.ts` (only in `__archive/`), but rollup + `bin` expect it.
- ⛔ **`add` command broken** — [`src/commands/add/index.ts`](../src/commands/add/index.ts) uses removed profile functions + an undefined var.
- Commands `start` / `clone` / `new` / `remove` / `token` not yet ported from `__archive/`.
- `actions` (render/copy/move/…) not yet ported to the new API.
- `src/__archive/` still in `tsconfig` scope → `tsc` dirty.
- Docs content still describes the old `.bluprintrc` API.
- The v1 changeset text is inaccurate (claims API unchanged).
- Entire working tree is **uncommitted**.

## Health check (2026-07-01)

| Check | Command | Result |
|---|---|---|
| Tests | `pnpm test` (`vitest run`) | ✅ 33 passing (config + profile) |
| Typecheck | `npx tsc --noEmit` | ⚠️ 7 errors (all in `__archive/` + `add`) |
| Build | `pnpm build` (`rollup`) | ⛔ fails — missing `src/cli.ts` |

## Suggested next step

Fix the `add` command against the new `profile`/`config` APIs, then create
`src/cli.ts` (with `sade`) to restore an end-to-end, buildable path — then port
the remaining commands one at a time. See the task's
[plan](./tasks/0001-v1-api-rewrite.md#plan).
