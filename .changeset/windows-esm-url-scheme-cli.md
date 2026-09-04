---
"@merkur/cli": patch
---

Fix loading of user-defined commands on Windows by converting the absolute path to a `file://` URL before dynamic `import()`.
- **What?** Wrap the absolute command path in `pathToFileURL(...).href` in `bin/merkur.mjs` when importing user-defined commands.
- **Why?** On Windows the ESM loader reads the drive letter (`C:`) as a URL scheme and throws `ERR_UNSUPPORTED_ESM_URL_SCHEME`, crashing command loading. POSIX paths start with `/`, so the bug was Windows-only.
- **How?** Nothing.
