# 0001 — v1.0.0 rewrite (tooling + API + docs)

- **Status:** in progress
- **Started:** 2025-11-10 (commit `ca3eb43`)
- **Owner:** hobbes7878

## Goal

Ship bluprint v1.0.0: a complete rewrite with modern tooling, a new
TypeScript-config-based API, and a published docs site. See the release
changeset at [`../../.changeset/major-v1-rewrite.md`](../../.changeset/major-v1-rewrite.md).

Three strands:

1. **Tooling** — pnpm, ESM, TypeScript, Vitest, Valibot, changesets, rollup v4,
   eslint/prettier via `yaks-*` configs, Astro/Starlight docs.
2. **API** — bluprints now declare a typed **`bluprint.config.ts`** (via
   `defineConfig`) instead of the old `.bluprintrc` JSON. New runtime modules:
   `config`, `context`, `profile`, `prompts`.
3. **Docs** — Astro/Starlight site under [`../../docs`](../../docs).

## Plan

- [x] Land tooling migration (committed in `ca3eb43`)
- [x] `config/` — `defineConfig`, `Config` singleton, jiti loader, local/remote fetch (tests passing)
- [x] `profile/` — user profile at `~/.bluprint/profile.json` (tests passing)
- [x] `context/` singleton (stub)
- [x] `prompts/` — clack wrappers
- [ ] **Fix `add` command** — it's half-migrated and broken (see blockers)
- [ ] **Create new `src/cli.ts`** to wire commands (use `sade`); unblocks the build
- [ ] Port remaining commands from `__archive`: `start`, `clone`, `new`, `remove`, `token`
- [ ] Wire up `actions` in the new API (render/copy/move/etc. — currently only in `__archive`)
- [ ] Exclude or delete `src/__archive/` so `tsc` is clean
- [ ] Rewrite docs content for the new `bluprint.config.ts` API (currently still describes `.bluprintrc`)
- [ ] Update the changeset — it inaccurately claims the CLI/`.bluprintrc` format is unchanged
- [ ] Commit the working tree (currently all uncommitted)

## Notes / decisions

- **Old code is parked, not deleted.** All pre-rewrite `src/**` was moved into
  [`../../src/__archive/`](../../src/__archive/) for reference while porting. It
  still has TS errors and is *not* excluded from `tsconfig.json`, so it dirties
  `tsc --noEmit`. Decide whether to exclude or delete once porting is done.
- **Config is loaded via jiti** ([`../../src/config/load.ts`](../../src/config/load.ts))
  so a bluprint's `bluprint.config.ts` can be imported at runtime with the
  `bluprint` package aliased. Remote configs are fetched over HTTPS from the repo
  ([`../../src/config/fetch.ts`](../../src/config/fetch.ts)).
- **Profile replaces the old `userConfig`.** New singleton API is
  `profile.token`, `profile.addBluprint()`, `profile.removeBluprint()`,
  `profile.promptForBluprint()` — not the old `getUserProfile`/`writeUserProfile`
  free functions.
- **Docs were relocated** from `docs/src/content/docs/` to
  [`../../docs/content/docs/`](../../docs/content/docs/); Astro `srcDir` is now
  `./docs`.

## Open questions / blockers

- **`add` command is broken** —
  [`../../src/commands/add/index.ts`](../../src/commands/add/index.ts):
  - imports `getUserProfile` / `writeUserProfile`, which no longer exist (use the
    `profile` singleton instead)
  - line ~63 references an undefined `bluprintrc`
- **No `src/cli.ts`** — only exists in `__archive`. But
  [`../../rollup.config.js`](../../rollup.config.js) and `package.json` `bin`
  both point at `src/cli.ts` / `dist/cli.js`, so **the build fails** until it's
  recreated. `sade` is already a dependency for this.

## Progress log

- **2025-11-10** — Tooling migration committed (`ca3eb43 "refactor"`). Old
  `src/**` moved to `__archive/`; new `config`/`context`/`profile`/`prompts`
  modules started; `add` command begun.
- **2026-07-01** — Reconstructed state after a break. `config` + `profile` tests
  green (33 passing). Identified the two blockers above (broken `add`, missing
  `cli.ts`). Set up this dev-notes system to avoid re-deriving state next time.
