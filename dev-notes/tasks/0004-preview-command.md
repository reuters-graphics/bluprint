# 0004 — `preview` command (test a bluprint locally)

- **Status:** planned
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
- **Output:** OS temp dir (`fs.mkdtempSync`), left in place, absolute path printed.
- **Source:** optional path arg, defaulting to cwd (`bluprint preview [path]`).
- **Faithful copy:** copy the working dir's files filtered by the config's
  `files`/`ignores`, and **always also exclude `.git/` and `node_modules/`** (a
  published git tarball wouldn't contain them). Excludes `bluprint.config.ts`
  like `start` (`excludeConfig: true`).

## Approach

`preview` ≈ `start`, but source = local dir copy (not tarball) and dest = temp
dir. Because all scaffold/action logic is `process.cwd()`-relative, we `chdir`
into the temp dir and reuse everything unchanged.

### New: `src/scaffold/copyLocal.ts`
```ts
copyLocal(srcDir: string, { files, ignores, excludeConfig }: ScaffoldFilter): void
```
- Walk `srcDir` recursively; for each **project-relative** path, include it via
  `shouldInclude(relPath, files, ignores, excludeConfig)` (reused from
  [`filter.ts`](../../src/scaffold/filter.ts)) — plus a hard-coded skip of
  `.git` and `node_modules` directories (don't even descend into them).
- Copy survivors into `process.cwd()` (the temp dir), creating parent dirs.
- No `deRoot` needed (paths are already relative to `srcDir`, unlike the tarball).

### New: `src/commands/preview/index.ts`
`preview(pathArg?: string)`:
1. `srcDir = path.resolve(pathArg ?? process.cwd())`; error if no
   `bluprint.config.ts` there.
2. `await config.load(\`file://${srcDir}\`)`; bail if no module; `checkVersion`.
3. `const { part, files, ignores, actions } = await choosePart(config.module)`.
4. `const out = fs.mkdtempSync(path.join(os.tmpdir(), 'bluprint-preview-'))`.
5. `chdir(out)` → `try { copyLocal(srcDir, { files, ignores }); await runActions(actions, part); } finally { chdir(original) }`.
6. `log.success` with the `out` path.

### Edit: `src/cli.ts`
Register `preview [path]` → `await preview(path)`.

## Reuse
- `shouldInclude` / `normalizeGlobs` ([`src/scaffold/filter.ts`](../../src/scaffold/filter.ts))
- `choosePart`, `runActions`, `config.load`, `checkVersion` — all as-is.

## Tests (co-located)
- **`copyLocal.test.ts`** — real temp fixture (mirror `extract.test.ts`'s
  approach; tar+fs/mock-fs don't mix, and neither does a recursive fs walk):
  build a src dir with files + `.git/` + `node_modules/` + a dotfile + the config,
  copy into a temp cwd, assert filtered result (globs applied, `.git`/
  `node_modules`/config excluded, dotfiles kept).
- **`preview/index.test.ts`** — mock `config`, `checkVersion`, `choosePart`,
  `copyLocal`, `runActions`, `@clack/prompts`; assert `config.load` gets
  `file://<srcDir>`, `copyLocal` gets the chosen globs, `runActions` gets the
  chosen actions/part, and cwd is restored afterward.

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
