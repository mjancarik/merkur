const path = require('path');
const fs = require('fs');

const fsp = fs.promises;

function memo(fn, options = { generateKey: () => {} }) {
  let store = {};
  return (...rest) => {
    const cacheKey = options.generateKey(...rest);

    if (!store[cacheKey]) {
      store[cacheKey] = fn(...rest);
    }

    return store[cacheKey];
  };
}

async function createAssets({ assets, staticFolder, folders, staticBaseUrl }) {
  if (staticBaseUrl.endsWith('/')) {
    staticBaseUrl = staticBaseUrl.slice(0, -1);
  }

  return folders.reduce(async (assets, folder) => {
    assets = await assets;
    const folderPath = path.join(staticFolder, folder);

    const manifestFile = await fsp.readFile(
      path.join(folderPath, 'manifest.json'),
      { encoding: 'utf-8' }
    );
    const manifest = JSON.parse(manifestFile);

    return Promise.all(
      assets.map(async (asset) => {
        if (
          !asset.name ||
          !manifest[asset.name] ||
          typeof asset.source === 'string'
        ) {
          return asset;
        }

        if (asset.type.includes('inline')) {
          asset.source = await fsp.readFile(
            path.join(folderPath, manifest[asset.name]),
            { encoding: 'utf-8' }
          );

          return asset;
        }

        if (asset.type === 'stylesheet') {
          asset.source = `${staticBaseUrl}/${folder}/${manifest[asset.name]}`;

          return asset;
        }

        asset.source = asset.source || {};
        asset.source[folder] = `${staticBaseUrl}/${folder}/${
          manifest[asset.name]
        }`;

        return asset;
      })
    );
  }, assets);
}

module.exports = {
  createAssets,
  memo,
};
