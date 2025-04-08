import testScript from './testScript';

function _addListenersToAssetElement(asset, element, resolve, reject) {
  element.addEventListener('load', () => {
    resolve(asset.source);
  });
  element.addEventListener('error', () => {
    if (element.parentNode) {
      element.remove();
    }

    const message = `Error loading asset '${asset.source}'.`;

    if (asset.optional) {
      console.warn(message);
      resolve(null);
    } else {
      reject(new Error(message));
    }
  });
}

function _resolvePromisesInArray(array) {
  if (array.some((item) => item instanceof Promise)) {
    return Promise.all(array);
  }

  return array;
}

function _loadStyle(asset, root) {
  if (asset.type === 'inlineStyle') {
    const style = document.createElement('style');
    style.innerHTML = asset.source;
    root.appendChild(style);

    return asset.source;
  }

  const link = document.createElement('link');

  link[Symbol.for('loadingPromise')] = new Promise((resolve, reject) => {
    _addListenersToAssetElement(asset, link, resolve, reject);
    link.rel = 'stylesheet';
    link.href = asset.source;

    root.appendChild(link);
  });

  return link[Symbol.for('loadingPromise')];
}

function loadStyleAssets(assets, root = document.head) {
  const styleElements = root.querySelectorAll('style');

  return _resolvePromisesInArray(
    assets.map((asset) => {
      if (
        !['stylesheet', 'inlineStyle'].includes(asset.type) ||
        !asset.source
      ) {
        return null;
      }

      if (asset.type === 'stylesheet') {
        const link = root.querySelector(`link[href='${asset.source}']`);

        if (link) {
          if (link[Symbol.for('loadingPromise')]) {
            return link[Symbol.for('loadingPromise')];
          }

          return asset.source;
        }
      }

      if (
        asset.type === 'inlineStyle' &&
        Array.from(styleElements).reduce((acc, cur) => {
          if (cur.innerHTML === asset.source) {
            return true;
          }

          return acc;
        }, false)
      ) {
        return asset.source;
      }

      return _loadStyle(asset, root);
    }),
  );
}

function _loadScript(asset, root) {
  if (asset.type === 'inlineScript') {
    const script = document.createElement('script');
    script.text = asset.source;
    root.appendChild(script);

    return asset.source;
  }

  const script = document.createElement('script');

  script[Symbol.for('loadingPromise')] = new Promise((resolve, reject) => {
    script.defer = true;
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

  return script[Symbol.for('loadingPromise')];
}

async function loadScriptAssets(assets, root = document.head) {
  const scriptElements = root.querySelectorAll('script');

  return _resolvePromisesInArray(
    assets.map((asset) => {
      if (!['script', 'inlineScript'].includes(asset.type) || !asset.source) {
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

      if (_asset.test && testScript.test(_asset.test)) {
        return _asset.source;
      }

      if (asset.type === 'script') {
        const script = root.querySelector(`script[src='${_asset.source}']`);

        if (script) {
          if (script[Symbol.for('loadingPromise')]) {
            return script[Symbol.for('loadingPromise')];
          }

          return new Promise((resolve, reject) =>
            _addListenersToAssetElement(_asset, script, resolve, reject),
          );
        }
      } else if (
        asset.type === 'inlineScript' &&
        Array.from(scriptElements).reduce((acc, cur) => {
          if (cur.text === _asset.source) {
            return true;
          }

          return acc;
        }, false)
      ) {
        return _asset.source;
      }

      return _loadScript(_asset, root);
    }),
  );
}

async function _fetchJsonData(source) {
  const response = await fetch(source);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch from '${source}' with status ${response.status} ${response.statusText}.`,
    );
  }

  return response.json();
}

function _loadJsonAsset(asset, root) {
  const script = document.createElement('script');

  script[Symbol.for('loadingPromise')] = new Promise((resolve) => {
    script.type = 'application/json';
    script.dataset.src = asset.source;
    root.appendChild(script);

    (async () => {
      try {
        script.dataset.jsonData = await _fetchJsonData(asset.source);
        delete script[Symbol.for('loadingPromise')];
        resolve(script.dataset.jsonData);
      } catch (error) {
        console.warn(
          `Error loading JSON asset '${asset.name}': ${error.message}`,
        );
        script.remove();
        resolve(null);
      }
    })();
  });

  return script[Symbol.for('loadingPromise')];
}

function loadJsonAssets(assets, root = document.head) {
  return _resolvePromisesInArray(
    assets.map((asset) => {
      if (!['json', 'inlineJson'].includes(asset.type) || !asset.source) {
        return null;
      }

      if (asset.type === 'inlineJson') {
        return asset.source;
      }

      const script = root.querySelector(
        `script[type="application/json"][data-src='${asset.source}']`,
      );

      if (script) {
        if (script.dataset.jsonData) {
          return script.dataset.jsonData;
        }

        if (script[Symbol.for('loadingPromise')]) {
          return script[Symbol.for('loadingPromise')];
        }
      }

      return _loadJsonAsset(asset, root);
    }),
  );
}

function loadAssets(assets, root) {
  return Promise.all([
    loadScriptAssets(assets, root),
    loadStyleAssets(assets, root),
  ]);
}

export {
  testScript,
  loadAssets,
  loadJsonAssets,
  loadStyleAssets,
  loadScriptAssets,
};
