---
layout: docs
title: Merkur CLI
---

# Merkur CLI

Merkur CLI for building your widget use [esbuild](https://esbuild.github.io/) tool which improve performance of development process and build tasks over [webpack](https://webpack.js.org/). The merkur CLi is configurable with `merkur.config.mjs` file which is in root of your project.

The full merkur config can be look like:

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function ({ cliConfig, emitter,  }) {
  return {
    extends: [ '@merkur/preact/cli' ], // Merkur predefined extender
    task: { // defined tasks to building your widget, default are node, es13 and es9
      node: {
        name: 'node',
        build: ESBuildConfiguration, // https://esbuild.github.io/api/#build
      }
      es13: {
        name: 'es13',
        build: ESBuildConfiguration, // https://esbuild.github.io/api/#build
      }
      es9: {
        name: 'es9',
        build: ESBuildConfiguration, // https://esbuild.github.io/api/#build
      }
    },
    devServer: { // configuration for Merkur dev server
      protocol: 'http:',
      host: 'localhost:4445',
      port: 4445,
      staticPath: '/static',
      staticFolder: '{project_folder}/build/static',
      origin: 'http://localhost:4445'
    },
    defaultEntries: {
    // entries for your project, you can override it with creating /src/entries/{client|server.js} file
      client: [
        '{project_folder}/node_modules/@merkur/preact/entries/client.js'
      ],
      server: [
        '{project_folder}/node_modules/@merkur/preact/entries/server.js'
      ]
    },
    playground: {
      template: '{project_folder}/node_modules/@merkur/cli/src/templates/playground.ejs',
      templateFolder: '{project_folder}/node_modules/@merkur/cli/src/templates',
      path: '/',
      widgetHandler: AsyncFunction,
      widgetParams: Function,
    },
    socketServer: { 
      protocol: 'ws:',
      host: 'localhost:4321',
      port: 4321
    },
    widgetServer: {  // configuration for Merkur widget production server
      protocol: 'http:',
      host: 'localhost:4444',
      port: 4444,
      staticPath: '/static',
      staticFolder: '{project_folder}/build/static',
      buildFolder: '{project_folder}/build',
      clusters: 3,
      origin: 'http://localhost:4444'
    },
    HMR: true,
    constant: {
      HOST: 'localhost',
    }
    onCliConfig, Function, //extending hook for cli config,
    onMerkurConfig: Function, // extending hook for merkur config,
    onTaskConfig: Function, // extending hook for task config,
    onTaskBuild, Function, // extending hook esbuild config
  };
}
```

## Commands

- `merkur dev` - build your widget with with NODE_ENV = 'development' and with watch mode
- `merkur build` - build your widget with NODE_ENV = 'production'
- `merkur test` - run defined widget tests with NODE_ENV = 'test'
- `merkur start` - run widget server and playground server