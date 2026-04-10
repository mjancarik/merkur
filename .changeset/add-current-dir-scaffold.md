---
"@merkur/create-widget": minor
---

Add support for scaffolding into the current directory and `--skip-install` flag

- **What** `create.mjs` now accepts `.` as the directory argument, using `process.cwd()` as the target instead of trying to create a new directory. `projName` is derived from the resolved path basename so it is never literally `"."`. A new `--skip-install` flag skips the automatic `npm install` step. Updated README and website getting-started docs with usage examples.
- **Why** Users working in a pre-created or cloned directory (e.g. after `mkdir my-widget && cd my-widget` or after cloning an empty repo) previously got an "already exists" error because `.` always resolves to an existing path. `--skip-install` is useful in CI pipelines that manage their own dependency installation.
- **How** Nothing — both behaviours are opt-in.
