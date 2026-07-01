# Status

> Single source of truth for current project state. **Update this before ending
> any work session.** Last updated: **2026-07-01**.

## In one line

Mid-way through the **v1.0.0 rewrite** — tooling migration done; the new
TypeScript-config API is partly built; the CLI builds and runs again, with only
the `add` command wired so far.

## Active work

- **[0001 — v1.0.0 rewrite](./tasks/0001-v1-api-rewrite.md)** — *in progress*.
  Tooling + new `bluprint.config.ts` API + docs site.

## What works right now

- Tooling stack (pnpm, ESM, TS, Vitest, Valibot, changesets, rollup v4, Astro docs) — committed in `ca3eb43`.
- New runtime modules with passing tests: [`config/`](../src/config/), [`profile/`](../src/profile/).
- [`context/`](../src/context/) and [`prompts/`](../src/prompts/) modules in place.
- [`add` command](../src/commands/add/index.ts) ported to the new `profile`/`config` APIs.
- [`src/cli.ts`](../src/cli.ts) recreated (sade) — **builds and runs** (`add` wired; others pending).

## What's broken / unfinished

- Commands `start` / `clone` / `new` / `remove` / `token` not yet ported from `__archive/` (not yet wired in `cli.ts`).
- `actions` (render/copy/move/…) not yet ported to the new API.
- Docs content still describes the old `.bluprintrc` API.
- The v1 changeset text is inaccurate (claims API unchanged).
- Working tree beyond the committed docs system + this session's work is still **uncommitted**.

## Health check (2026-07-01)

| Check | Command | Result |
|---|---|---|
| Tests | `pnpm test` (`vitest run`) | ✅ 33 passing (config + profile) |
| Typecheck | `npx tsc --noEmit` | ✅ clean (`__archive/` excluded) |
| Build | `pnpm build` (`rollup`) | ✅ builds `dist/index.js` + `dist/cli.js` |
| CLI smoke | `node dist/cli.js --help` | ✅ runs, shows banner + `add` |

## Suggested next step

Port the next command from `__archive/` to the new `config`/`profile` API and
wire it into [`src/cli.ts`](../src/cli.ts). `token` is the simplest (just sets
`profile.token`); `start` is the most valuable (consumes a loaded config). See
the task's [plan](./tasks/0001-v1-api-rewrite.md#plan).
