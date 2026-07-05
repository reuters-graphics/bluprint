# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## 📍 Start here every session

**Read [`.agents/STATUS.md`](./.agents/STATUS.md) first** — it's the single
source of truth for where the project currently stands ("where did we leave
off?"). Then open the relevant [`.agents/tasks/`](./.agents/tasks/) file for
detail.

**Before ending a work session, update `STATUS.md`** and the active task's
progress log so the next session can pick up cleanly. See
[`.agents/README.md`](./.agents/README.md) for how the notes system works.

## What this is

`@reuters-graphics/bluprint` — a CLI and library for dead-easy application
scaffolding from reusable "bluprints" (templates hosted in git repos). Shipped as
v1.0.0: a typed `bluprint.config.ts` API replacing the old `.bluprintrc` JSON.

## Tech stack

- **Runtime:** Node ≥ 20, ES modules (`"type": "module"`)
- **Language:** TypeScript
- **Package manager:** pnpm (`pnpm@9.13.2`) — **use pnpm, not npm/yarn**
- **Tests:** Vitest (co-located `*.test.ts` files; a network E2E in `src/__e2e__/`)
- **Build:** Rollup v4 → `dist/` (separate `index.js` library + `cli.js` bin)
- **Templating:** mustache (default) / ejs, via the `render` action
- **Prompts:** `@clack/prompts` (wrapped in [`src/prompts/`](./src/prompts/))
- **CLI framework:** `sade`
- **Docs:** Astro + Starlight (source in [`docs/`](./docs), _not_ `src`)
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
pnpm knip            # find unused deps / exports
pnpm publint         # validate the publishable package
pnpm docs:dev        # run the docs site locally (astro dev)
pnpm build:docs      # build docs site
```

> CI also runs `pnpm exec prettier . --check` — run `pnpm format` before pushing,
> or the Lint workflow fails on unformatted files.

## Architecture

Source lives in [`src/`](./src):

- **`config/`** — a bluprint's typed `bluprint.config.ts` (authored with
  `defineConfig`). `Config` singleton loads it via `jiti`
  ([`load.ts`](./src/config/load.ts), which aliases `@reuters-graphics/bluprint`
  so a fetched config resolves the library from a temp dir);
  [`fetch.ts`](./src/config/fetch.ts) reads it locally (`file://…`) or remotely
  over HTTPS from the repo. `checkVersion.ts` guards the `bluprint` semver range.
- **`actions/`** — the action factory functions (`copy`, `move`, `remove`,
  `render`, `regexreplace`, `execute`, `log`, `prompt`, `run`, `json`, `yaml`,
  `append`, `prepend`) exported from the root, plus `runActions` (the runner),
  `context.ts` (`getDefaultContext`), and the typed-context generics.
- **`scaffold/`** — copies a bluprint's files into the target: remote via tarball
  fetch + `tar.extract` ([`extract.ts`](./src/scaffold/extract.ts)), local via
  [`copyLocal.ts`](./src/scaffold/copyLocal.ts) (`git ls-files`), sharing the
  `files`/`ignores` glob filter.
- **`profile/`** — the user's own config at `~/.bluprint/profile.json` (GitHub
  token + installed bluprints). Use the `profile` singleton
  (`profile.token`, `.addBluprint()`, `.removeBluprint()`). First run migrates a
  legacy `~/.bluprintrc`.
- **`prompts/`** — thin typed wrappers over `@clack/prompts` (incl. a custom
  `datetime` prompt).
- **`runtime.ts`** — interactive-mode flag (env-backed so it crosses the
  `cli.js`/`index.js` bundle split); actions read it to stay non-interactive in CI.
- **`commands/`** — one directory per CLI command: `add`, `start`, `clone`,
  `new`, `remove`, `token`, `preview`.
- **`index.ts`** — public library entry (exports `defineConfig`, all action
  factories, and the public types).
- **`cli.ts`** — CLI entry (bin `bluprint`, wired with `sade`).

The key API shift: bluprints are configured with a **`bluprint.config.ts`**
module, replacing the old `.bluprintrc` JSON.

## Conventions

- Tests are co-located with source as `*.test.ts`.
- Prefer the shared `prompts/` wrappers over calling `@clack/prompts` directly.
- Add a changeset (`pnpm changeset`) for any user-facing change — releases are
  published to npm from CI when the "Version Packages" PR merges.
- Use absolute dates in notes/changesets, never relative ones.
