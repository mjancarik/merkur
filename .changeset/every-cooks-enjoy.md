---
"@merkur/create-widget": patch
---

Add missing `.npmignore` rule so template `.gitignore` is included in the published package

- **What** Added `!/template/.gitignore` to `.npmignore`. Without this entry npm was stripping the template `.gitignore` file from the published package, so newly scaffolded projects had no `.gitignore`.
- **Why** The npm default ignore rules exclude dot-files; an explicit negation rule is required to keep them.
- **How** Nothing — the fix is internal to the published package.
