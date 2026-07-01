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
- [x] **Fix `add` command** — now uses the `profile` singleton + `config.module`
- [x] **Create new `src/cli.ts`** to wire commands (use `sade`); unblocks the build
- [x] Exclude `src/__archive/` from `tsconfig` so `tsc` is clean
- [ ] Port remaining commands from `__archive`: `start`, `clone`, `new`, `remove`, `token`
- [ ] Wire up `actions` in the new API (render/copy/move/etc. — currently only in `__archive`)
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

- *(resolved 2026-07-01)* ~~`add` command broken~~ — now uses the `profile`
  singleton and derives `title`/`hint` from `config.module.name`.
- *(resolved 2026-07-01)* ~~No `src/cli.ts`~~ — recreated with `sade`; build +
  CLI smoke test pass. Only `add` is wired; remaining commands get registered as
  they're ported.
- **Decide `__archive`'s fate** — currently excluded from `tsconfig` (so `tsc` is
  clean) but still on disk as porting reference. Delete once all commands/actions
  are ported.

## Progress log

- **2025-11-10** — Tooling migration committed (`ca3eb43 "refactor"`). Old
  `src/**` moved to `__archive/`; new `config`/`context`/`profile`/`prompts`
  modules started; `add` command begun.
- **2026-07-01** — Reconstructed state after a break. `config` + `profile` tests
  green (33 passing). Identified the two blockers above (broken `add`, missing
  `cli.ts`). Set up this dev-notes system to avoid re-deriving state next time.
- **2026-07-01** — Cleared both blockers. Fixed `add` to use the `profile`
  singleton (`addBluprint`) and derive `title`/`hint` from `config.module.name`.
  Recreated [`../../src/cli.ts`](../../src/cli.ts) with `sade` (only `add` wired
  for now; fixed a `chalk` → `chalk-template` bug in the banner). Excluded
  `src/__archive/` from `tsconfig`. Now: `tsc` clean, 33 tests pass, `pnpm build`
  produces `dist/index.js` + `dist/cli.js`, and `node dist/cli.js --help` runs.
