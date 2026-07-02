# Status

> Single source of truth for current project state. **Update this before ending
> any work session.** Last updated: **2026-07-02** (E2E).

## In one line

The **v1.0.0 rewrite** is essentially code-complete — tooling, the TS-config API,
all 13 actions, all 7 commands (incl. new `preview`), docs, and the changeset are
done. What's left is repo/release admin ([0003](./tasks/0003-repo-release-maintenance.md))
before publishing, plus a deferred real-repo smoke test.

## Active work

- **[0001 — v1.0.0 rewrite](./tasks/0001-v1-api-rewrite.md)** — *in progress*.
  Commands all ported; remaining: end-to-end `start` test, docs rewrite, fix
  the changeset, delete `__archive/`.
- **[0002 — Actions function API](./tasks/0002-actions-function-api.md)** —
  *done* (docs deferred). 13 actions as typed factory functions + runner.
- **[0003 — Repo & release maintenance](./tasks/0003-repo-release-maintenance.md)** —
  *planned*. Switch GitHub default branch `master` → `main`; verify the
  changesets npm-publish workflow. Mostly GitHub/npm admin work.
- **[0004 — `preview` command](./tasks/0004-preview-command.md)** — *done*.
  Scaffolds a local bluprint into a stable temp dir + runs its actions so authors
  can test before publishing. Also implemented local scaffolding (`copyLocal`).

## What works right now

- Tooling stack (pnpm, ESM, TS, Vitest, Valibot, changesets, rollup v4, Astro docs) — committed in `ca3eb43`.
- New runtime modules with passing tests: [`config/`](../src/config/), [`profile/`](../src/profile/).
- [`context/`](../src/context/) and [`prompts/`](../src/prompts/) modules in place.
- **All CLI commands ported (7)** — [`add`](../src/commands/add/index.ts), [`start`](../src/commands/start/index.ts), [`remove`](../src/commands/remove/index.ts), [`token`](../src/commands/token/index.ts), [`clone`](../src/commands/clone/index.ts), [`new`](../src/commands/new/index.ts), [`preview`](../src/commands/preview/index.ts) — on the new `profile`/`config`/`actions` APIs (with tests).
- [`src/scaffold/`](../src/scaffold/) — shared scaffolding: tarball fetch+extract (`start`/`clone`) and `copyLocal` local copy (`preview`), sharing the glob filter + `excludeConfig` flag.
- [`src/cli.ts`](../src/cli.ts) wires all seven commands; `bluprint --help` lists them.
- [`docs/`](../docs/) — Astro/Starlight site rewritten for the new `bluprint.config.ts` + function-actions API (incl. a new Previewing guide). `pnpm build:docs` clean.
- **knip** + **publint** wired in (`pnpm knip`, `pnpm publint`) and run in CI (the Lint workflow); both clean. Dead deps/files removed.
- [`src/actions/`](../src/actions/) — 13 actions as typed factory functions (copy/move/remove/render/regexreplace/execute/log/prompt/run/json/append/prepend/yaml) + `runActions` runner (with `failOnError`), exported from the package root (task 0002).
- **Typed run context** — `defineConfig<Context>` threads an author-declared context type into every action's `when`/`run`/editor callback (autocomplete + type-checking instead of `unknown`); untyped `defineConfig` stays loose. Backward-compatible; locked by `src/config/typedContext.test.ts`. See [0002](./tasks/0002-actions-function-api.md) (2026-07-02).
- **End-to-end verified** against a real GitHub repo (`reuters-graphics/test-bluprint-v1`, public v1 fixture): `start` (all 5 demo actions + excludeConfig/ignores), `clone` (verbatim, keeps config), and local `preview` all pass. Surfaced + fixed a config-import resolution bug in `load.ts` (`efad252`) and a docs mustache-helper syntax bug (`114cf9b`). See [0001](./tasks/0001-v1-api-rewrite.md) (2026-07-02).

## What's broken / unfinished

- `start` scaffolds **remote git bluprints only** — `file://` local bluprints are rejected for now (deferred).
- End-to-end `start`/`clone`/`preview` now **verified** against `reuters-graphics/test-bluprint-v1` (2026-07-02). Not yet run: `add`+`start` via the real profile (skipped to avoid mutating `~/.bluprint`), and `new`. The test fixture's config dep is `file:../bluprint`; switch to `^1.0.0` post-publish.
- Pre-rewrite deletions + new modules are committed incrementally on `main`; the two earliest session commits predate the foundation commit (accepted).

## Health check (2026-07-02)

| Check | Command | Result |
|---|---|---|
| Tests | `pnpm test` (`vitest run`) | ✅ 158 passing (config + profile + all commands + scaffold + actions) |
| E2E | `start`/`clone`/`preview` vs `test-bluprint-v1` | ✅ all pass (2026-07-02) |
| Lint | `pnpm lint` (`eslint`) | ✅ clean |
| Typecheck | `npx tsc --noEmit` | ✅ clean |
| Build | `pnpm build` (`rollup`) | ✅ builds `dist/index.js` + `dist/cli.js` |
| Dead code | `pnpm knip` | ✅ clean |
| Package | `pnpm publint` | ✅ all good |
| CLI smoke | `node dist/cli.js --help` | ✅ lists add / start / remove / token / clone / new / preview |

## Suggested next step

The v1 code + docs + changeset are done, dead deps/package hygiene are verified
(knip + publint clean), and the commands are now **verified end-to-end** against
a real GitHub bluprint (`reuters-graphics/test-bluprint-v1`). Remaining before
publish: the repo/release admin ([task 0003](./tasks/0003-repo-release-maintenance.md)
— switch this repo's default branch `master`→`main`, verify the changesets
npm-publish workflow), and any docs-site polish. After the first 1.0 publish,
add a `bluprint: '^1.0.0'` constraint to the test fixture and switch its
`file:../bluprint` dep to the published version.

> ⚠️ When testing commands that touch the `profile` singleton, **seed state in
> `beforeEach`** — mock-fs doesn't reliably reset the singleton's writes between
> tests. See task 0001's blockers note.
