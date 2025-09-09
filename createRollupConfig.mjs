import typescript from '@rollup/plugin-typescript';
import run from '@rollup/plugin-run';
import fs from 'node:fs';
import process from 'node:process';

import terser from '@rollup/plugin-terser';
import { getBabelOutputPlugin, babel } from '@rollup/plugin-babel';

const { name, dependencies, peerDependencies } = JSON.parse(
  fs.readFileSync(process.cwd() + '/package.json'),
);
const external = [
  ...Object.keys(dependencies || {}),
  ...Object.keys(peerDependencies || {}),
];

const babelES5BaseConfig = {
  babelrc: false,
  presets: [
    [
      '@babel/env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: { version: 3, proposals: false },
      },
    ],
  ],
};

const babelES9BaseConfig = {
  babelrc: false,
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: '12',
        },
        modules: false,
        useBuiltIns: 'usage',
        corejs: { version: 3, proposals: false },
      },
    ],
  ],
};

const babelUMDConfig = {
  babelrc: false,
  allowAllFormats: true,
  presets: [
    [
      '@babel/env',
      {
        modules: 'umd',
        useBuiltIns: 'entry',
        corejs: { version: 3, proposals: false },
        exclude: ['@babel/plugin-transform-regenerator'],
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-transform-modules-umd',
      {
        globals: {
          '@merkur/core': getGlobalName('@merkur/core'),
          '@merkur/plugin-component': getGlobalName('@merkur/plugin-component'),
          '@merkur/plugin-event-emitter': getGlobalName(
            '@merkur/plugin-event-emitter',
          ),
          '@merkur/plugin-http-client': getGlobalName(
            '@merkur/plugin-http-client',
          ),
          '@merkur/plugin-error': getGlobalName('@merkur/plugin-error'),
          '@merkur/integration': getGlobalName('@merkur/integration'),
          '@merkur/integration-react': getGlobalName(
            '@merkur/integration-react',
          ),
          '@merkur/plugin-css-scrambler': getGlobalName(
            '@merkur/plugin-css-scrambler',
          ),
          'node-fetch': 'fetch',
        },
        exactGlobals: true,
      },
    ],
  ],
  moduleId: name,
};

function getGlobalName(name) {
  return `Merkur.${name
    .replace(/(@merkur\/)/g, '')
    .replace(/(plugin-)/g, 'Plugin.')
    .replace(/[-]/g, '')
    .replace(
      /([^.]*)$/,
      (merkurPackage) =>
        merkurPackage[0].toUpperCase() +
        merkurPackage.slice(1, merkurPackage.length),
    )}`;
}

function createRollupConfig() {
  const config = {
    input: 'src/index.js',
    treeshake: {
      moduleSideEffects: 'no-external',
    },
    plugins: [
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        babelrc: false,
        configFile: false,
        presets: [
          [
            '@babel/preset-react',
            {
              pragma: 'h',
              pragmaFrag: 'Fragment',
              runtime: 'classic',
            },
          ],
        ],
      }),
    ],
    external,
  };

  return config;
}

function createRollupESConfig() {
  let config = createRollupConfig();

  config.output = [
    {
      dir: './lib',
      entryFileNames: '[name].cjs',
      format: 'cjs',
      exports: 'named',
    },
    {
      dir: './lib',
      entryFileNames: '[name].js',
      format: 'cjs',
      exports: 'named',
    },
    {
      dir: './lib',
      entryFileNames: '[name].mjs',
      format: 'esm',
      exports: 'named',
    },
  ];

  return config;
}

function createRollupES5Config() {
  let config = createRollupConfig();

  config.output = [
    {
      dir: './lib',
      entryFileNames: '[name].es5.js',
      format: 'cjs',
      exports: 'named',
      plugins: [getBabelOutputPlugin(babelES5BaseConfig), terser()],
    },
  ];

  return config;
}

function createRollupES9Config() {
  let config = createRollupConfig();

  config.output = [
    {
      dir: './lib',
      entryFileNames: '[name].es9.cjs',
      format: 'cjs',
      exports: 'named',
      plugins: [getBabelOutputPlugin(babelES9BaseConfig)],
    },
    {
      dir: './lib',
      entryFileNames: '[name].es9.mjs',
      format: 'esm',
      exports: 'named',
      plugins: [getBabelOutputPlugin(babelES9BaseConfig)],
    },
  ];

  return config;
}

function createRollupUMDConfig() {
  let config = createRollupConfig();

  config.output = [
    {
      dir: './lib',
      entryFileNames: '[name].umd.js',
      format: 'esm',
      plugins: [],
    },
  ];

  config.plugins.push(getBabelOutputPlugin(babelUMDConfig), terser());

  return config;
}

function createRollupTypescriptConfig(options = {}) {
  let config = createRollupConfig();

  config.input = options?.input ?? './src/index.ts';
  config.watch = {
    include: 'src/**',
  };

  config.output = [
    {
      dir: options?.dir ?? './lib',
      entryFileNames: `[name]${options?.postfix ? `.${options?.postfix}` : ''}.cjs`,
      format: 'cjs',
      exports: 'named',
    },
    {
      dir: options?.dir ?? './lib',
      entryFileNames: `[name]${options?.postfix ? `.${options?.postfix}` : ''}.js`,
      format: 'cjs',
      exports: 'named',
    },
    {
      dir: options?.dir ?? './lib',
      entryFileNames: `[name]${options?.postfix ? `.${options?.postfix}` : ''}.mjs`,
      format: 'esm',
      exports: 'named',
    },
  ];

  config.external = [...config.external, ...(options?.external ?? [])];

  config.plugins.push(
    typescript({
      target: options?.target ?? 'ES2020',
      outDir: options?.dir ?? './lib',
      sourceMap: options.watchMode,
    }),
    options.watchMode &&
      run({
        execArgv: ['-r', 'source-map-support/register'],
      }),
  );

  return config;
}

function createRollupTypescriptES9Config(options = {}) {
  return createRollupTypescriptConfig({
    ...options,
    target: 'ES2018',
    postfix: 'es9',
  });
}

export default createRollupConfig;

export {
  createRollupConfig,
  createRollupESConfig,
  createRollupES5Config,
  createRollupES9Config,
  createRollupUMDConfig,
  createRollupTypescriptConfig,
  createRollupTypescriptES9Config,
};
