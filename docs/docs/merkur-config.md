---
layout: docs
title: Merkur config
---

# Merkur config

The `merkur.config.mjs` file is main configuration file for Merkur [CLI]({{ '/docs/merkur-cli' | relative_url }}) and your project.

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
        folder: 'es13',
        build: ESBuildConfiguration, // https://esbuild.github.io/api/#build
      }
      es9: {
        name: 'es9',
        folder: 'es9',
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
      serverTemplateFolder: '{project_folder}/server/playground/templates',
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

## How to define custom task

For example we create custom task for bundling ES11 version of Merkur widget very simple.

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function ({ cliConfig, emitter,  }) {
  return {
    task: {
      es11: {
				name: 'es11',
        folder: 'es11',
				build: { // ESBuildConfiguration option
					platform: 'browser',
					target: 'es2020',
					outdir: `${cliConfig.staticFolder}/es11`
				}
			}
    },
  };
}
```

Or If you want to bundle Merkur widget and some JS asset for your Merkur widget with own entry point. You can use Merkur [CLI]({{ '/docs/merkur-cli' | relative_url }}) to define custom tasks for that asset. For example:

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function ({ cliConfig, emitter,  }) {
  return {
    task: {
      es13Asset: {
        name: 'es13Asset',
        folder: 'es13',
        build: { 
          entryPoints: `${cliConfig.projectFolder}/src/customAsset.js`,
          entryNames: !cliConfig.isProduction ? 'customAsset' : 'customAsset.[hash]',
          platform: 'browser',
          outdir: `${staticFolder}/es13`,
          plugins: merkurConfig.task['es13'].build.plugins,
        },
      },
      es9Asset: {
        name: 'es9Asset',
        folder: 'es9',
        build: {
          entryPoints: `${cliConfig.projectFolder}/src/customAsset.js`,
          entryNames: !cliConfig.isProduction ? 'customAsset' : 'customAsset.[hash]',
          platform: 'browser',
          target: 'es2018',
          outdir: `${staticFolder}/es9`,
          plugins: merkurConfig.task['es9'].build.plugins,
        },
      }
    },
    onCliConfig({ cliConfig }) {
      // add es13Asset task to be run for `merkur dev`
      if (cliConfig.command === 'dev') {
        cliConfig.runTask.push('es13Asset');
      }
    },
  };
}
```

## How to add esbuild plugin

By default Merkur [CLI]({{ '/docs/merkur-cli' | relative_url }}) as esbuild load only css files. If you want to use some css preprocessors like `less` or others. You must install esbuild plugin for that with `npm install esbuild-plugin-less --save dev` command. Then add new installed package in `merkur.config.js` to [esbuild](https://esbuild.github.io/) configuration.

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function ({ cliConfig, emitter,  }) {
  const loaders = [];

  try {
    const { lessLoader } = await import('esbuild-plugin-less');

    loaders.push(
      lessLoader({})
    );
  } catch {
    // Fail silently
  }

  return {
    onTaskBuild({ build }) {
      build.plugins.push(...loaders);

      return build;
    },
  };
}
```
The `esbuild-plugin-*` must be dynamic imported with `try/catch` block because `merkur.config.js` is used for all Merkur [CLI]({{ '/docs/merkur-cli' | relative_url }}) commands and of course for `merkur start` where dev dependencies can be missed. It depends on your CI/CD workflow. But we predict that you run `merkur start` command only with production dependencies where dev dependencies miss. 

Or you want to use [Tailwind CSS](https://tailwindui.com/) framework. You must install esbuild plugin with `npm install esbuild-plugin-tailwindcss --save dev` command. Then add new installed package in `merkur.config.js` to [esbuild](https://esbuild.github.io/) configuration. 

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function ({ cliConfig, emitter,  }) {
  const loaders = [];

  try {
    const { tailwindPlugin } = await import('esbuild-plugin-tailwindcss');

    loaders.push(
      tailwindPlugin({})
    );
  } catch {
    // Fail silently
  }

  return {
    onTaskBuild({ build }) {
      build.plugins.push(...loaders);

      return build;
    },
  };
}
```

You must create file `tailwind.config.js` at the root of the project.

```javascript
// ./tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // For more, see: https://tailwindcss.com/docs/configuration
};
```

You must create file index.css and import index.css file to `./src/widget.js`.

```css
 /* ./src/style.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

## How to override playground widgetParams to widget API

By default playground page pass all route query params to widgetParams. If you want to modify that logic which can be helpful for example with `@merkur/plugin-router` which route defined routes by `pathname` then is useful set widgetParams `pathname` to `req.path`. You can also reconfigure regular `path` for playground page for which playground page works.

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function ({ cliConfig, emitter, }) {
  return {
    playground: {
      widgetParams: req => {
        return new URLSearchParams({ pathname: req.path });
      },
      path: /(\/$|\/some-folder\/.*)/g
    }
  }
}
```