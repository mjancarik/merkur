---
"@merkur/create-widget": minor
---

Add support for scaffolding into the current directory using `.`

- **What** `create.mjs` now accepts `.` as the directory argument, using `process.cwd()` as the target instead of trying to create a new directory. `projName` is derived from the resolved path basename so it is never literally `"."`. Updated README and website getting-started docs with a `.` usage example.
- **Why** Users working in a pre-created or cloned directory (e.g. after `mkdir my-widget && cd my-widget` or after cloning an empty repo) previously got an "already exists" error because `.` always resolves to an existing path. Passing `.` is a natural and common CLI convention for "here".
- **How** Nothing.
