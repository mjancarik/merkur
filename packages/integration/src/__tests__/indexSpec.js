import {
  //loadAssets,
  loadJsonAssets,
  loadScriptAssets,
  loadStyleAssets,
} from '../index';

function createDeferred() {
  let resolve, reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('Merkur component', () => {
  const vectorsJsonContent =
    '{"5100":"M13.5,0 L0,0 L0,13.5 Z","6100":"M14.5,0 L0,0 L0,13.5 Z"}';
  let assets;
  let assetsDictionary;
  let fakeAssetObjects;
  let rootElement = {
    appendChild: jest.fn((fakeAssetObject) => {
      fakeAssetObject.parentNode = {};
    }),
    querySelector: jest.fn((selector) =>
      fakeAssetObjects.find(
        (el) =>
          (el.src && el.src === selector.match(/src='([^']+)'/)?.[1]) ||
          (el.href && el.href === selector.match(/href='([^']+)'/)?.[1]) ||
          (el.dataset &&
            el.dataset.src === selector.match(/src='([^']+)'/)?.[1]),
      ),
    ),
    querySelectorAll: jest.fn((selector) =>
      fakeAssetObjects.filter((el) => el.tagName === selector),
    ),
  };
  let originalFetch;
  let assetLoadingDeferreds;
  let fakeAssetListeners;

  const fakeAssetObjectGenerator = (tagName) => {
    const fakeAssetObject = {
      tagName,
      removeAttribute: (name) => delete fakeAssetObject[name],
      setAttribute: (name, value) => (fakeAssetObject[name] = value),
      addEventListener: jest.fn((type, callback) => {
        if (!fakeAssetListeners[type]) {
          fakeAssetListeners[type] = [];
        }
        fakeAssetListeners[type].push(callback);
      }),
      remove: jest.fn(() => delete fakeAssetObject.parentNode),
      dataset: new Proxy(
        {},
        {
          get: (obj, prop) =>
            fakeAssetObject[typeof prop === 'string' ? `data-${prop}` : prop],
          set: (obj, prop, value) => {
            fakeAssetObject[typeof prop === 'string' ? `data-${prop}` : prop] =
              value;

            return true;
          },
        },
      ),
    };
    fakeAssetObjects.push(fakeAssetObject);

    return fakeAssetObject;
  };

  const resolveFakeAssets = () => {
    for (const fakeAsset of fakeAssetObjects) {
      if ('onload' in fakeAsset) {
        fakeAsset.onload();
      }

      if (fakeAssetListeners['load']) {
        for (const listener of fakeAssetListeners['load']) {
          listener();
        }
      }
    }
  };

  const rejectFakeAssets = () => {
    for (const fakeAsset of fakeAssetObjects) {
      if ('onerror' in fakeAsset) {
        fakeAsset.onerror();
      }

      if (fakeAssetListeners['error']) {
        for (const listener of fakeAssetListeners['error']) {
          listener();
        }
      }
    }
  };

  const fetchMockImplementation = ({
    defaultError = new Error('Network error'),
    defaultResponse = {
      ok: true,
      status: 200,
      statusText: `HTTP/1.1 200 OK`,
      json: () => Promise.resolve(JSON.parse(defaultResponseBody)),
    },
    defaultResponseBody,
  }) => {
    return (url) => {
      const deferred = createDeferred();

      if (!assetLoadingDeferreds[url]) {
        assetLoadingDeferreds[url] = [];
      }

      assetLoadingDeferreds[url].push(deferred);

      return deferred.promise
        .then((response) => ({ ...defaultResponse, ...response }))
        .catch((error) => {
          throw error || defaultError;
        });
    };
  };

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    assetsDictionary = {
      'widget.js': {
        name: 'widget.js',
        type: 'script',
        source: {
          es11: 'http://localhost:4444/static/es11/widget.6541af42bfa3596bb129.js',
          es9: 'http://localhost:4444/static/es9/widget.6961af42bfa3596bb147.js',
        },
        attr: {
          async: true,
          'custom-element': 'amp-fx-collection',
          defer: false,
        },
      },
      'polyfill1.js': {
        name: 'polyfill1.js',
        test: 'return typeof window !== "undefined"',
        type: 'script',
        source: {
          es11: 'http://localhost:4444/static/es11/polyfill.6961af42bfa3596bb147.js',
          es9: 'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb147.js',
        },
      },
      'undefined.js': {
        name: 'undefined.js',
        type: 'script',
        source: {
          es11: undefined,
          es9: 'http://localhost:4444/static/es9/undefined.6961af42bfa3596bb147.js',
        },
      },
      'polyfill2.js': {
        name: 'polyfill2.js',
        test: 'return (function () {foo();})()',
        type: 'script',
        source:
          'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb147.js',
      },
      'unnamed.js': {
        type: 'inlineScript',
        source: 'alert();',
      },
      'widget.css': {
        name: 'widget.css',
        type: 'stylesheet',
        source:
          'http://localhost:4444/static/es11/widget.814e0cb568c7ddc0725d.css',
      },
      'unnamed.css': {
        type: 'inlineStyle',
        source: '.cssClass { margin-top: 5px; }',
      },
      'maps/vectors.json': {
        name: 'maps/vectors.json',
        source: 'http://localhost:4444/static/maps/vectors.json',
        type: 'json',
      },
      'maps/inline.json': {
        name: 'maps/inline.json',
        source: {
          1100: 'M13.5,0 L0,0 L0,13.5 Z',
          1200: 'M14.5,0 L0,0 L0,13.5 Z',
        },
        type: 'inlineJson',
      },
    };
    assets = Object.values(assetsDictionary);

    fakeAssetObjects = [];
    fakeAssetListeners = {};
    assetLoadingDeferreds = {};

    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest
      .spyOn(document, 'createElement')
      .mockImplementation(fakeAssetObjectGenerator);
    for (const method in rootElement) {
      rootElement[method].mockClear();
      jest.spyOn(document.head, method).mockImplementation(rootElement[method]);
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch.mockClear();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('loadStyleAssets() function', () => {
    it('should create style elements for style assets and return their sources', async () => {
      const stylesPromise = loadStyleAssets(assets);

      expect(stylesPromise).toBeInstanceOf(Promise);
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.createElement).toHaveBeenNthCalledWith(1, 'link');
      expect(document.createElement).toHaveBeenNthCalledWith(2, 'style');
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      resolveFakeAssets();
      const sources = await stylesPromise;

      expect(fakeAssetObjects).toMatchSnapshot();
      expect(sources).toStrictEqual([
        null,
        null,
        null,
        null,
        null,
        assetsDictionary['widget.css'].source,
        assetsDictionary['unnamed.css'].source,
        null,
        null,
      ]);
    });

    it('should append style assets to specified element', async () => {
      const stylesPromise = loadStyleAssets(assets, rootElement);
      resolveFakeAssets();
      await stylesPromise;

      expect(rootElement.appendChild).toHaveBeenCalledTimes(2);
    });

    it('should return a promise that rejects when a style fails to load', async () => {
      expect.assertions(3);
      const stylesPromise = loadStyleAssets([assetsDictionary['widget.css']]);

      expect(document.createElement).toHaveBeenCalledTimes(1);

      rejectFakeAssets();

      try {
        await stylesPromise;
      } catch (error) {
        expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should return a promise that resolves even if an optional style fails to load', async () => {
      const stylesPromise = loadStyleAssets([
        { ...assetsDictionary['widget.css'], optional: true },
        assetsDictionary['unnamed.css'],
      ]);
      rejectFakeAssets();

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      const sources = await stylesPromise;

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1); // widget.css
      expect(fakeAssetObjects[1].remove).not.toHaveBeenCalled(); // unnamed.css
      expect(sources).toStrictEqual([
        null, // widget.css
        assetsDictionary['unnamed.css'].source,
      ]);
    });

    it('should return a promise that resolves when a style (not created by loadStyleAssets) is already present in the DOM and is already loaded', async () => {
      const link = fakeAssetObjectGenerator('link');
      link.href = assetsDictionary['widget.css'].source;
      const style = fakeAssetObjectGenerator('style');
      style.innerHTML = assetsDictionary['unnamed.css'].source;
      resolveFakeAssets();

      const stylesPromise = loadStyleAssets([
        assetsDictionary['widget.css'],
        assetsDictionary['unnamed.css'],
      ]);
      const sources = await stylesPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([link.href, style.innerHTML]);
    });

    it('should resolve if a style (created by loadStyleAssets) is already present in the DOM but not yet loaded', async () => {
      const style = assetsDictionary['widget.css'];
      loadStyleAssets([style]);

      expect(document.createElement).toHaveBeenCalledTimes(1);
      document.createElement.mockClear();

      const stylesPromise = loadStyleAssets([style]);

      expect(document.createElement).toHaveBeenCalledTimes(0);

      resolveFakeAssets();

      const sources = await stylesPromise;

      expect(sources).toStrictEqual([style.source]);
    });
  });

  describe('loadScriptAssets() function', () => {
    it('should create script elements for script assets and return their sources', async () => {
      const scriptsPromise = loadScriptAssets(assets);

      expect(scriptsPromise).toBeInstanceOf(Promise);
      expect(document.createElement).toHaveBeenCalledTimes(4); // without polyfill1.js
      expect(document.head.appendChild).toHaveBeenCalledTimes(4); // without polyfill1.js

      resolveFakeAssets();
      const sources = await scriptsPromise;

      expect(fakeAssetObjects).toMatchSnapshot();
      expect(sources).toStrictEqual([
        assetsDictionary['widget.js'].source.es11,
        assetsDictionary['polyfill1.js'].source.es11,
        assetsDictionary['undefined.js'].source.es9, // es11 is undefined
        assetsDictionary['polyfill2.js'].source,
        assetsDictionary['unnamed.js'].source,
        null,
        null,
        null,
        null,
      ]);
    });

    it('should append script assets to specified element', async () => {
      const scriptsPromise = loadScriptAssets(assets, rootElement);
      resolveFakeAssets();
      await scriptsPromise;

      expect(rootElement.appendChild).toHaveBeenCalledTimes(4);
    });

    it('should return a promise that rejects when a script fails to load', async () => {
      expect.assertions(3);
      const scriptsPromise = loadScriptAssets([assetsDictionary['widget.js']]);

      expect(document.createElement).toHaveBeenCalledTimes(1);

      rejectFakeAssets();

      try {
        await scriptsPromise;
      } catch (error) {
        expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should return a promise that resolves when an optional script fails to load', async () => {
      const scriptsPromise = loadScriptAssets([
        {
          name: 'test.js',
          type: 'script',
          source: {
            es9: 'http://localhost:4444/static/es9/test.6961af42bfa3596bb147.js',
          },
          optional: true,
        },
        assetsDictionary['unnamed.js'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(2);

      rejectFakeAssets();
      const sources = await scriptsPromise;

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
      expect(sources).toStrictEqual([
        null, // test.js
        assetsDictionary['unnamed.js'].source,
      ]);
    });

    it('should throw an error if a non-optional script has no source', async () => {
      expect.assertions(3);
      try {
        await loadScriptAssets([
          {
            name: 'optional.js',
            type: 'script',
            source: {},
            optional: true,
          },
          {
            name: 'nosource.js',
            type: 'script',
            source: {},
          },
        ]);
      } catch (error) {
        expect(console.warn).toHaveBeenCalledWith(
          "Asset 'optional.js' is missing ES variant and could not be loaded.",
        );
        expect(error.message).toBe(
          "Asset 'nosource.js' is missing ES variant and could not be loaded.",
        );
        expect(error.asset).toBeTruthy();
      }
    });

    it('should resolve if a script (not created by loadScriptAssets) is already present in the DOM and is already loaded', async () => {
      const script = fakeAssetObjectGenerator('script');
      script.src = assetsDictionary['widget.js'].source.es11;
      const inlineScript = fakeAssetObjectGenerator('script');
      inlineScript.text = assetsDictionary['unnamed.js'].source;
      resolveFakeAssets();

      const sciptsPromise = loadScriptAssets([
        { ...assetsDictionary['widget.js'], test: 'return true' },
        assetsDictionary['unnamed.js'],
      ]);
      const sources = await sciptsPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([script.src, inlineScript.text]);
    });

    it('should resolve if a script (not created by loadScriptAssets) is already present in the DOM but not yet loaded', async () => {
      const script = fakeAssetObjectGenerator('script');
      script.src = assetsDictionary['widget.js'].source.es11;

      const sciptsPromise = loadScriptAssets([
        { ...assetsDictionary['widget.js'] },
      ]);

      resolveFakeAssets();
      const sources = await sciptsPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([script.src]);
    });

    it('should resolve if a script (created by loadScriptAsssets) is already present in the DOM but not yet loaded', async () => {
      const script = assetsDictionary['widget.js'];
      loadScriptAssets([script]);

      expect(document.createElement).toHaveBeenCalledTimes(1);
      document.createElement.mockClear();

      const sciptsPromise = loadScriptAssets([script]);

      expect(document.createElement).toHaveBeenCalledTimes(0);

      resolveFakeAssets();

      const sources = await sciptsPromise;

      expect(sources).toStrictEqual([script.source.es11]);
    });
  });

  describe('loadJsonAssets() function', () => {
    it('should fetch JSON assets and return their parsed content', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets(assets);

      expect(document.createElement).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(document.head.appendChild).toHaveBeenCalledTimes(1); // maps/vectors.json

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        JSON.parse(vectorsJsonContent),
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(console.warn).not.toHaveBeenCalled();
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
    });

    it('should return a promise that resolves even if a JSON fails to load due to 404 error', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(document.head.appendChild).toHaveBeenCalledTimes(1); // maps/vectors.json

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve({
        ok: false,
        status: 404,
      });
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        null, // maps/vectors.json
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(console.warn).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1); // maps/vectors.json
    });

    it('should return a promise that resolves even if a JSON fails to load due to network error', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(document.head.appendChild).toHaveBeenCalledTimes(1); // maps/vectors.json

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].reject();
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        null, // maps/vectors.json
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(console.warn).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1); // maps/vectors.json
    });

    it('should get JSON data if a script (created by loadJsonAsssets) is already present in the DOM and is already loaded', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(document.head.appendChild).toHaveBeenCalledTimes(1); // maps/vectors.json
      document.createElement.mockClear();

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await jsonsPromise;

      const sources2 = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]); // it is resolved synchronously

      expect(sources).toStrictEqual(sources2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(console.warn).not.toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
    });

    it('should get JSON data if a script (created by loadJsonAsssets) is already present in the DOM but not yet loaded', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(document.head.appendChild).toHaveBeenCalledTimes(1); // maps/vectors.json
      document.createElement.mockClear();

      const jsonsPromise2 = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);
      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();

      const sources2 = await jsonsPromise2;

      expect(sources2).toStrictEqual([
        JSON.parse(vectorsJsonContent),
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(console.warn).not.toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
    });

    it('should get JSON data if a script (not created by loadJsonAsssets) is already present in the DOM and is already loaded', () => {
      const script = fakeAssetObjectGenerator('script');
      script.type = 'application/json';
      script.dataset.src = assetsDictionary['maps/vectors.json'].source;
      script.dataset.jsonData = JSON.parse(vectorsJsonContent);

      const sources = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]); // it is resolved synchronously

      expect(sources).toStrictEqual([
        JSON.parse(vectorsJsonContent),
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(document.head.appendChild).toHaveBeenCalledTimes(0);
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should load inline JSON assets synchronously', () => {
      const sources = loadJsonAssets([assetsDictionary['maps/inline.json']]);

      expect(sources).toStrictEqual([
        assetsDictionary['maps/inline.json'].source,
      ]);
    });
  });

  /*describe.skip('loadLazyAssets() function', () => {
    it('should load lazy assets including jsons (all jsons are lazy)', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const assetsPromise = loadLazyAssets(
        assets,
        Object.keys(assetsDictionary),
      );
      resolveFakeAssets();
      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await assetsPromise;

      expect(assetsPromise).toBeInstanceOf(Promise);
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(sources).toStrictEqual([
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        assetsDictionary['lazy.js'].source.es11,
        assetsDictionary['lazy.css'].source,
        JSON.parse(vectorsJsonContent),
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should load inline JSON assets synchronously', () => {
      const sources = loadLazyAssets(assets, ['maps/inline.json']);

      expect(sources).toStrictEqual([
        assetsDictionary['maps/inline.json'].source,
      ]);
    });
  });*/
});
