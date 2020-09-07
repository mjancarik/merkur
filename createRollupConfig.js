import { terser } from 'rollup-plugin-terser';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

const { name, dependencies, peerDependencies } = require(__dirname +
  '/package.json');
const external = [
  ...Object.keys(dependencies || {}),
  ...Object.keys(peerDependencies || {}),
];

const babelBaseConfig = {
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
            '@merkur/plugin-event-emitter'
          ),
          '@merkur/plugin-http-client': getGlobalName(
            '@merkur/plugin-http-client'
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
        merkurPackage.slice(1, merkurPackage.length)
    )}`;
}

function createRollupConfig() {
  const config = {
    input: 'src/index.js',
    treeshake: {
      moduleSideEffects: 'no-external',
    },
    plugins: [],
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
      file: `./lib/index.es5.js`,
      format: 'cjs',
      exports: 'named',
      plugins: [getBabelOutputPlugin(babelBaseConfig)],
    },
  ];

  return config;
}

function createRollupUMDConfig() {
  let config = createRollupConfig();

  config.output = [
    {
      file: `./lib/index.umd.js`,
      format: 'esm',
      plugins: [],
    },
  ];

  config.plugins.push(getBabelOutputPlugin(babelUMDConfig), terser());

  return config;
}

export default createRollupConfig;

export {
  createRollupConfig,
  createRollupESConfig,
  createRollupES5Config,
  createRollupUMDConfig,
};
