---
"@merkur/create-widget": major
---

Bump minimum Node.js requirement to 20 and update all dependencies to latest major versions

- **What** Updated the minimum Node.js engine requirement from `>=12` to `>=20` in `create-widget` and from `>=20` to `>=24` in the generated widget template. Updated `execa` (7→9), `inquirer` (9→13, `list` prompt type renamed to `select`), `express` (4→5), `helmet` (5→8), `cross-env` (7→10), `config` (3→4), `express-static-gzip` (2→3). Replaced the deprecated `cluster.isMaster` with `cluster.isPrimary` in the generated server template. Bumped `.nvmrc` in the template to Node 24.
- **Why** The previous dependencies were outdated and relied on Node.js APIs and package versions that are now deprecated or no longer maintained. Aligning with Node 20 LTS (tool) and Node 24 LTS (generated widgets) ensures users benefit from current security patches and modern APIs.
- **How** Upgrade your Node.js runtime to at least version 20 before running `@merkur/create-widget`. Newly generated widgets will require Node 24. If you have an existing generated project, update your `package.json` engines field to `>=24.0.0` and upgrade the listed server dependencies (`express`, `helmet`, `cross-env`, `config`, `express-static-gzip`) to the versions listed above.

