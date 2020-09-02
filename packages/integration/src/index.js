let _isES9Supported = undefined;

function isES9Supported() {
  if (_isES9Supported !== undefined) {
    return _isES9Supported;
  }

  function checkAsyncAwait() {
    try {
      new Function('(async () => ({}))()');
      return true;
    } catch (e) {
      return false;
    }
  }

  return (_isES9Supported = Object.values && checkAsyncAwait());
}

function _loadScript(asset) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    if (asset.type === 'script') {
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      script.src = asset;
    } else {
      script.text = asset.source;
      resolve();
    }

    document.head.appendChild(script);
  });
}

function _loadStyle(asset) {
  return new Promise((resolve, reject) => {
    const style = document.createElement('style');

    style.type = 'text/css';

    if (asset.type === 'stylesheet') {
      style.onload = resolve;
      style.onerror = reject;
      style.src = asset.source;
    } else {
      style.innerHTML = asset.source;
      resolve();
    }

    document.head.appendChild(style);
  });
}

export function loadStyleAssets(assets) {
  const stylesToRender = assets.filter(
    (asset) =>
      (asset.type === 'stylesheet' &&
        !document.querySelector(`style[href='${asset.source}']`)) ||
      asset.type === 'inlineStyle'
  );

  return Promise.all(stylesToRender.map((asset) => _loadStyle(asset)));
}

export function loadScriptAssets(assets) {
  const scriptElements = document.getElementsByTagName('script');
  const scriptsToRender = assets
    .map((asset) => {
      const { source } = asset;
      const _asset = Object.assign({}, asset);

      if (typeof source !== 'string') {
        _asset.source = isES9Supported() ? source.es9 : source.es5;
      }

      return _asset;
    })
    .filter(
      (asset) =>
        (asset.type === 'script' &&
          !document.querySelector(`script[src='${asset.source}']`)) ||
        (asset.type === 'inlineScript' &&
          Array.from(scriptElements).reduce((acc, cur) => {
            if (cur.text === asset.source) {
              return false;
            }

            return acc;
          }, true))
    );

  return Promise.all(scriptsToRender.map((asset) => _loadScript(asset)));
}

export default function loadAssets(assets) {
  return Promise.all(loadScriptAssets(assets), loadStyleAssets(assets));
}
