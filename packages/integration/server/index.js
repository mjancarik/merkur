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

async function createAssets({
  assets,
  staticFolder,
  ecmaversions,
  staticBaseUrl,
}) {
  return ecmaversions.reduce(async (assets, ecmaversion) => {
    assets = await assets;
    const folder = path.join(staticFolder, ecmaversion);

    const manifestFile = await fsp.readFile(
      path.join(folder, 'manifest.json'),
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
            path.join(folder, manifest[asset.name]),
            { encoding: 'utf-8' }
          );

          return asset;
        }

        if (asset.type === 'stylesheet') {
          asset.source = `${staticBaseUrl}/${ecmaversion}/${
            manifest[asset.name]
          }`;

          return asset;
        }

        asset.source = asset.source || {};
        asset.source[ecmaversion] = `${staticBaseUrl}/${ecmaversion}/${
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
