# 0004 — `preview` command (test a bluprint locally)

- **Status:** done
- **Started:** 2026-07-02
- **Owner:** hobbes7878

## Goal

Let a bluprint author test their work **without publishing to GitHub, registering
it, and running `start`**. `bluprint preview` scaffolds the *local, current
on-disk* bluprint (uncommitted changes included) into a throwaway temp directory
and runs its actions, then prints the path so the author can inspect the result.

This also implements the **local scaffolding** path that `start` deferred (see
task 0001) — `start` could later reuse `copyLocal` for `file://` sources.

## Decisions (agreed 2026-07-02)

- **Name:** `preview`.
- **Parts:** interactive — reuse `choosePart` (same prompts as `start`), so the
  author sees the real end-user experience.
- **Output:** a **stable** dir `path.join(os.tmpdir(), 'bluprint', slugify(name))`
  — *not* random — emptied at the start of each run and left in place, absolute
  path printed. A stable path lets the author keep an editor/Finder window open
  across runs and watch the output update as they iterate. (Two same-named
  bluprints would share the dir — last run wins; acceptable.)
- **Source:** optional path arg, defaulting to cwd (`bluprint preview [path]`).
- **Faithful copy — honor `.gitignore` via git:** a GitHub tarball contains the
  git tree, so ignored paths (`dist/`, `.env`, `node_modules/`, …) must be
  skipped. Compute the file set with
  `git ls-files --cached --others --exclude-standard` (run in `srcDir`) = tracked
  **+** new-untracked, minus ignored — exactly a post-commit tarball, and it
  still includes the author's *uncommitted new* files (the point). Fall back to a
  plain recursive walk (skipping `.git`/`node_modules`) if `srcDir` isn't a git
  repo / git is unavailable. The config's `files`/`ignores` + `excludeConfig`
  (excludes `bluprint.config.ts`, like `start`) are then layered on top.

## Approach

`preview` ≈ `start`, but source = local dir copy (not tarball) and dest = temp
dir. Because all scaffold/action logic is `process.cwd()`-relative, we `chdir`
into the temp dir and reuse everything unchanged.

### New: `src/scaffold/copyLocal.ts`
```ts
copyLocal(srcDir: string, { files, ignores, excludeConfig }: ScaffoldFilter): void
```
- Determine candidate **project-relative** paths:
  `listGitFiles(srcDir)` → `git ls-files --cached --others --exclude-standard`
  (via `child_process.execFileSync`, `cwd: srcDir`). On any error (not a repo /
  no git), fall back to a recursive walk skipping `.git` and `node_modules`.
- Filter candidates through `shouldInclude(relPath, files, ignores, excludeConfig)`
  (reused from [`filter.ts`](../../src/scaffold/filter.ts)); skip any path no
  longer on disk (e.g. a tracked-but-deleted working file).
- Copy survivors into `process.cwd()` (the temp dir), creating parent dirs.
- No `deRoot` needed (paths are already relative to `srcDir`, unlike the tarball).

### New: `src/commands/preview/index.ts`
`preview(pathArg?: string)`:
1. `srcDir = path.resolve(pathArg ?? process.cwd())`; error if no
   `bluprint.config.ts` there.
2. `await config.load(\`file://${srcDir}\`)`; bail if no module; `checkVersion`.
3. `const { part, files, ignores, actions } = await choosePart(config.module)`.
4. Derive the stable output dir: `slug = slugify(name)` (guard: non-empty, else
   bail); `out = path.join(os.tmpdir(), 'bluprint', slug)`. **Empty it in place**
   (`mkdirSync(out, {recursive})` then remove each child) — keeps the dir inode
   so open editor watchers survive, and drops files removed from the bluprint.
5. `chdir(out)` → `try { copyLocal(srcDir, { files, ignores }); await runActions(actions, part); } finally { chdir(original) }`.
6. `log.success` with the `out` path (+ hint: re-run `preview` to refresh).

### Edit: `src/cli.ts`
Register `preview [path]` → `await preview(path)`.

## Reuse
- `shouldInclude` / `normalizeGlobs` ([`src/scaffold/filter.ts`](../../src/scaffold/filter.ts))
- `choosePart`, `runActions`, `config.load`, `checkVersion` — all as-is.

## Tests (co-located)
- **`copyLocal.test.ts`** — real temp fixtures (mirror `extract.test.ts`; git +
  recursive fs don't mix with mock-fs):
  - **git-repo fixture:** `git init` a temp src, add a `.gitignore` (e.g.
    `dist/`, `secret.env`), commit some files, leave a *new untracked* template
    file and an *ignored* file. Copy into a temp cwd; assert the untracked
    template is included, the ignored/`dist` files are excluded, and the config
    is excluded. (Verifies the git path + uncommitted-new-file behavior.)
  - **non-repo fallback:** a plain dir (no `.git`) with `node_modules/`; assert
    the walk fallback copies files but skips `.git`/`node_modules`.
- **`preview/integration.test.ts`** — end-to-end: inject a `config.module` with a
  real `render` action and run the *unmocked* `copyLocal` + `runActions`; assert
  the template file in the temp dir was actually rendered (proves actions run on
  the scaffolded files), and the config file wasn't copied.
- **`preview/index.test.ts`** — mock `config`, `checkVersion`, `choosePart`,
  `copyLocal`, `runActions`, `@clack/prompts`; assert `config.load` gets
  `file://<srcDir>`, the output dir is the stable `<tmp>/bluprint/<slug>`, a
  pre-existing stale file in it is removed before the run (emptied in place),
  `copyLocal`/`runActions` get the chosen globs/actions/part, and cwd is restored
  afterward.

## Verification
1. `npx tsc --noEmit`, `pnpm vitest run`, `pnpm lint` — clean.
2. `pnpm build`; `node dist/cli.js preview --help` lists it.
3. Manual: in the [graphics-kit bluprint dir](../../../bluprint_graphics-kit) (or
   any local bluprint), `node <path>/dist/cli.js preview` → prints a temp path
   containing the scaffolded, action-processed output.

## Out of scope (possible follow-ups)
- `--out <dir>`, `--part <name>` flags, and auto-open — deferred.
- Refactoring `start` to reuse `copyLocal` for `file://` sources.

## Progress log
- **2026-07-02** — Task created; design + decisions agreed with user.
- **2026-07-02** — Refined the copy to honor `.gitignore` via
  `git ls-files --cached --others --exclude-standard` (with a walk fallback for
  non-repos), so `preview` matches a real tarball while still including the
  author's uncommitted new files.
- **2026-07-02** — Switched the output from a random temp dir to a stable
  `<tmp>/bluprint/<slug>` emptied in place each run, so authors can keep one
  editor window open and watch it refresh across runs.
- **2026-07-02** — **Implemented.** `src/scaffold/copyLocal.ts` (git ls-files +
  walk fallback), `src/commands/preview/index.ts` (stable dir, empty-in-place,
  chdir + reuse choosePart/runActions/checkVersion), wired `preview [path]` into
  the CLI. 7 new tests incl. a real `git init` fixture (139 total). tsc + eslint
  clean, build lists `preview`. Not yet run against a real bluprint end-to-end
  (deferred to first 1.0 publish, like start/clone).
