# Status

> Single source of truth for current project state. **Update this before ending
> any work session.** Last updated: **2026-07-01**.

## In one line

Deep into the **v1.0.0 rewrite** — tooling done, the TS-config API and all 13
actions built, and **all six CLI commands ported**. What's left is mostly
end-to-end verification, docs, and the changeset.

## Active work

- **[0001 — v1.0.0 rewrite](./tasks/0001-v1-api-rewrite.md)** — *in progress*.
  Commands all ported; remaining: end-to-end `start` test, docs rewrite, fix
  the changeset, delete `__archive/`.
- **[0002 — Actions function API](./tasks/0002-actions-function-api.md)** —
  *done* (docs deferred). 13 actions as typed factory functions + runner.
- **[0003 — Repo & release maintenance](./tasks/0003-repo-release-maintenance.md)** —
  *planned*. Switch GitHub default branch `master` → `main`; verify the
  changesets npm-publish workflow. Mostly GitHub/npm admin work.

## What works right now

- Tooling stack (pnpm, ESM, TS, Vitest, Valibot, changesets, rollup v4, Astro docs) — committed in `ca3eb43`.
- New runtime modules with passing tests: [`config/`](../src/config/), [`profile/`](../src/profile/).
- [`context/`](../src/context/) and [`prompts/`](../src/prompts/) modules in place.
- **All CLI commands ported** — [`add`](../src/commands/add/index.ts), [`start`](../src/commands/start/index.ts), [`remove`](../src/commands/remove/index.ts), [`token`](../src/commands/token/index.ts), [`clone`](../src/commands/clone/index.ts), [`new`](../src/commands/new/index.ts) — on the new `profile`/`config`/`actions` APIs (with tests).
- [`src/scaffold/`](../src/scaffold/) — shared tarball fetch+extract (glob filter, `excludeConfig` flag), used by `start` and `clone`.
- [`src/cli.ts`](../src/cli.ts) wires all six commands; `bluprint --help` lists them.
- [`src/actions/`](../src/actions/) — 13 actions as typed factory functions (copy/move/remove/render/regexreplace/execute/log/prompt/run/json/append/prepend/yaml) + `runActions` runner (with `failOnError`), exported from the package root (task 0002).

## What's broken / unfinished

- `start` scaffolds **remote git bluprints only** — `file://` local bluprints are rejected for now (deferred).
- `start`/`clone` haven't been run against a real repo end-to-end yet (no v1 `bluprint.config.ts` repo to test against); logic is unit-tested with a tar fixture. Deferred until first 1.0 publish.
- Docs content still describes the old `.bluprintrc` API.
- The v1 changeset text is inaccurate (claims API unchanged).
- `src/__archive/` is fully superseded and can be deleted.
- Pre-rewrite deletions + new modules are committed incrementally on `main`; the two earliest session commits predate the foundation commit (accepted).

## Health check (2026-07-01)

| Check | Command | Result |
|---|---|---|
| Tests | `pnpm test` (`vitest run`) | ✅ 124 passing (config + profile + all commands + scaffold + actions) |
| Lint | `pnpm lint` (`eslint`) | ✅ clean (`__archive/` ignored) |
| Typecheck | `npx tsc --noEmit` | ✅ clean (`__archive/` excluded) |
| Build | `pnpm build` (`rollup`) | ✅ builds `dist/index.js` + `dist/cli.js` |
| CLI smoke | `node dist/cli.js --help` | ✅ lists add / start / remove / token / clone / new |

## Suggested next step

With commands complete, the remaining v1 work is: **rewrite the docs** for the
new `bluprint.config.ts` + function-actions API (currently describes
`.bluprintrc`), **fix the inaccurate v1 changeset**, and **delete `src/__archive/`**.
End-to-end `start`/`clone` against a real repo is deferred until the first 1.0
publish (per the user).

> ⚠️ When testing commands that touch the `profile` singleton, **seed state in
> `beforeEach`** — mock-fs doesn't reliably reset the singleton's writes between
> tests. See task 0001's blockers note.
