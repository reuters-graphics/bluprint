# 0002 — Actions redesign: function API

- **Status:** done (docs deferred to the docs task)
- **Started:** 2026-07-01
- **Owner:** hobbes7878

## Goal

Port the 8 bluprint actions from `src/__archive/actions/` to the new v1 codebase,
**re-designed as exported factory functions** instead of plain data objects. The
TypeScript config (`bluprint.config.ts`) means authors get full typehints,
autocomplete, and inline docs on every action and its arguments.

This is a prerequisite for the `start` command (task 0001), which runs a
bluprint's actions after fetching its files.

## Design decisions (agreed 2026-07-01)

> **Follow-up (2026-07-01):** added a `failOnError?: boolean` option (default
> `false`) to every action via `ActionOptions`. When `true`, a thrown error
> aborts the run (runner re-throws) instead of being skipped. The user opted to
> **keep positional signatures** (e.g. `copy(paths, options)`) rather than move
> everything to object config — `failOnError` just joins the existing options
> object.
>
> **Follow-up (2026-07-01):** added two actions that leverage the TS config —
> now **10 actions**:
> - `run(fn, options?)` — escape hatch; the user's function *is* the action's
>   `run`. Receives context, may return a partial to merge back. Async.
> - `json(file, editor, options?)` — edit a JSON file. The editor gets the parsed
>   data + context and **must return** the data to write (mutate-then-return, or
>   return a fresh value) — no side-effect writes. Written 2-space pretty +
>   trailing newline. Generic `<T>` for typed editing (with a typed/default `T`,
>   a forgotten `return` is a compile error; explicit `any` opts out). Replaces
>   the old `mergeJson` concept.
>
> Considered but **declined**: `write` (a templated file-create) — `run` covers
> it. Kept `log` and `regexreplace` despite `run` overlap.
>
> **Follow-up (2026-07-01):** added two more — now **13 actions**:
> - `append(file, content, options?)` / `prepend(...)` — add templated content to
>   a file; create-if-missing; insert a separating newline so lines never glue
>   together. Covers the common `.gitignore`/`.env`/`.npmrc` case.
> - `yaml(file, editor, options?)` — the `json` analog for YAML (same must-return
>   editor). Adds the `yaml` dep. **Round-trip drops comments/formatting** — for
>   generated/config YAML, not hand-curated files. Declined `download`.


1. **Actions are factory functions**, not `{ action: '...' }` data objects.
   Before → after:
   ```ts
   // before (archived)
   { action: 'copy', paths: ['tpl/readme.md', '{{name}}/README.md'] }
   // after
   copy(['tpl/readme.md', '{{name}}/README.md'])
   ```
2. **Gating via predicate**: `when?: (ctx: ActionContext) => boolean` — replaces
   the old `condition: ['key', value]` tuples. No back-compat with tuples.
3. **Root exports**: actions import from the package root alongside
   `defineConfig` — `import { defineConfig, copy, render } from '@reuters-graphics/bluprint'`.
4. **Prompts via clack wrappers**: the `prompt` action uses `src/prompts/`, one
   typed prompt per `prompt()` action (discriminated by `type`); multiple
   questions = multiple `prompt()` actions. Drop the legacy `prompts` npm lib
   usage in actions. `render` loses its `questions`/`inject` fields — prompts
   run as their own actions earlier in the array and feed `context`.
5. **No valibot for actions**: the factory signatures *are* the contract; the
   config is TS and jiti already executes arbitrary code, so runtime schema
   validation adds maintenance without real safety. Light runtime guards only.

## Proposed internal model

```ts
type Awaitable<T> = T | Promise<T>;

/** Default context every action receives. */
interface DefaultContext {
  year: string;
  month: string;
  day: string;
  dirname: string;      // cwd basename
  bluprintPart?: string;
}
type ActionContext = DefaultContext & Record<string, unknown>;

interface ActionOptions {
  when?: (ctx: ActionContext) => boolean;
}

interface Action {
  readonly name: string;                 // for logging
  when?: (ctx: ActionContext) => boolean;
  /** Does the work; may return context additions to merge. */
  run(ctx: ActionContext): Awaitable<void | Partial<ActionContext>>;
}
```

The **runner** (replacing `__archive/actions/index.ts`) iterates the actions,
skips any whose `when` returns false, runs the rest, merges any returned partial
context, and warns (via clack `log.warn`) per-action on error without aborting
the run — same resilience as today. `prompt` actions contribute their answer to
context by returning `{ [name]: answer }`.

## Plan

- [x] Core types + `ActionContext` + default context (`year/month/day/dirname`)
- [x] Runner: iterate → gate on `when` → run → merge context → per-action try/catch
- [x] Templating utils: port mustache/ejs helpers from `__archive/actions/render/utils/`
- [x] Action factories (8): `copy`, `move`, `remove`, `render`, `regexreplace`,
      `execute`, `log`, `prompt`
- [x] `prompt` action: discriminated union on `type` (text/select/confirm/…) →
      returns `{ [name]: answer }` into context
- [x] Export all actions + `defineConfig` from `src/index.ts` (root)
- [x] Update `BluprintConfig['actions']` (and `parts[].actions`) type from the
      `[]` placeholder to `Action[]` in [`../../src/config/types.ts`](../../src/config/types.ts)
- [x] Co-located tests per action + the runner (33 new tests; mock-fs for file actions)
- [ ] Docs update — **deferred** to the docs task; note the breaking change

## Resolutions to the open questions

- **`execute`**: accepts `string` (run via shell) *or* `[cmd, ...args]` (no shell).
  One command per call.
- **`copy`/`move`**: accept a single `[from, to]` pair *or* an array of pairs.
- **`remove`**: uses `glob`'s `globSync` and removes both files and matched
  directories (`fs.rmSync` recursive) — slightly broader than the old files-only
  behavior, which reads as the more intuitive expectation for a `remove` action.
- **`DefaultContext`** had to be a **type alias, not an interface** — an interface
  lacks the implicit index signature needed to compose into
  `ActionContext = DefaultContext & Record<string, unknown>`.

## Open questions / to settle during implementation

- **`execute` signature**: single `execute(['pnpm','install'], {silent})` vs
  multiple commands `execute([['pnpm','install'], ['git','init']])`. Lean: accept
  one command per call, keep it simple; multiple = multiple `execute()` actions.
- **`copy`/`move` paths**: keep the `[from, to]` or `[[from,to], …]` overload, or
  one pair per call? Lean: accept a single pair or an array of pairs (match old
  ergonomics).
- **`prompt` typing**: how far to push the discriminated union (e.g. `select`
  requiring `options`). Aim for good hints without over-engineering.
- **Context typing**: `prompt` answers are dynamic — keep `ActionContext` as
  `DefaultContext & Record<string, unknown>`; no attempt to thread prompt answer
  types into later actions' `when`/`context` for v1.

## Related

- Blocks `start` command (task [0001](./0001-v1-api-rewrite.md)) — the runner is
  what `start` calls after fetching bluprint files.
- Reference implementations to port: [`../../src/__archive/actions/`](../../src/__archive/actions/).

## Progress log

- **2026-07-01** — Task created. Read the full archived actions system
  (dispatch, schemas, 8 actions, condition, `start` usage). Agreed the 5 design
  decisions above with the user. Next: draft the implementation plan.
- **2026-07-01** — Implemented the whole system under `src/actions/`: core
  types, `getDefaultContext`, shared render helpers (mustache/ejs), all 8 action
  factories, the `runActions` runner, barrel + root exports, and the
  `BluprintConfig.actions` type. 33 co-located tests. `tsc` clean, 74 tests pass,
  build OK. Verified root exports at runtime and the `prompt` discriminated
  union (`select` without `options` is a type error). Found a **mock-fs gotcha**:
  keying by the absolute cwd path throws "already exists" — use **relative keys**
  (they resolve against cwd), which is what the file-action tests now do.
- **2026-07-01** — Added `failOnError` (default `false`) to `ActionOptions` +
  `Action`, threaded through all 8 factories; runner now `log.error`s and
  re-throws when a `failOnError` action throws (else warns + continues). Kept
  positional signatures per the user. +1 runner test (75 passing), tsc + build OK.
- **2026-07-01** — Added `run` (custom function) and `json` (function editor,
  receives context, generic `T`). Now 10 actions, both exported from the root.
  +10 tests (85 passing), tsc + build OK; runtime exports confirmed.
- **2026-07-01** — Tightened `json`: editor **must return** the data (was
  mutate-in-place-or-return). Removes mysterious side-effect writes and makes a
  forgotten `return` a compile error under a typed/default `T`. Tests updated.
- **2026-07-01** — Lint pass: fixed `no-explicit-any` in the json test (proper
  type args), prettier-formatted a few action files, and added `src/__archive` to
  eslint's ignores. `eslint src` clean.
- **2026-07-01** — Added `append`/`prepend` + `yaml` (13 actions total), added
  the `yaml` dep, 96 tests. **Gotcha:** incrementally `pnpm add`-ing onto a
  months-old `node_modules` left dangling symlinks (`eslint-utils`,
  `@jridgewell/remapping`) that broke the config test's `mock.load`; a fresh
  `rm -rf node_modules && pnpm install` fixed it (CI/clean installs are
  unaffected). Also hardened `__test__/utils.ts` to skip dangling top-level
  symlinks defensively.
- **2026-07-02** — **Typed run context ("Tier 1").** Made `Action`,
  `ActionOptions`, `BluprintConfig`, and all 13 action factories generic over
  `Ctx extends DefaultContext = ActionContext`; `defineConfig<Extra>` threads
  `DefaultContext & Extra` into every `when` / `run` / editor callback, so a
  bluprint author declares their prompt/`run` values once and gets full
  typing/autocomplete (instead of `unknown`). Untyped `defineConfig({…})`
  defaults to the old loose `ActionContext` — fully backward-compatible.
  Proved with a spike first, then rolled out; kept `src/config/typedContext.test.ts`
  as a type-level regression test (positive annotations + `@ts-expect-error`).
  **Type facts that shaped it:** (1) accumulation *across* an array literal is
  impossible — sibling elements don't share contextual type — so this is a
  single declared context, not per-position inference; (2) `DefaultContext & Extra`
  (an interface) is **not** assignable to `Record<string, unknown>` (the implicit
  index-signature trap), but generic calls typed by the *constraint*
  `DefaultContext` are, so factory bodies passing `ctx` to helpers just work;
  (3) `run` needed a second inferred `R extends Partial<Ctx>` so standalone calls
  stay permissive; (4) `prompt` casts its dynamic-key return `as Partial<Ctx>`;
  (5) `json`/`yaml`: passing an explicit data type arg (`json<T>`) switches off
  `Ctx` inference — annotate the editor's data param in a typed config instead.
  Docs: new "Typing the run context" section in `creating.mdx` + pointers from
  the actions guide/reference. 153 tests, tsc/lint/knip/build/publint/docs green.
