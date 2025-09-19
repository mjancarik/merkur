import testScript from './testScript';

const isLoadedSymbol = Symbol.for('isLoaded');
const loadingPromiseSymbol = Symbol.for('loadingPromise');

function _attachElementToAsset(asset, element) {
  return {
    ...asset,
    element,
  };
}

function _handleAssetError({
  asset,
  message = `Error loading asset ${asset.source}.`,
}) {
  if (asset.optional) {
    console.warn(message);

    return _attachElementToAsset(asset, null);
  }

  const error = new Error(message);
  error.asset = asset;

  throw error;
}

function _addListenersToAssetElement(asset, element, resolve, reject) {
  element.addEventListener('load', () => {
    resolve(_attachElementToAsset(asset, element));
    element[isLoadedSymbol] = true;
    delete element[loadingPromiseSymbol];
  });
  element.addEventListener('error', () => {
    if (element.parentNode) {
      element.remove();
    }

    try {
      resolve(_handleAssetError({ asset }));
    } catch (error) {
      reject(error);
    }
  });
}

function _loadStyle(asset, root) {
  if (asset.type === 'inlineStyle') {
    const style = document.createElement('style');
    style.innerHTML = asset.source;
    root.appendChild(style);

    return _attachElementToAsset(asset, style);
  }

  const link = document.createElement('link');

  link[loadingPromiseSymbol] = new Promise((resolve, reject) => {
    _addListenersToAssetElement(asset, link, resolve, reject);
    link.rel = 'stylesheet';
    link.href = asset.source;

    root.appendChild(link);
  });

  return link[loadingPromiseSymbol];
}

async function loadStyleAssets(assets, root = document.head) {
  const styleElements = Array.from(root.querySelectorAll('style'));

  return Promise.all(
    assets.map((asset) => {
      if (
        !['stylesheet', 'inlineStyle'].includes(asset.type) ||
        !asset.source
      ) {
        return _attachElementToAsset(asset, null);
      }

      if (asset.type === 'stylesheet') {
        const link = root.querySelector(`link[href='${asset.source}']`);

        if (link) {
          if (link[loadingPromiseSymbol]) {
            return link[loadingPromiseSymbol];
          }

          return _attachElementToAsset(asset, link);
        }
      }

      if (asset.type === 'inlineStyle') {
        const inlineStyle = styleElements.find(
          (element) => element.innerHTML === asset.source,
        );

        if (inlineStyle) {
          return _attachElementToAsset(asset, inlineStyle);
        }
      }

      return _loadStyle(asset, root);
    }),
  );
}

function _findScriptElement(scriptElements, asset) {
  if (asset.type === 'json') {
    return scriptElements.find(
      (element) => element.dataset.src === asset.source,
    );
  }

  if (!['script', 'inlineScript', 'inlineJson'].includes(asset.type)) {
    return null;
  }

  const attributeKey = asset.type === 'script' ? 'src' : 'textContent';
  const source =
    asset.type === 'inlineJson' ? JSON.stringify(asset.source) : asset.source;

  return (
    scriptElements.find((element) => element[attributeKey] === source) || null
  );
}

function _loadScript(asset, root) {
  const script = document.createElement('script');

  // Set script type to module if specified
  if (asset.module) {
    script.type = 'module';
  }

  if (asset.type === 'inlineScript') {
    script.textContent = asset.source;
    root.appendChild(script);

    return _attachElementToAsset(asset, script);
  }

  script[loadingPromiseSymbol] = new Promise((resolve, reject) => {
    // Don't set defer for module scripts as it can interfere with module loading
    if (!asset.module) {
      script.defer = true;
    }
    _addListenersToAssetElement(asset, script, resolve, reject);
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

  return script[loadingPromiseSymbol];
}

async function loadScriptAssets(assets, root = document.head) {
  const scriptElements = Array.from(root.querySelectorAll('script'));

  return Promise.all(
    assets.map((asset) => {
      if (!['script', 'inlineScript'].includes(asset.type) || !asset.source) {
        return _attachElementToAsset(asset, null);
      }

      // Module scripts should not use defer attribute as it can cause issues
      if (asset.module && asset.attr && asset.attr.defer !== false) {
        asset = { ...asset, attr: { ...asset.attr, defer: false } };
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
          return _handleAssetError({
            asset: _asset,
            message: `Asset '${_asset.name}' is missing ES variant and could not be loaded.`,
          });
        }
      }

      if (_asset.test && testScript.test(_asset.test)) {
        return _attachElementToAsset(
          _asset,
          _findScriptElement(scriptElements, _asset),
        );
      }

      const script = _findScriptElement(scriptElements, _asset);

      if (script && _asset.type === 'script') {
        if (script[loadingPromiseSymbol]) {
          return script[loadingPromiseSymbol];
        }

        if (script[isLoadedSymbol]) {
          return _attachElementToAsset(_asset, script);
        }

        return new Promise((resolve, reject) =>
          _addListenersToAssetElement(_asset, script, resolve, reject),
        );
      } else if (script && _asset.type === 'inlineScript') {
        return _attachElementToAsset(_asset, script);
      }

      return _loadScript(_asset, root);
    }),
  );
}

async function _fetchData(source) {
  const response = await fetch(source);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch from '${source}' with status ${response.status} ${response.statusText}.`,
    );
  }

  return response.text();
}

function _removeElementAfterTimeout(element, timeout) {
  if (timeout) {
    setTimeout(() => {
      if (element.parentNode) {
        element.remove();
      }
    }, timeout);
  }
}

function _loadJsonAsset(asset, root) {
  const script = document.createElement('script');
  script.type = 'application/json';

  if (asset.type === 'inlineJson') {
    script.textContent = JSON.stringify(asset.source);
    root.appendChild(script);
    _removeElementAfterTimeout(script, asset.ttl);

    return _attachElementToAsset(asset, script);
  }

  script[loadingPromiseSymbol] = new Promise((resolve, reject) => {
    script.dataset.src = asset.source;
    root.appendChild(script);

    (async () => {
      try {
        const textContent = await _fetchData(asset.source);
        script.textContent = textContent;
        delete script[loadingPromiseSymbol];
        _removeElementAfterTimeout(script, asset.ttl);
        resolve(_attachElementToAsset(asset, script));
      } catch (error) {
        script.remove();

        try {
          resolve(
            _handleAssetError({
              asset,
              message: `Error loading JSON asset '${asset.name}': ${error.message}`,
            }),
          );
        } catch (error) {
          reject(error);
        }
      }
    })();
  });

  return script[loadingPromiseSymbol];
}

async function loadJsonAssets(assets, root = document.head) {
  const scriptElements = Array.from(
    root.querySelectorAll('script[type="application/json"]'),
  );

  return Promise.all(
    assets.map((asset) => {
      if (!['json', 'inlineJson'].includes(asset.type) || !asset.source) {
        return _attachElementToAsset(asset, null);
      }

      const script = _findScriptElement(scriptElements, asset);

      if (script) {
        if (script[loadingPromiseSymbol]) {
          return script[loadingPromiseSymbol];
        }

        if (script.textContent) {
          return _attachElementToAsset(asset, script);
        }

        return _handleAssetError({
          asset,
          message: `JSON asset '${asset.name}' is missing textContent and could not be loaded.`,
        });
      }

      return _loadJsonAsset(asset, root);
    }),
  );
}

function _mergeResults(results) {
  return results.reduce((acc, results) => {
    results.forEach((result, index) => {
      if (!acc[index]) {
        acc[index] = result;
      } else if (result.element) {
        acc[index] = result;
      }
    });

    return acc;
  }, []);
}

async function loadAssets(assets, root) {
  const results = await Promise.all([
    loadScriptAssets(assets, root),
    loadStyleAssets(assets, root),
    loadJsonAssets(assets, root),
  ]);

  return _mergeResults(results);
}

export {
  isLoadedSymbol,
  loadingPromiseSymbol,
  testScript,
  loadAssets,
  loadJsonAssets,
  loadStyleAssets,
  loadScriptAssets,
};
