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

async function readAssetFile(filePath, postProcess) {
  const data = await fsp.readFile(filePath, { encoding: 'utf-8' });

  if (postProcess) {
    return postProcess(data);
  }

  return data;
}

async function processAssetInFolder({
  asset,
  folder,
  fileName,
  staticFolder,
  staticBaseUrl,
  cliConfig,
}) {
  if (!asset.name || !fileName || typeof asset.source === 'string') {
    return asset;
  }

  if (asset.type.includes('inline')) {
    try {
      const content = await readAssetFile(
        path.join(staticFolder, folder, fileName),
        asset.type === 'inlineJson' ? JSON.parse : undefined,
      );

      if (asset.type === 'inlineScript') {
        asset.source = asset.source || {};
        asset.source[folder] = content;
      } else {
        asset.source = content;
      }
    } catch (error) {
      // TODO remove (process.env.NODE_ENV !== 'development' && !cliConfig)
      if (
        (process.env.NODE_ENV !== 'development' && !cliConfig) ||
        (cliConfig?.writeToDisk && cliConfig?.command !== 'dev')
      ) {
        throw error;
      }
    }

    if (asset.source) {
      return asset;
    }
  }

  if (
    asset.type === 'stylesheet' ||
    asset.type === 'inlineStyle' ||
    asset.type === 'json' ||
    asset.type === 'inlineJson'
  ) {
    asset.source = `${staticBaseUrl}/${folder}/${fileName}`;

    return asset;
  }

  asset.source = asset.source || {};
  asset.source[folder] = `${staticBaseUrl}/${folder}/${fileName}`;

  return asset;
}

// TODO remove folders
async function createAssets({
  assets,
  staticFolder,
  staticBaseUrl,
  folders,
  cliConfig,
  merkurConfig,
}) {
  if (staticBaseUrl.endsWith('/')) {
    staticBaseUrl = staticBaseUrl.slice(0, -1);
  }

  folders =
    folders ||
    Object.values(merkurConfig?.task)
      .filter((task) => task.build.platform !== 'node')
      .map((task) => task.folder);

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
              cliConfig,
              merkurConfig,
            }),
          ),
        );
      } catch (error) {
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

const memoPathResolve = memo(path.resolve);
function requireUncached(module, options = {}) {
  const modulePath = memoPathResolve(module);
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

  return require(modulePath);
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
