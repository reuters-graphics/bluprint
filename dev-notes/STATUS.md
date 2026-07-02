# Status

> Single source of truth for current project state. **Update this before ending
> any work session.** Last updated: **2026-07-01**.

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

## What's broken / unfinished

- `start` scaffolds **remote git bluprints only** — `file://` local bluprints are rejected for now (deferred).
- `start`/`clone`/`preview` haven't been run against a real repo end-to-end yet (no v1 `bluprint.config.ts` repo to test against); logic is unit/integration-tested with fixtures. Deferred until first 1.0 publish.
- Pre-rewrite deletions + new modules are committed incrementally on `main`; the two earliest session commits predate the foundation commit (accepted).

## Health check (2026-07-01)

| Check | Command | Result |
|---|---|---|
| Tests | `pnpm test` (`vitest run`) | ✅ 139 passing (config + profile + all commands + scaffold + actions) |
| Lint | `pnpm lint` (`eslint`) | ✅ clean |
| Typecheck | `npx tsc --noEmit` | ✅ clean |
| Build | `pnpm build` (`rollup`) | ✅ builds `dist/index.js` + `dist/cli.js` |
| Dead code | `pnpm knip` | ✅ clean |
| Package | `pnpm publint` | ✅ all good |
| CLI smoke | `node dist/cli.js --help` | ✅ lists add / start / remove / token / clone / new / preview |

## Suggested next step

The v1 code + docs + changeset are done, and dead deps/package hygiene are
verified (knip + publint clean). Remaining before publish: the repo/release
admin ([task 0003](./tasks/0003-repo-release-maintenance.md) — mostly GitHub/npm),
and the deferred end-to-end `start`/`clone`/`preview` smoke test against a real
repo at the first 1.0 publish.

> ⚠️ When testing commands that touch the `profile` singleton, **seed state in
> `beforeEach`** — mock-fs doesn't reliably reset the singleton's writes between
> tests. See task 0001's blockers note.
