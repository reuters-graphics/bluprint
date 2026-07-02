# 0003 — Repo & release maintenance

- **Status:** planned
- **Started:** 2026-07-02
- **Owner:** hobbes7878

## Goal

Get the repository and release pipeline into shape for publishing v1.0.0 to npm:
make `main` the default branch and confirm the changesets-based GitHub Actions
release workflow can publish `@reuters-graphics/bluprint` to npm.

Much of this is **GitHub/npm admin work that can't be done from the repo** — it
needs repo-admin access on GitHub and an npm token. Those items are marked 🔧.

## Current state (verified 2026-07-02)

- All workflows already trigger on `branches: [main]`
  ([`../../.github/workflows/`](../../.github/workflows/)): `release`, `test`,
  `docs`, `lint`.
- `release.yaml` delegates to the shared
  `reuters-graphics/action-workflows/.github/workflows/changesets-release.yaml@main`
  with `secrets: inherit` and `publish_docs: false` (docs deploy separately via
  `docs.yaml` → GitHub Pages).
- [`../../.changeset/config.json`](../../.changeset/config.json): `baseBranch: main`,
  `access: public` — correct for a scoped public package.
- `package.json`: `private: false`, `files: ["dist/**/*"]`, `main`/`types`/`bin`
  set, `prepublishOnly: pnpm run build`. Current version `0.6.7`; the
  `major-v1-rewrite` changeset will bump it to **1.0.0** on first release.
- **Git**: `origin` default branch is still **`master`** (`origin/HEAD → origin/master`).
  Local `main` exists but is **not pushed to origin** yet. Many stale remote
  branches (old `dependabot/*`, `test-action`, `release-action`, etc.).

## Plan

### Branch migration: `master` → `main`
- [ ] Push local `main` to `origin` (it isn't there yet).
- [ ] 🔧 Set the GitHub **default branch** to `main` (repo Settings → Branches).
- [ ] 🔧 Recreate/move **branch protection** rules from `master` to `main`.
- [ ] 🔧 Retarget or close open **PRs** currently based on `master`.
- [ ] 🔧 Update `origin/HEAD` and **delete `master`** once nothing depends on it.
- [ ] 🔧 (Housekeeping) prune stale remote branches (old dependabot/*, test/release-action).

### npm publishing via GitHub Actions (changesets)
- [ ] 🔧 Confirm an **`NPM_TOKEN`** (automation token with publish rights to the
      `@reuters-graphics` scope) is available to the workflow — `secrets: inherit`
      means it must exist at the **org or repo** level. Verify it's present and unexpired.
- [ ] Confirm the shared `changesets-release.yaml@main` workflow's expectations
      match our scripts (`changeset:version`, `changeset:publish` in
      `package.json`) — or that it runs its own `changeset version`/`publish`.
- [ ] Consider adding `"publishConfig": { "access": "public" }` to `package.json`
      as a belt-and-suspenders alongside the changeset `access: public`.
- [ ] Ensure the v1 **changeset is accurate** before first publish — ties to the
      task 0001 item ("fix the inaccurate v1 changeset").
- [ ] 🔧 Confirm **GitHub Pages** is enabled (Settings → Pages, source = GitHub
      Actions) so `docs.yaml` can deploy. Until this is done the `github-pages`
      environment doesn't exist, so the VS Code Actions extension flags
      `environment: github-pages` in `docs.yaml` as *"Value 'github-pages' is not
      valid"* — a benign false positive that clears once Pages is enabled (the
      workflow YAML is correct as-is).
- [ ] Dry-run / sanity-check: merge a PR with a changeset into `main` → the
      release workflow opens a "Version Packages" PR → merging it publishes to npm.

## Notes / decisions

- First publish is the **1.0.0** major (from `.changeset/major-v1-rewrite.md`).
  Don't publish until the docs + changeset are corrected and the command set is
  verified (end-to-end `start`/`clone` is deferred to just before this — see
  task 0001).
- The in-repo pieces (push `main`, `publishConfig`, changeset accuracy) can be
  done by us; the 🔧 items need a human with GitHub/npm admin.

## Progress log

- **2026-07-02** — Task created. Audited workflows + changeset/package config:
  CI already targets `main` and changesets are configured for a scoped public
  package; the real gaps are the GitHub default-branch switch (main isn't even
  pushed to origin yet) and verifying npm publish auth.
