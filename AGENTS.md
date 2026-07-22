# AGENTS.md

## Project overview

Merkur is a tiny, extensible JavaScript library for building **micro frontends**
(front-end microservices) with **server-side rendering enabled by default**. It
supports multiple templating libraries (Preact, µhtml, Svelte, and vanilla
template literals) and is extended through plugins.

Packages are published to the public npm registry under the `@merkur/*` scope.

## Repository layout

This is an **Nx-managed npm workspaces monorepo**. All publishable packages live
under `packages/*` and are published under the `@merkur/*` scope.

```
packages/
├── core/                        # @merkur/core — core library
├── cli/                         # @merkur/cli — command-line tooling
├── create-widget/               # @merkur/create-widget — project scaffolding (npx @merkur/create-widget)
├── integration/                 # framework integration base
├── integration-react/           # React integration
├── integration-custom-element/  # custom element integration
├── preact/                      # Preact templating adapter
├── svelte/                      # Svelte templating adapter
├── uhtml/                       # µhtml templating adapter
├── plugin-component/            # reusable component loading and rendering
├── plugin-css-scrambler/        # scopes/scrambles CSS class names
├── plugin-error/                # error handling and reporting
├── plugin-event-emitter/        # event emitter for widget communication
├── plugin-graphql-client/       # GraphQL client integration
├── plugin-http-cache/           # caches HTTP responses (SSR hydration)
├── plugin-http-client/          # HTTP client for API requests
├── plugin-router/               # client/server routing
├── plugin-select-preact/        # Preact state selector/binding
├── plugin-session-storage/      # session storage access
├── plugin-validation/           # data validation
├── tool-webpack/                # build/dev tooling
├── tool-storybook/              # Storybook integration
└── tools/                       # shared Merkur CLI tools (merkur-tools)
website/                         # Docusaurus documentation site (merkur.js.org)
utils/                           # Release and maintenance scripts
package.json                     # workspaces list + all top-level scripts
nx.json                          # Nx task pipeline
jest.config.js                   # Jest config
.eslintrc.js                     # ESLint config
tsconfig.json                    # shared TypeScript config
createRollupConfig.mjs           # shared Rollup config
.changeset/                      # Changesets release management
```

Each package under `packages/*` follows the same layout:

```
src/                # source code
lib/                # build output (Rollup) — generated, do not edit
package.json        # per-package manifest + build/test scripts
```

## Setup

Assume fixed toolchain versions everywhere; don't check for or support others.

- Node.js **24** (pinned in `.nvmrc`) — run `nvm use` first.

```bash
npm ci
```

A `postinstall` hook runs `npm run build`, so installing also builds all
packages via Nx.

## Common commands

Run from the repository root unless noted otherwise.

```bash
npm run build # build all packages (nx run-many -t build)
npm run test # run all tests (nx run-many -t test)
npm run lint # lint the codebase
npm run lint:fix # lint and auto-fix
npm run test:es:version # verify emitted ES version compatibility
```

To target a single package, use Nx directly, e.g.:

```bash
npx nx build @merkur/core
npx nx test @merkur/core
```

## Conventions

- **Changesets are mandatory** for every MR.
- Tests run with Jest, in `__tests__` folders or `*.spec.js` / `*.test.js`
  consistent with the surrounding package.
- Keep changes scoped to the package you are working in and match its existing style.
- The authoritative release process lives **only** in the root `README.md`.
  Ignore any per-package README sections describing a Lerna/Conventional
  Commits flow — they are outdated.

## Don't

- Don't run `npm install` inside packages.
- Don't bump versions or edit CHANGELOG.md manually — use changesets.
