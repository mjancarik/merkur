const { createAssets } = require('../index.js');
const fs = require('node:fs');

const staticFolder = 'build/static';
const staticBaseUrl = 'https://seznam.cz/static';
const folders = ['es11', 'es9', 'css'];

const manifests = {
  'build/static/css/manifest.json':
    '{"style.css":"style.c3e64bd85803ef0e5583.css"}',
  'build/static/es9/manifest.json':
    '{"widget.css": "widget.96a1e61f8f77442b9837.css", "widget.js": "widget.fdf95165e917b666fc62.js"}',
  'build/static/es11/manifest.json':
    '{"widget.css": "widget.6f79bbbdbeda640aeda0.css", "widget.js": "widget.53fbc48b6fb616ecfd1b.js"}',
};

jest.mock('node:fs', () => {
  const originalModule = jest.requireActual('fs');

  return {
    __esModule: true,
    ...originalModule,
    promises: {
      ...originalModule.promises,
      readFile: jest.fn((path) => {
        return manifests[path];
      }),
    },
  };
});

global.console.warn = jest.fn();

describe('createAssets method', () => {
  let assets = {};

  beforeEach(() => {
    assets = [
      {
        name: 'polyfill.js',
        type: 'script',
      },
      {
        name: 'widget.js',
        type: 'script',
      },
      {
        name: 'style.css',
        type: 'stylesheet',
      },
    ];
  });

  it('should read manifests and add source to assets', async () => {
    const processed = await createAssets({
      assets,
      staticFolder,
      staticBaseUrl,
      folders,
    });

    expect(fs.promises.readFile).toHaveBeenCalled();
    expect(processed).toMatchSnapshot();
  });

  it('should warn about excluded files', async () => {
    await createAssets({
      assets,
      staticFolder,
      staticBaseUrl,
      folders,
    });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('polyfill.js'),
    );
  });

  it('should not modify original assets', async () => {
    await createAssets({
      assets,
      staticFolder,
      staticBaseUrl,
      folders,
    });

    expect(assets).toMatchInlineSnapshot(`
      [
        {
          "name": "polyfill.js",
          "type": "script",
        },
        {
          "name": "widget.js",
          "type": "script",
        },
        {
          "name": "style.css",
          "type": "stylesheet",
        },
      ]
    `);
  });
});
