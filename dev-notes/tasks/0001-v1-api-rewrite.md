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
- [x] Port `token` command + wire into CLI (with tests)
- [x] Port `remove` command + wire into CLI (with tests)
- [x] Wire up `actions` in the new API → **split out to task [0002](./0002-actions-function-api.md)** (function-based redesign, done)
- [x] Port `start` command (bluprint select → config load → choose part → tarball scaffold → runActions)
- [x] Port `clone` command (whole-repo tarball extract) + `new` command (starter `bluprint.config.ts`)
- [x] All CLI commands ported → `src/__archive/` is now fully superseded (safe to delete)
- [x] Rewrite docs content for the new `bluprint.config.ts` API (Astro/Starlight; added a Previewing guide)
- [ ] Update the changeset — it inaccurately claims the CLI/`.bluprintrc` format is unchanged
- [ ] Commit the working tree (currently all uncommitted)

## Backwards-parity audit (2026-07-02)

Compared `src/__archive/` against the rewrite. Almost everything is ported or
deliberately replaced (logger→clack, valibot schema→TS types + `defineConfig`,
`mergeJson`→`json` action, `getUserConfig`→`profile`, lib exports shifted from
command fns to `defineConfig` + actions). **Open parity gaps:**

- [x] **`checkVersion` — RESTORED** ([`../../src/config/checkVersion.ts`](../../src/config/checkVersion.ts)):
      `semver.satisfies` guard called by `start` and `add` after `config.load` —
      errors+exits if the CLI is too old for the bluprint's `bluprint` constraint,
      warns on other mismatch. Revives the `semver` dep.
- [x] **Discovery UX — ACCEPTED flat list for v1** (user decision). `start`/`remove`
      keep the single flat select (category shown as a hint); no category
      browsing or search/autocomplete. Revisit post-1.0 if real usage warrants.
- [x] **User-config migration — ADDED** one-time import
      (`mapLegacyProfile` + `importLegacyProfile` in
      [`../../src/profile/index.ts`](../../src/profile/index.ts)): first run with
      no `~/.bluprint/profile.json` imports a legacy `~/.bluprintrc`
      (`{user,project}`→`user/project` url, token, categories); legacy file left
      in place.
- Non-issue: old global SIGINT/SIGTERM/keypress handlers are covered by clack's
  per-prompt cancellation.

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
- **Decide `__archive`'s fate** — currently excluded from `tsconfig` *and*
  `eslint` (so `tsc` and `pnpm lint` are clean) but still on disk as porting
  reference. Delete once all commands/actions are ported.
- **mock-fs + `profile` singleton test-isolation quirk** — the `profile`
  singleton's `fs` writes (to `~/.bluprint/profile.json`) appear to **survive
  mock-fs resets between tests**, even though raw `fs` writes in the test file
  reset correctly. Not caused by `vi.clearAllMocks()`, and the singleton has no
  in-memory cache. The existing profile suite doesn't catch it (it never asserts
  "empty" after a write). Workaround: **seed known state in `beforeEach`** rather
  than rely on the reset (see [`token/index.test.ts`](../../src/commands/token/index.test.ts)).
  Worth a proper root-cause investigation — it can make command tests flaky/order-dependent.
  **Deferred (2026-07-01):** the user flagged this as a possible reason to rewrite
  the `profile` singleton later; commands seed state in `beforeEach` for now.

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
- **2026-07-01** — Ported the `token` command
  ([`../../src/commands/token/index.ts`](../../src/commands/token/index.ts)) to
  the `profile` singleton + new prompt wrappers, wired it into `cli.ts`, and
  added 4 co-located tests (37 passing total). Discovered + documented the
  mock-fs/profile-singleton isolation quirk above (tests now self-seed state).
- **2026-07-02** — Rewrote the docs site ([`../../docs/content/docs/`](../../docs/content/docs/))
  for the new API: `.bluprintrc`→`bluprint.config.ts`, JSON action objects→typed
  imported functions, `condition`→`when`, `mergeJson`→`json` action; added a
  "Why this?" intro framing + a new Previewing guide; updated the sidebar.
  `pnpm build:docs` clean (9 pages).
- **2026-07-02** — Closed the parity gaps from the audit: restored `checkVersion`
  (semver guard in `start`/`add`), added the one-time `~/.bluprintrc` → v1 profile
  migration, and accepted the flat bluprint picker for v1 (per user). 132 tests.
- **2026-07-01** — Ported **`clone`** and **`new`**, completing the CLI command
  set (add/start/remove/token/clone/new). Moved `scaffold` from
  `commands/start/scaffold/` to a shared [`../../src/scaffold/`](../../src/scaffold/)
  (now used by both `start` and `clone`) and added an `excludeConfig` option
  (`start` excludes the bluprint config; `clone` keeps it — whole-repo copy).
  `new` writes a starter `bluprint.config.ts` (refuses if one exists). 124 tests.
  `src/__archive/` is now fully superseded and can be deleted.
- **2026-07-01** — Ported the **`start`** command
  ([`../../src/commands/start/`](../../src/commands/start/)): resolve bluprint
  (arg-title → url, or `promptForBluprint`), `config.load`, `choosePart`
  (part *replaces* top-level: its files/ignores/actions, actions falling back to
  top-level), `scaffold` (download repo tarball → `tar.extract` with `strip:1`
  + `files`/`ignores` glob filter, `dot:true` so dotfiles copy), then
  `runActions`. Remote-only for now (`file://` rejected). Added
  `profile.getBluprintUrl`. Wired into `cli.ts`. 22 tests (118 total). **Impl
  notes:** tar v7 renamed `Parse`→`Parser`; the manual Parser+buffer approach
  hung on completion, so switched to `tar.extract` driven by
  `stream/promises` `pipeline` (robust) with `strip:1` replacing manual deRoot
  for writes. Dropped the old `mergeJson` (the `json` action covers it).
- **2026-07-01** — Ported the `remove` command
  ([`../../src/commands/remove/index.ts`](../../src/commands/remove/index.ts)):
  added `profile.bluprintTitles` + `profile.promptForBluprintToRemove()` (title-
  keyed, unlike the URL-keyed `promptForBluprint`), wired into `cli.ts`, 4 tests
  (41 passing total). Root-causing the singleton quirk deferred per the user.
