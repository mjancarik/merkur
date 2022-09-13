import testScript from './testScript';

function _loadScript(asset, root) {
  return new Promise((resolve, reject) => {
    const scriptElement = root.querySelector(`script[src='${asset.source}']`);

    if (scriptElement) {
      if (!asset.test) {
        resolve();
      }

      scriptElement.addEventListener('load', resolve);
      scriptElement.addEventListener(
        'error',
        asset.optional ? resolve : reject
      );
      return;
    }

    const script = document.createElement('script');

    if (asset.type === 'script') {
      script.defer = true;
      script.onload = resolve;
      script.onerror = asset.optional ? resolve : reject;
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

function loadStyleAssets(assets, root = document.head) {
  const styleElements = root.querySelectorAll('style');
  const stylesToRender = assets.filter(
    (asset) =>
      asset.source &&
      ((asset.type === 'stylesheet' &&
        !root.querySelector(`link[href='${asset.source}']`)) ||
        (asset.type === 'inlineStyle' &&
          Array.from(styleElements).reduce((acc, cur) => {
            if (cur.innerHTML === asset.source) {
              return false;
            }

            return acc;
          }, true)))
  );

  return Promise.all(stylesToRender.map((asset) => _loadStyle(asset, root)));
}

function loadScriptAssets(assets, root = document.head) {
  const scriptElements = root.querySelectorAll('script');
  const scriptsToRender = assets.reduce((scripts, asset) => {
    const { source } = asset;
    const _asset = Object.assign({}, asset);

    if (_asset.type !== 'script' && _asset.type !== 'inlineScript') {
      return scripts;
    }

    if (source === Object(source)) {
      if (source.es11 && testScript.isES11Supported()) {
        _asset.source = source.es11;
      } else if (source.es9 && testScript.isES9Supported()) {
        _asset.source = source.es9;
      } else {
        _asset.source = source.es5;
      }

      if (!_asset.source) {
        console.warn(
          `Asset '${_asset.name}' is missing ES variant and could not be loaded.`
        );
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

export { testScript, loadAssets, loadStyleAssets, loadScriptAssets };
