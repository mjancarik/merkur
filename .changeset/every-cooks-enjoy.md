---
"@merkur/create-widget": minor
---

Add `--skip-install` flag to skip `npm install` after creating a new widget

- **What** Added a `--skip-install` CLI flag to the `create-widget` script. When provided, the `npm install` step is skipped and a reminder message is printed instead.
- **Why** Allows users to create a new widget without immediately running `npm install`, which is useful in CI environments or when the user wants to inspect or modify the generated files before installing dependencies.
- **How** Nothing.
