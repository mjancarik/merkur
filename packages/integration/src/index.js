import testScript from './testScript';

function _loadScript(asset) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    if (asset.type === 'script') {
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
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

    document.head.appendChild(script);
  });
}

function _loadStyle(asset) {
  return new Promise((resolve, reject) => {
    if (asset.type === 'stylesheet') {
      const link = document.createElement('link');
      link.onload = resolve;
      link.onerror = reject;
      link.rel = 'stylesheet';
      link.href = asset.source;

      document.head.appendChild(link);
    } else {
      const style = document.createElement('style');
      style.innerHTML = asset.source;

      document.head.appendChild(style);
      resolve();
    }
  });
}

function loadStyleAssets(assets) {
  const styleElements = document.head.getElementsByTagName('style');
  const stylesToRender = assets.filter(
    (asset) =>
      asset.source &&
      ((asset.type === 'stylesheet' &&
        !document.head.querySelector(`link[href='${asset.source}']`)) ||
        (asset.type === 'inlineStyle' &&
          Array.from(styleElements).reduce((acc, cur) => {
            if (cur.innerHTML === asset.source) {
              return false;
            }

            return acc;
          }, true)))
  );

  return Promise.all(stylesToRender.map((asset) => _loadStyle(asset)));
}

function loadScriptAssets(assets) {
  const scriptElements = document.getElementsByTagName('script');
  const scriptsToRender = assets.reduce((scripts, asset) => {
    const { source } = asset;
    const _asset = Object.assign({}, asset);

    if (_asset.type !== 'script' && _asset.type !== 'inlineScript') {
      return scripts;
    }

    if (source === Object(source)) {
      if (testScript.isES11Supported()) {
        _asset.source = source.es11;
      } else {
        _asset.source = testScript.isES9Supported() ? source.es9 : source.es5;
      }

      if (!_asset.source) {
        console.warn(
          `Asset '${_asset.name}' is missing ES variant and could not be loaded.`
        );
        return scripts;
      }
    }

    if (
      document.querySelector(`script[src='${_asset.source}']`) ||
      Array.from(scriptElements).reduce((acc, cur) => {
        if (cur.text === _asset.source) {
          return true;
        }

        return acc;
      }, false) ||
      _asset.test
        ? testScript.test(_asset.test)
        : false
    ) {
      return scripts;
    }

    scripts.push(_asset);

    return scripts;
  }, []);

  return Promise.all(scriptsToRender.map((asset) => _loadScript(asset)));
}

function loadAssets(assets) {
  return Promise.all([loadScriptAssets(assets), loadStyleAssets(assets)]);
}

export { testScript, loadAssets, loadStyleAssets, loadScriptAssets };
