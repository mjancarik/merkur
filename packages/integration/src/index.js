import testScript from './testScript';

const cache = {};

function _loadScript(asset, root) {
  return new Promise((resolve, reject) => {
    const scriptElement = root.querySelector(`script[src='${asset.source}']`);

    if (scriptElement) {
      if (!asset.test || testScript.test(asset.test)) {
        resolve();
      }

      scriptElement.addEventListener('load', resolve);
      scriptElement.addEventListener(
        'error',
        asset.optional ? resolve : reject,
      );
      return;
    }

    const script = document.createElement('script');

    if (asset.type === 'script') {
      script.defer = true;
      script.onload = resolve;
      script.onerror = (error) => {
        script.remove();

        asset.optional ? resolve(error) : reject(error);
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
    } else {
      script.text = asset.source;
      resolve();
    }

    root.appendChild(script);
  });
}

function _loadStyle(asset, root) {
  return new Promise((resolve, reject) => {
    if (asset.type === 'stylesheet') {
      const link = document.createElement('link');
      link.onload = resolve;
      link.onerror = reject;
      link.rel = 'stylesheet';
      link.href = asset.source;

      root.appendChild(link);
    } else {
      const style = document.createElement('style');
      style.innerHTML = asset.source;

      root.appendChild(style);
      resolve();
    }
  });
}

function loadStyleAssets(assets, root = document.head, shouldLoadLazy = false) {
  const styleElements = root.querySelectorAll('style');
  const stylesToRender = assets.filter(
    (asset) =>
      ((asset.lazy && shouldLoadLazy) || (!asset.lazy && !shouldLoadLazy)) &&
      asset.source &&
      ((asset.type === 'stylesheet' &&
        !root.querySelector(`link[href='${asset.source}']`)) ||
        (asset.type === 'inlineStyle' &&
          Array.from(styleElements).reduce((acc, cur) => {
            if (cur.innerHTML === asset.source) {
              return false;
            }

            return acc;
          }, true))),
  );

  return Promise.all(stylesToRender.map((asset) => _loadStyle(asset, root)));
}

async function loadScriptAssets(
  assets,
  root = document.head,
  shouldLoadLazy = false,
) {
  const scriptElements = root.querySelectorAll('script');
  const scriptsToRender = assets.reduce((scripts, asset) => {
    if (
      (asset.type !== 'script' && asset.type !== 'inlineScript') ||
      (asset.lazy && !shouldLoadLazy) ||
      (!asset.lazy && shouldLoadLazy)
    ) {
      return scripts;
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
        return scripts;
      }
    }

    if (
      Array.from(scriptElements).reduce((acc, cur) => {
        if (cur.text === _asset.source) {
          return true;
        }

        return acc;
      }, false) ||
      (_asset.test ? testScript.test(_asset.test) : false)
    ) {
      return scripts;
    }

    scripts.push(_asset);

    return scripts;
  }, []);

  return Promise.all(scriptsToRender.map((asset) => _loadScript(asset, root)));
}

function loadAssets(assets, root) {
  return Promise.all([
    loadScriptAssets(assets, root),
    loadStyleAssets(assets, root),
  ]);
}

async function _loadJsonAsset(asset) {
  try {
    const response = await fetch(asset.source);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from '${asset.source}' with status ${response.status} ${response.statusText}.`,
      );
    }

    cache[asset.name] = await response.json();

    return cache[asset.name];
  } catch (error) {
    console.warn(`Error loading JSON asset '${asset.name}': ${error.message}`);

    return null;
  }
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

    if (cache[assetName]) {
      return cache[assetName];
    }

    if (asset.type === 'inlineJson') {
      return asset.source;
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
  testScript,
  loadAssets,
  loadJsonAssets,
  loadLazyAssets,
  loadStyleAssets,
  loadScriptAssets,
};
