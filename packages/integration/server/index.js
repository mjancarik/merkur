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

async function processAssetInFolder({
  asset,
  folder,
  fileName,
  staticFolder,
  staticBaseUrl,
}) {
  if (!asset.name || !fileName || typeof asset.source === 'string') {
    return asset;
  }

  if (asset.type.includes('inline')) {
    asset.source = await fsp.readFile(
      path.join(staticFolder, folder, fileName),
      { encoding: 'utf-8' },
    );

    return asset;
  }

  if (asset.type === 'stylesheet') {
    asset.source = `${staticBaseUrl}/${folder}/${fileName}`;

    return asset;
  }

  asset.source = asset.source || {};
  asset.source[folder] = `${staticBaseUrl}/${folder}/${fileName}`;

  return asset;
}

async function createAssets({ assets, staticFolder, folders, staticBaseUrl }) {
  if (staticBaseUrl.endsWith('/')) {
    staticBaseUrl = staticBaseUrl.slice(0, -1);
  }

  const processedAssets = await folders.reduce(
    async (assets, folder) => {
      assets = await assets;
      const folderPath = path.join(staticFolder, folder);

      const manifestFile = await fsp.readFile(
        path.join(folderPath, 'manifest.json'),
        { encoding: 'utf-8' },
      );
      const manifest = JSON.parse(manifestFile);

      return Promise.all(
        assets.map(async (asset) =>
          processAssetInFolder({
            asset: { ...asset },
            folder,
            fileName: manifest[asset.name],
            staticBaseUrl,
            staticFolder,
          }),
        ),
      );
    },
    [...assets],
  );

  return processedAssets.filter((asset) => {
    if (!asset.source) {
      console.warn(
        `Asset '${asset.name}' has been excluded because it doesn't have valid source.`,
      );
      return false;
    }

    return true;
  });
}

module.exports = {
  createAssets,
  memo,
};
