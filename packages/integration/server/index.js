const path = require('node:path');
const fs = require('node:fs');

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

      try {
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
      } catch (error) {
        console.error(error);
        return assets;
      }
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

const moduleCache = new Map();
function getFileStats(modulePath) {
  return fs.statSync(modulePath, { throwIfNoEntry: false });
}

function deleteCache(modulePath, force = false) {
  const stats = getFileStats(modulePath) ?? { mtimeMs: -1 };

  if (!moduleCache.has(modulePath)) {
    moduleCache.set(modulePath, stats);
  }

  if (!modulePath) {
    return;
  }

  if (force || stats.mtimeMs > moduleCache.get(modulePath).mtimeMs) {
    moduleCache.set(modulePath, stats);

    searchCache(modulePath, function (mod) {
      delete require.cache[mod.id];
    });
  }
}

function searchCache(moduleName, callback) {
  if (moduleName && require.cache[moduleName] !== undefined) {
    const module = require.cache[moduleName];

    traverse(module, callback);

    Object.keys(module.constructor._pathCache).forEach(function (cacheKey) {
      if (cacheKey.indexOf(moduleName) > -1) {
        delete module.constructor._pathCache[cacheKey];
      }
    });
  }
}

function traverse(module, callback) {
  (module?.children || []).forEach(function (child) {
    if (child && require.cache[child.id] !== undefined) {
      traverse(require.cache[child.id], callback);
    }
  });

  callback(module);
}

function requireUncached(module, options = {}) {
  const modulePath = path.resolve(module);

  if (process.env.NODE_WATCH === 'true') {
    if (options.optional && modulePath && !getFileStats(modulePath)) {
      return;
    }

    deleteCache(modulePath);

    // Force delete cache on all dependencies
    if (Array.isArray(options.dependencies)) {
      options.dependencies.forEach((dep) =>
        deleteCache(path.resolve(dep), true),
      );
    }
  }
}

function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  requireUncached,
  asyncMiddleware,
  createAssets,
  memo,
};
