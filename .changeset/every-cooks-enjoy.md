---
"@merkur/create-widget": major
---

Drop support for Node.js <22 and fix `.npmignore` template path typo

- **What** Bumped the minimum Node.js engine requirement from `>=20` to `>=22` in `package.json`. Fixed a typo in `.npmignore` where `!/templates/.gitignore` was corrected to `!/template/.gitignore`.
- **Why** Node.js 20 reached end-of-life in April 2026. The `.npmignore` typo caused the template `.gitignore` file to be incorrectly excluded from the published package.
- **How** Upgrade to Node.js 22 or higher before updating to this version.
