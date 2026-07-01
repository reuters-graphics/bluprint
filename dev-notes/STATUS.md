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
- **[0002 — Actions function API](./tasks/0002-actions-function-api.md)** —
  *done* (docs deferred). 8 actions as typed factory functions + runner.

## What works right now

- Tooling stack (pnpm, ESM, TS, Vitest, Valibot, changesets, rollup v4, Astro docs) — committed in `ca3eb43`.
- New runtime modules with passing tests: [`config/`](../src/config/), [`profile/`](../src/profile/).
- [`context/`](../src/context/) and [`prompts/`](../src/prompts/) modules in place.
- [`add`](../src/commands/add/index.ts), [`token`](../src/commands/token/index.ts), [`remove`](../src/commands/remove/index.ts), and [`start`](../src/commands/start/index.ts) commands ported to the new `profile`/`config`/`actions` APIs (with tests).
- [`src/cli.ts`](../src/cli.ts) recreated (sade) — **builds and runs** (`add` + `start` + `token` + `remove` wired; `clone`/`new` pending).
- [`src/actions/`](../src/actions/) — 13 actions as typed factory functions (copy/move/remove/render/regexreplace/execute/log/prompt/run/json/append/prepend/yaml) + `runActions` runner (with `failOnError`), exported from the package root (task 0002).

## What's broken / unfinished

- Commands `clone` / `new` not yet ported from `__archive/` (not yet wired in `cli.ts`).
- `start` scaffolds **remote git bluprints only** — `file://` local bluprints are rejected for now (deferred).
- `start` hasn't been run against a real bluprint repo end-to-end yet (no v1 `bluprint.config.ts` repo to test against); logic is unit-tested with a tar fixture.
- `actions` (render/copy/move/…) not yet ported to the new API.
- Docs content still describes the old `.bluprintrc` API.
- The v1 changeset text is inaccurate (claims API unchanged).
- Working tree beyond the committed docs system + this session's work is still **uncommitted**.

## Health check (2026-07-01)

| Check | Command | Result |
|---|---|---|
| Tests | `pnpm test` (`vitest run`) | ✅ 118 passing (config + profile + token + remove + start + actions) |
| Lint | `pnpm lint` (`eslint`) | ✅ clean (`__archive/` ignored) |
| Typecheck | `npx tsc --noEmit` | ✅ clean (`__archive/` excluded) |
| Build | `pnpm build` (`rollup`) | ✅ builds `dist/index.js` + `dist/cli.js` |
| CLI smoke | `node dist/cli.js --help` | ✅ runs, shows banner + `add` + `start` + `remove` + `token` |

## Suggested next step

End-to-end test `start` against a real v1 bluprint repo (one with a
`bluprint.config.ts`) — the last unverified path. Then port the remaining
commands: **`clone`** (clone a repo that has a bluprint) and **`new`** (scaffold
a new `bluprint.config.ts`) from `__archive/`. After that: docs rewrite for the
new API + fix the inaccurate v1 changeset.

> ⚠️ When testing commands that touch the `profile` singleton, **seed state in
> `beforeEach`** — mock-fs doesn't reliably reset the singleton's writes between
> tests. See task 0001's blockers note.
