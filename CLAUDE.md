# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## 📍 Start here every session

**Read [`dev-notes/STATUS.md`](./dev-notes/STATUS.md) first** — it's the single
source of truth for where the project currently stands ("where did we leave
off?"). Then open the relevant [`dev-notes/tasks/`](./dev-notes/tasks/) file for
detail.

**Before ending a work session, update `STATUS.md`** and the active task's
progress log so the next session can pick up cleanly. See
[`dev-notes/README.md`](./dev-notes/README.md) for how the notes system works.

## What this is

`@reuters-graphics/bluprint` — a CLI and library for dead-easy application
scaffolding from reusable "bluprints" (templates hosted in git repos).

> **Note:** the project is mid-rewrite to v1.0.0. The architecture below
> describes the *target* design. Pre-rewrite code is parked in
> [`src/__archive/`](./src/__archive/) for reference and is not part of the build.

## Tech stack

- **Runtime:** Node ≥ 20, ES modules (`"type": "module"`)
- **Language:** TypeScript
- **Package manager:** pnpm (`pnpm@9.13.2`) — **use pnpm, not npm/yarn**
- **Tests:** Vitest (co-located `*.test.ts` files)
- **Validation:** Valibot
- **Build:** Rollup v4 → `dist/`
- **Prompts:** `@clack/prompts` (wrapped in [`src/prompts/`](./src/prompts/))
- **CLI framework:** `sade`
- **Docs:** Astro + Starlight (source in [`docs/`](./docs), *not* `src`)
- **Releases:** changesets
- **Lint/format:** eslint + prettier via `@reuters-graphics/yaks-*` shared configs

## Common commands

```bash
pnpm test            # run tests (vitest)
pnpm coverage        # tests with coverage
npx tsc --noEmit     # typecheck
pnpm build           # build the library + CLI to dist/ (rollup)
pnpm lint            # eslint --fix
pnpm format          # prettier --write
pnpm docs:dev        # run the docs site locally (astro dev)
pnpm build:docs      # build docs site
```

## Architecture (target v1 design)

Source lives in [`src/`](./src):

- **`config/`** — a bluprint's typed `bluprint.config.ts` (authored with
  `defineConfig`). `Config` singleton loads it via `jiti`
  ([`load.ts`](./src/config/load.ts)); [`fetch.ts`](./src/config/fetch.ts) reads
  it locally (`file://…`) or remotely over HTTPS from the repo.
- **`profile/`** — the user's own config at `~/.bluprint/profile.json` (GitHub
  token + installed bluprints). Use the `profile` singleton
  (`profile.token`, `.addBluprint()`, `.removeBluprint()`).
- **`context/`** — a `context` singleton holding the resolved config for a run.
- **`prompts/`** — thin typed wrappers over `@clack/prompts`.
- **`commands/`** — one directory per CLI command (`add`, and — being ported from
  `__archive/` — `start`, `clone`, `new`, `remove`, `token`).
- **`index.ts`** — public library entry (exports `defineConfig`).
- **`cli.ts`** — CLI entry (bin `bluprint`). *Not yet recreated in the rewrite.*

The key API shift: bluprints are configured with a **`bluprint.config.ts`**
module, replacing the old `.bluprintrc` JSON.

## Conventions

- Tests are co-located with source as `*.test.ts`.
- Prefer the shared `prompts/` wrappers over calling `@clack/prompts` directly.
- Don't add code to `src/__archive/` — it's a read-only reference for porting.
- Use absolute dates in notes/changesets, never relative ones.
