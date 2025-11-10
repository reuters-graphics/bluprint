---
"@reuters-graphics/bluprint": major
---

# Major Rewrite to v1.0.0

This is a complete rewrite of bluprint with modern tooling and significant breaking changes.

## Breaking Changes

### Infrastructure
- **Node.js requirement**: Minimum Node version is now 20.0.0 (was 8.0.0)
- **Package manager**: Migrated from npm/yarn to pnpm
- **Module system**: Now uses ES modules (`"type": "module"`) instead of CommonJS

### TypeScript Migration
- Complete rewrite in TypeScript with full type definitions
- All source code migrated from JavaScript to TypeScript
- Type definitions (`.d.ts`) now included in published package
- Schema validation migrated from Ajv to Valibot

### Testing
- Test framework changed from Mocha to Vitest
- Assertion library changed from expect.js to Vitest's built-in expect
- Mocking changed from Sinon to Vitest's built-in mocking utilities
- Tests are now co-located with source files

### Dependencies
- Removed: `ajv`, `mocha`, `expect.js`, `sinon`, `mocha-sinon`, `memfs`, `eslint-plugin-mocha`
- Added: `valibot`, `vitest`, `@vitest/coverage-v8`, `typescript`, and various `@types/*` packages
- Updated: `rollup` v1 → v4, `minimatch` v3 → v10, and other dependencies to latest versions

### Release Management
- Integrated changesets for version management
- New GitHub Actions workflow for automated releases
- Test workflow now runs on Node 20 and 22

## Migration Guide

If you're using bluprint in your projects:

1. **Update Node.js**: Ensure you're running Node 20 or later
2. **API compatibility**: The CLI interface and `.bluprintrc` format remain the same - no changes needed to your bluprints
3. **If importing bluprint as a library**: TypeScript types are now available, and imports should use ES module syntax

## What's Not Changed

- The CLI interface remains the same
- `.bluprintrc` format is unchanged
- All actions work exactly as before
- Bluprints created with previous versions are fully compatible
