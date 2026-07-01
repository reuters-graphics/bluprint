# Dev notes

Internal working notes for developing bluprint. **Not published** — the Astro
docs site lives in [`../docs`](../docs); this directory is for contributors and
for Claude Code to track in-progress work.

The goal is that anyone (human or AI) picking the project back up can answer
"where did we leave off?" in under a minute.

## Layout

| Path | Purpose |
|---|---|
| [`STATUS.md`](./STATUS.md) | **Read this first.** The single source of truth for current project state — what's done, what's in flight, what's blocked. Always kept current. |
| [`tasks/`](./tasks/) | One file per unit of work. Goal, plan, and a running progress log. Detail lives here; `STATUS.md` just links to it. |
| [`handoffs/`](./handoffs/) | Dated snapshots written when pausing mid-work, so the next session can resume cleanly. Optional but recommended before a long break. |

## Conventions

- **Update `STATUS.md` as the last step of any work session.** If you changed
  what's true about the project, STATUS should reflect it before you stop.
- **Tasks are numbered** (`0001-`, `0002-`, …) and kebab-cased. Copy
  [`tasks/TEMPLATE.md`](./tasks/TEMPLATE.md) to start one.
- **Keep a progress log** at the bottom of each task file — dated bullets, newest
  last. This is the narrative of how the work actually went.
- **Handoffs are point-in-time** and never edited after they're written. Copy
  [`handoffs/TEMPLATE.md`](./handoffs/TEMPLATE.md), date the filename
  (`YYYY-MM-DD-short-slug.md`).
- **Use absolute dates** (`2026-07-01`), never "today" / "last week".
- **Link liberally** to real files with repo-relative paths so notes stay
  clickable and verifiable.
