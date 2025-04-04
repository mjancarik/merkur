import testScript from './testScript';

const loadingAssets = {};
const cache = {};

function _loadScript(asset, root) {
  if (!asset || typeof asset !== 'object' || asset instanceof Promise) {
    return asset;
  }

  if (asset.type === 'inlineScript') {
    const script = document.createElement('script');
    script.text = asset.source;
    root.appendChild(script);

    return asset.source;
  }

  loadingAssets[asset.source] = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.defer = true;
    script.onload = () => {
      delete loadingAssets[asset.source];
      resolve(asset.source);
    };
    script.onerror = () => {
      delete loadingAssets[asset.source];
      script.remove();
      const message = `Error loading script '${asset.source}'.`;

      if (asset.optional) {
        console.warn(message);
        resolve(null);
      } else {
        reject(new Error(message));
      }
    };
    script.src = asset.source;

    const { attr } = asset;
    if (attr && Object.keys(attr).length) {
      for (const name in attr) {
        const value = attr[name];

        if (typeof value === 'boolean') {
          if (value) {
            script.setAttribute(name, '');
          } else {
            script.removeAttribute(name);
          }
        } else {
          script.setAttribute(name, value);
        }
      }
    }

    root.appendChild(script);
  });

  return loadingAssets[asset.source];
}

function _loadStyle(asset, root) {
  if (!asset || typeof asset !== 'object' || asset instanceof Promise) {
    return asset;
  }

  if (asset.type === 'inlineStyle') {
    const style = document.createElement('style');
    style.innerHTML = asset.source;
    root.appendChild(style);

    return asset.source;
  }

  loadingAssets[asset.source] = new Promise((resolve) => {
    const link = document.createElement('link');
    link.onload = () => {
      delete loadingAssets[asset.source];
      resolve(asset.source);
    };
    link.onerror = () => {
      delete loadingAssets[asset.source];
      link.remove();
      console.warn(`Error loading stylesheet '${asset.source}'.`);
      resolve(null);
    };
    link.rel = 'stylesheet';
    link.href = asset.source;

    root.appendChild(link);
  });

  return loadingAssets[asset.source];
}

function loadStyleAssets(assets, root = document.head, shouldLoadLazy = false) {
  const styleElements = root.querySelectorAll('style');
  const stylesToRender = assets.map((asset) => {
    if (
      !['stylesheet', 'inlineStyle'].includes(asset.type) ||
      (asset.lazy && !shouldLoadLazy) ||
      (!asset.lazy && shouldLoadLazy) ||
      !asset.source
    ) {
      return null;
    }

    if (loadingAssets[asset.source]) {
      return loadingAssets[asset.source];
    }

    if (
      (asset.type === 'stylesheet' &&
        root.querySelector(`link[href='${asset.source}']`)) ||
      (asset.type === 'inlineStyle' &&
        Array.from(styleElements).reduce((acc, cur) => {
          if (cur.innerHTML === asset.source) {
            return true;
          }

          return acc;
        }, false))
    ) {
      return asset.source;
    }

    return asset;
  });

  return Promise.all(stylesToRender.map((asset) => _loadStyle(asset, root)));
}

async function loadScriptAssets(
  assets,
  root = document.head,
  shouldLoadLazy = false,
) {
  const scriptElements = root.querySelectorAll('script');
  const scriptsToRender = assets.map((asset) => {
    if (
      !['script', 'inlineScript'].includes(asset.type) ||
      (asset.lazy && !shouldLoadLazy) ||
      (!asset.lazy && shouldLoadLazy) ||
      (asset.test && testScript.test(asset.test))
    ) {
      return null;
    }

    const { source } = asset;
    const _asset = Object.assign({}, asset);

    if (source === Object(source)) {
      if (source.es13 && testScript.isES13Supported()) {
        _asset.source = source.es13;
      } else if (source.es11 && testScript.isES11Supported()) {
        _asset.source = source.es11;
      } else if (source.es9 && testScript.isES9Supported()) {
        _asset.source = source.es9;
      } else {
        _asset.source = null;
      }

      if (!_asset.source) {
        const message = `Asset '${_asset.name}' is missing ES variant and could not be loaded.`;

        if (!_asset.optional) {
          const error = new Error(message);
          error.asset = _asset;

          throw error;
        }

        console.warn(message);
        return null;
      }
    }

    if (loadingAssets[_asset.source]) {
      return loadingAssets[_asset.source];
    }

    if (
      (asset.type === 'script' &&
        root.querySelector(`script[src='${_asset.source}']`)) ||
      (asset.type === 'inlineScript' &&
        Array.from(scriptElements).reduce((acc, cur) => {
          if (cur.text === _asset.source) {
            return true;
          }

          return acc;
        }, false))
    ) {
      return _asset.source;
    }

    return _asset;
  });

  return Promise.all(scriptsToRender.map((asset) => _loadScript(asset, root)));
}

function loadAssets(assets, root) {
  return Promise.all([
    loadScriptAssets(assets, root),
    loadStyleAssets(assets, root),
  ]);
}

function _loadJsonAsset(asset) {
  cache[asset.source] = new Promise((resolve) => {
    (async () => {
      try {
        const response = await fetch(asset.source);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch from '${asset.source}' with status ${response.status} ${response.statusText}.`,
          );
        }

        cache[asset.source] = await response.json();
        resolve(cache[asset.source]);
      } catch (error) {
        delete cache[asset.source];
        console.warn(
          `Error loading JSON asset '${asset.name}': ${error.message}`,
        );
        resolve(null);
      }
    })();
  });

  return cache[asset.source];
}

function loadJsonAssets(assets, assetNames) {
  let containsPromise = false;

  const results = assetNames.map((assetName) => {
    const asset = assets.find(
      (asset) =>
        asset.name === assetName && ['json', 'inlineJson'].includes(asset.type),
    );

    if (!asset || !asset.source) {
      return null;
    }

    if (asset.type === 'inlineJson') {
      return asset.source;
    }

    if (cache[asset.source]) {
      if (cache[asset.source] instanceof Promise) {
        containsPromise = true;
      }

      return cache[asset.source];
    }

    containsPromise = true;

    return _loadJsonAsset(asset);
  });

  return containsPromise ? Promise.all(results) : results;
}

function mapAssetsToFlatArray(assetsByType, assetIndexMap) {
  return assetIndexMap.map(
    ({ typeIndex, index }) => assetsByType[typeIndex][index] || null,
  );
}

function loadLazyAssets(assets, assetNames, root) {
  const SCRIPT_INDEX = 0;
  const STYLE_INDEX = 1;
  const JSON_INDEX = 2;
  const INVALID_INDEX = 3;

  const assetIndexMap = [];
  const assetsByType = [];
  assetsByType[SCRIPT_INDEX] = [];
  assetsByType[STYLE_INDEX] = [];
  assetsByType[JSON_INDEX] = [];
  assetsByType[INVALID_INDEX] = [];

  const scriptsToLoad = [];
  const stylesToLoad = [];
  const jsonsToLoad = [];

  assetNames.forEach((assetName, index) => {
    const asset = assets.find((asset) => asset?.name === assetName);

    if (
      (asset?.type === 'script' || asset?.type === 'inlineScript') &&
      asset?.lazy
    ) {
      assetIndexMap[index] = {
        typeIndex: SCRIPT_INDEX,
        index: scriptsToLoad.length,
      };
      scriptsToLoad.push(asset);
    } else if (
      (asset?.type === 'stylesheet' || asset?.type === 'inlineStyle') &&
      asset?.lazy
    ) {
      assetIndexMap[index] = {
        typeIndex: STYLE_INDEX,
        index: stylesToLoad.length,
      };
      stylesToLoad.push(asset);
    } else if (asset?.type === 'json' || asset?.type === 'inlineJson') {
      assetIndexMap[index] = {
        typeIndex: JSON_INDEX,
        index: jsonsToLoad.length,
      };
      jsonsToLoad.push(asset);
    } else {
      assetIndexMap[index] = {
        typeIndex: INVALID_INDEX,
        index: assetsByType[INVALID_INDEX].length,
      };
      assetsByType[INVALID_INDEX].push(null);
    }
  });

  if (scriptsToLoad.length) {
    assetsByType[SCRIPT_INDEX] = loadScriptAssets(scriptsToLoad, root, true);
  }

  if (stylesToLoad.length) {
    assetsByType[STYLE_INDEX] = loadStyleAssets(stylesToLoad, root, true);
  }

  if (jsonsToLoad.length) {
    assetsByType[JSON_INDEX] = loadJsonAssets(jsonsToLoad, assetNames);
  }

  if (assetsByType.some((asset) => asset instanceof Promise)) {
    return Promise.all(assetsByType).then((loadedAssets) =>
      mapAssetsToFlatArray(loadedAssets, assetIndexMap),
    );
  }

  return mapAssetsToFlatArray(assetsByType, assetIndexMap);
}

export {
  cache,
  testScript,
  loadAssets,
  loadJsonAssets,
  loadLazyAssets,
  loadStyleAssets,
  loadScriptAssets,
};
