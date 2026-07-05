# @reuters-graphics/bluprint

## 1.0.0

### Major Changes

- ca3eb43: # Major rewrite to v1.0.0

  A complete rewrite of bluprint with modern tooling and a new, typed configuration
  API. This is a breaking release: **existing bluprints need to migrate.**

  ## Breaking changes

  ### Configuration: `.bluprintrc` → `bluprint.config.ts`

  Bluprints are now configured with a typed TypeScript file authored via
  `defineConfig`, instead of a `.bluprintrc` JSON file. Run `bluprint new` to
  scaffold a starter config.

  ```ts
  import { defineConfig } from '@reuters-graphics/bluprint';

  export default defineConfig({
    name: 'My bluprint',
    files: ['**/*'],
    ignores: [],
    actions: [],
  });
  ```

  ### Actions are now typed functions

  Actions were plain objects (`{ action: 'copy', paths: [...] }`) dispatched by a
  central switch. They're now **functions you import** from the package, so you get
  autocomplete, inline docs, and type-checking:

  ```ts
  import { copy, render, prompt } from '@reuters-graphics/bluprint';
  // actions: [ copy(['a', 'b']), render({ files: ['README.md'] }), ... ]
  ```

  - Conditional actions use a `when: (ctx) => boolean` predicate instead of the old
    `condition` tuple.
  - New actions: `run` (arbitrary function), `json`/`yaml` (structured edits),
    `append`/`prepend` (add content to files).
  - The fetch-time `mergeJson` option is gone — use the `json` action to merge
    structured data.

  ### CLI
  - Command names are unchanged (`add`, `start`, `clone`, `new`, `remove`,
    `token`), plus a new **`preview`** command that scaffolds a local, in-progress
    bluprint into a temp directory so authors can test before publishing.
  - User config moved from `~/.bluprintrc` to `~/.bluprint/profile.json`. On first
    run, an existing `~/.bluprintrc` (registered bluprints + token) is imported
    automatically.

  ### Library API

  The package now exports `defineConfig` and the action functions (for authoring
  bluprints), rather than the command functions. Imports are ES modules.

  ### Infrastructure
  - **Node** ≥ 20 (was ≥ 8); ESM (`"type": "module"`); package manager is pnpm.
  - Rewritten in **TypeScript** with published `.d.ts` types.
  - Runtime schema validation (Ajv) removed — the config is validated by the
    TypeScript compiler and `defineConfig`.
  - Tests migrated from Mocha/Sinon/expect.js to **Vitest**, co-located with source.
  - **rollup** v1 → v4, **minimatch** v3 → v10, and other deps updated.
  - Version management via **changesets**; new GitHub Actions release + docs workflows.

  ## Migration guide
  1. **Update Node** to 20 or later.
  2. **Convert `.bluprintrc` → `bluprint.config.ts`.** Run `bluprint new` for a
     starter, then port your config: actions become imported function calls,
     `condition` becomes `when`, and `mergeJson` becomes a `json` action. See the
     [docs](https://reuters-graphics.github.io/bluprint/).
  3. **CLI users**: nothing to do — your registered bluprints and token are
     imported from `~/.bluprintrc` on first run.
  4. **Library importers**: import `defineConfig` and actions from the package
     using ES module syntax.

  ## What's not changed
  - A bluprint is still just a GitHub repo, distributed by `git push`.
  - The CLI command names (other than the added `preview`).
  - Public and private repos are both supported.
