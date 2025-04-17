const { createAssets } = require('../index.js');
const fs = require('node:fs');

const staticFolder = 'build/static';
const staticBaseUrl = 'https://seznam.cz/static';
const folders = ['es11', 'es9', 'css', 'maps'];
const assetsDictionary = {
  'polyfill.js': {
    name: 'polyfill.js',
    type: 'script',
  },
  'widget.js': {
    name: 'widget.js',
    type: 'script',
  },
  'style.css': {
    name: 'style.css',
    type: 'stylesheet',
  },
  'maps/vectors.json': {
    name: 'maps/vectors.json',
    type: 'json',
  },
};
const nonExistingAsset = {
  name: 'maps/non-existing.json',
  type: 'inlineJson',
};

jest.mock('node:fs', () => {
  const originalModule = jest.requireActual('fs');
  const manifests = {
    [`${staticFolder}/css/manifest.json`]:
      '{"style.css":"style.c3e64bd85803ef0e5583.css"}',
    [`${staticFolder}/es9/manifest.json`]:
      '{"widget.css": "widget.96a1e61f8f77442b9837.css", "widget.js": "widget.fdf95165e917b666fc62.js"}',
    [`${staticFolder}/es11/manifest.json`]:
      '{"widget.css": "widget.6f79bbbdbeda640aeda0.css", "widget.js": "widget.53fbc48b6fb616ecfd1b.js"}',
    [`${staticFolder}/maps/manifest.json`]:
      '{"maps/vectors.json": "vectors.json", "maps/non-existing.json": "non-existing.json"}',
  };
  const localFiles = {
    [`${staticFolder}/css/style.c3e64bd85803ef0e5583.css`]:
      'body { color: red; }',
    [`${staticFolder}/es9/widget.fdf95165e917b666fc62.js`]:
      "console.log('ES9 version of widget');",
    [`${staticFolder}/es11/widget.53fbc48b6fb616ecfd1b.js`]:
      "console.log('ES11 version of widget');",
    [`${staticFolder}/maps/vectors.json`]:
      '{"1100": "M13.5,0 L0,0 L0,13.5 Z", "1200": "M14.5,0 L0,0 L0,13.5 Z"}',
  };

  return {
    __esModule: true,
    ...originalModule,
    promises: {
      ...originalModule.promises,
      readFile: jest.fn(async (path) => {
        if (path.endsWith('manifest.json')) {
          return manifests[path];
        }

        if (localFiles[path]) {
          return localFiles[path];
        }

        throw new Error(`File not found: ${path}`);
      }),
    },
  };
});

global.console.warn = jest.fn();

async function readManifest(path) {
  return JSON.parse(await fs.promises.readFile(path, 'utf-8'));
}

async function readAssetLocalFileBasedOnManifest(manifestPath, assetName) {
  const manifest = await readManifest(manifestPath);
  const fileName = manifest[assetName];

  return fs.promises.readFile(
    manifestPath.replace('manifest.json', fileName),
    'utf-8',
  );
}

describe('createAssets method', () => {
  let assets = {};
  let assetsWithUrlSources;

  beforeAll(async () => {
    assetsWithUrlSources = [
      {
        ...assetsDictionary['widget.js'],
        source: {
          es9: `${staticBaseUrl}/es9/${
            (await readManifest(`${staticFolder}/es9/manifest.json`))[
              'widget.js'
            ]
          }`,
          es11: `${staticBaseUrl}/es11/${
            (await readManifest(`${staticFolder}/es11/manifest.json`))[
              'widget.js'
            ]
          }`,
        },
      },
      {
        ...assetsDictionary['style.css'],
        source: `${staticBaseUrl}/css/${
          (await readManifest(`${staticFolder}/css/manifest.json`))['style.css']
        }`,
      },
      {
        ...assetsDictionary['maps/vectors.json'],
        source: `${staticBaseUrl}/maps/${
          (await readManifest(`${staticFolder}/maps/manifest.json`))[
            'maps/vectors.json'
          ]
        }`,
      },
    ];
  });

  beforeEach(() => {
    assets = Object.values(assetsDictionary);
  });

  it('should read manifests and add source to assets', async () => {
    const processed = await createAssets({
      assets,
      staticFolder,
      staticBaseUrl,
      folders,
    });

    expect(fs.promises.readFile).toHaveBeenCalled();
    expect(processed).toStrictEqual(assetsWithUrlSources);
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
    const originalAssets = JSON.parse(JSON.stringify(assets));

    await createAssets({
      assets,
      staticFolder,
      staticBaseUrl,
      folders,
    });

    expect(assets).toStrictEqual(originalAssets);
  });

  it('should read a local file and use it as the source of the inline asset, inlineJson should be parsed', async () => {
    const processed = await createAssets({
      assets: [
        {
          ...assetsDictionary['widget.js'],
          type: 'inlineScript',
        },
        {
          ...assetsDictionary['style.css'],
          type: 'inlineStyle',
        },
        {
          ...assetsDictionary['maps/vectors.json'],
          type: 'inlineJson',
        },
      ],
      folders,
      staticBaseUrl,
      staticFolder,
    });

    expect(processed).toStrictEqual([
      {
        ...assetsDictionary['widget.js'],
        type: 'inlineScript',
        source: {
          es9: await readAssetLocalFileBasedOnManifest(
            `${staticFolder}/es9/manifest.json`,
            'widget.js',
          ),
          es11: await readAssetLocalFileBasedOnManifest(
            `${staticFolder}/es11/manifest.json`,
            'widget.js',
          ),
        },
      },
      {
        ...assetsDictionary['style.css'],
        type: 'inlineStyle',
        source: await readAssetLocalFileBasedOnManifest(
          `${staticFolder}/css/manifest.json`,
          'style.css',
        ),
      },
      {
        ...assetsDictionary['maps/vectors.json'],
        type: 'inlineJson',
        source: JSON.parse(
          await readAssetLocalFileBasedOnManifest(
            `${staticFolder}/maps/manifest.json`,
            'maps/vectors.json',
          ),
        ),
      },
    ]);
  });

  it.each([
    { command: 'test', writeToDisk: false },
    { command: 'dev', writeToDisk: true },
  ])(
    'should ignore an error if the file is not found and cliConfig is %p and it should use an url as the source',
    async (cliConfig) => {
      const processed = await createAssets({
        assets: [
          {
            ...assetsDictionary['style.css'],
            type: 'inlineStyle',
          },
          nonExistingAsset,
        ],
        cliConfig,
        folders,
        staticBaseUrl,
        staticFolder,
      });

      expect(processed).toStrictEqual([
        {
          ...assetsDictionary['style.css'],
          type: 'inlineStyle',
          source: await readAssetLocalFileBasedOnManifest(
            `${staticFolder}/css/manifest.json`,
            'style.css',
          ),
        },
        {
          ...nonExistingAsset,
          source: `${staticBaseUrl}/maps/${
            (await readManifest(`${staticFolder}/maps/manifest.json`))[
              'maps/non-existing.json'
            ]
          }`,
        },
      ]);
    },
  );

  it.each([
    { command: 'test', writeToDisk: true },
    { command: 'start', writeToDisk: true },
  ])(
    'should throw an error if the file is not found and cliConfig is %p',
    async (cliConfig) => {
      await expect(
        createAssets({
          assets: [
            {
              ...assetsDictionary['style.css'],
              type: 'inlineStyle',
            },
            nonExistingAsset,
          ],
          cliConfig,
          folders,
          staticBaseUrl,
          staticFolder,
        }),
      ).rejects.toThrow(
        new Error(
          `File not found: ${staticFolder}/maps/${
            (await readManifest(`${staticFolder}/maps/manifest.json`))[
              'maps/non-existing.json'
            ]
          }`,
        ),
      );
    },
  );

  it('should be able to use staticBaseUrl ending with /', async () => {
    const processed = await createAssets({
      assets,
      folders,
      staticBaseUrl: `${staticBaseUrl}/`,
      staticFolder,
    });

    expect(processed).toStrictEqual(assetsWithUrlSources);
  });

  it('should use folders from a merkur configuration', async () => {
    const processed = await createAssets({
      assets: [assetsDictionary['widget.js']],
      merkurConfig: {
        task: {
          es9: {
            build: { platform: 'browser' },
            folder: 'es9',
            name: 'es9',
          },
          es11: {
            build: { platform: 'browser' },
            folder: 'es11',
            name: 'es11',
          },
        },
      },
      staticBaseUrl,
      staticFolder,
    });

    expect(processed).toStrictEqual(
      assetsWithUrlSources.filter(({ name }) => name === 'widget.js'),
    );
  });

  it('should ignore folders without the manifest', async () => {
    const processed = await createAssets({
      assets,
      staticBaseUrl,
      staticFolder,
      folders: [...folders, 'non-existing-folder'],
    });

    expect(processed).toStrictEqual(assetsWithUrlSources);
  });
});
