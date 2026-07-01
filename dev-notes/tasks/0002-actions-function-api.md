# 0002 — Actions redesign: function API

- **Status:** planned
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

- [ ] Core types + `ActionContext` + default context (`year/month/day/dirname`)
- [ ] Runner: iterate → gate on `when` → run → merge context → per-action try/catch
- [ ] Templating utils: port mustache/ejs helpers from `__archive/actions/render/utils/`
- [ ] Action factories (8): `copy`, `move`, `remove`, `render`, `regexreplace`,
      `execute`, `log`, `prompt`
- [ ] `prompt` action: discriminated union on `type` (text/select/confirm/…) →
      returns `{ [name]: answer }` into context
- [ ] Export all actions + `defineConfig` from `src/index.ts` (root)
- [ ] Update `BluprintConfig['actions']` (and `parts[].actions`) type from the
      `[]` placeholder to `Action[]` in [`../../src/config/types.ts`](../../src/config/types.ts)
- [ ] Co-located tests per action + the runner (seed profile-independent; use
      mock-fs for file actions)
- [ ] Docs update — **deferred** to the docs task; note the breaking change

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
