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

function _loadScript(assetSource) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    script.src = assetSource;

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

  return Promise.all(stylesToRender.map((asset) => _loadStyle(asset.source)));
}

export function loadScriptAssets(assets) {
  const scriptsToRender = assets
    .map((asset) => {
      let assetSource = asset.source;

      if (typeof assetSource !== 'string') {
        assetSource = isES9Supported() ? assetSource.es9 : assetSource.es5;
      }

      if (
        asset.type === 'script' &&
        !document.querySelector(`script[src='${assetSource}']`)
      ) {
        return assetSource;
      }
    })
    .filter((assetSource) => assetSource);

  return Promise.all(
    scriptsToRender.map((assetSource) => _loadScript(assetSource))
  );
}

export default function loadAssets(assets) {
  return Promise.all(loadScriptAssets(assets), loadStyleAssets(assets));
}
