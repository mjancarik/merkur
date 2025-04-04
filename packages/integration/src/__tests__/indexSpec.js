import {
  cache,
  loadStyleAssets,
  loadScriptAssets,
  loadJsonAssets,
} from '../index';

function createDeferred() {
  let resolve, reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function clearCache() {
  for (const key in cache) {
    delete cache[key];
  }
}

describe('Merkur component', () => {
  const vectorsJsonContent =
    '{"5100":"M13.5,0 L0,0 L0,13.5 Z","6100":"M14.5,0 L0,0 L0,13.5 Z"}';
  let assets;
  let assetsDictionary;
  let fakeAssetObjects;
  let rootElement;
  let originalFetch;
  let assetLoadingDeferreds = {};

  const fakeAssetObjectGenerator = () => {
    const fakeAssetObject = {
      onerror: jest.fn(),
      onload: jest.fn(),
      removeAttribute: (name) => delete fakeAssetObject[name],
      setAttribute: (name, value) => (fakeAssetObject[name] = value),
      addEventListener: jest.fn((type, callback) => callback(type)),
      remove: jest.fn(),
    };
    fakeAssetObjects.push(fakeAssetObject);

    return fakeAssetObject;
  };

  const resolveFakeAssets = () => {
    for (const fakeAsset of fakeAssetObjects) {
      fakeAsset.onload();
    }
  };

  const rejectFakeAssets = () => {
    for (const fakeAsset of fakeAssetObjects) {
      fakeAsset.onerror();
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
      'lazy.js': {
        lazy: true,
        name: 'lazy.js',
        optional: true,
        source: {
          es11: 'http://localhost:4444/static/es11/lazy.6541af42bfa3596bb129.js',
          es9: 'http://localhost:4444/static/es9/lazy.6961af42bfa3596bb147.js',
        },
        type: 'script',
      },
      'lazy.css': {
        lazy: true,
        name: 'lazy.css',
        source:
          'http://localhost:4444/static/css/lazy.814e0cb568c7ddc0725d.css',
        type: 'stylesheet',
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
    assetLoadingDeferreds = {};
    clearCache();

    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest
      .spyOn(document, 'createElement')
      .mockImplementation(fakeAssetObjectGenerator);
    jest.spyOn(document.head, 'appendChild').mockImplementation();

    rootElement = {
      querySelectorAll: jest.fn(() => []),
      querySelector: jest.fn(() => null),
      appendChild: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch.mockClear();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('loadStyleAssets() function', () => {
    it('should create style elements for style assets and return their sources (except lazy ones)', async () => {
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
        null, // lazy.css
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

    it('should return a promise that resolves even if a style fails to load', async () => {
      const stylesPromise = loadStyleAssets(assets);
      rejectFakeAssets();

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      const sources = await stylesPromise;

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1); // widget.css
      expect(fakeAssetObjects[1].remove).not.toHaveBeenCalled(); // unnamed.css
      expect(sources).toStrictEqual([
        null,
        null,
        null,
        null,
        null,
        null, // widget.css
        assetsDictionary['unnamed.css'].source,
        null,
        null, // lazy.css
        null,
        null,
      ]);
    });

    it('should return a promise that resolves when an existing style is already loaded', async () => {
      const fakeAssetObject = fakeAssetObjectGenerator();
      jest
        .spyOn(rootElement, 'querySelector')
        .mockImplementationOnce(() => fakeAssetObject);
      const style = assetsDictionary['widget.css'];
      const stylesPromise = loadStyleAssets([style], rootElement);
      const sources = await stylesPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([style.source]);
    });

    it('should resolve if a style is already present in the DOM but not yet loaded', async () => {
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

    it('should load lazy styles if shouldLoadLazy is true', async () => {
      const stylesPromise = loadStyleAssets(
        Object.values(assetsDictionary),
        undefined,
        true,
      );

      expect(document.createElement).toHaveBeenCalledTimes(1);
      expect(document.head.appendChild).toHaveBeenCalledTimes(1);

      resolveFakeAssets();
      const sources = await stylesPromise;

      expect(sources).toStrictEqual([
        null,
        null,
        null,
        null,
        null,
        null, // widget.css
        null, // unnamed.css
        null,
        assetsDictionary['lazy.css'].source,
        null,
        null,
      ]);
    });
  });

  describe('loadScriptAssets() function', () => {
    it('should create script elements for script assets and return their sources (except lazy ones)', async () => {
      const scriptsPromise = loadScriptAssets(assets);

      expect(scriptsPromise).toBeInstanceOf(Promise);
      expect(document.createElement).toHaveBeenCalledTimes(4);
      expect(document.head.appendChild).toHaveBeenCalledTimes(4);

      resolveFakeAssets();
      const sources = await scriptsPromise;

      expect(fakeAssetObjects).toMatchSnapshot();
      expect(sources).toStrictEqual([
        assetsDictionary['widget.js'].source.es11,
        null, // polyfill1.js's test passed
        assetsDictionary['undefined.js'].source.es9, // es11 is undefined
        assetsDictionary['polyfill2.js'].source,
        assetsDictionary['unnamed.js'].source,
        null,
        null,
        null, // lazy.js
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
        null,
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

    it('should return a promise that resolves when an existing script is already loaded', async () => {
      const fakeAssetObject = fakeAssetObjectGenerator();
      jest
        .spyOn(rootElement, 'querySelector')
        .mockImplementationOnce(() => fakeAssetObject);
      const script = assetsDictionary['widget.js'];
      const sciptsPromise = loadScriptAssets([script], rootElement);
      const sources = await sciptsPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([script.source.es11]);
    });

    it('should resolve if a script is already present in the DOM but not yet loaded', async () => {
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

    it('should load lazy scripts if shouldLoadLazy is true', async () => {
      const scriptsPromise = loadScriptAssets(
        Object.values(assetsDictionary),
        undefined,
        true,
      );

      expect(document.createElement).toHaveBeenCalledTimes(1);
      expect(document.head.appendChild).toHaveBeenCalledTimes(1);

      resolveFakeAssets();
      const sources = await scriptsPromise;

      expect(sources).toStrictEqual([
        null, // widget.js
        null, // polyfill1.js
        null, // undefined.js
        null, // polyfill2.js
        null, // unnamed.js
        null,
        null,
        assetsDictionary['lazy.js'].source.es11,
        null,
        null,
        null,
      ]);
    });
  });

  describe('loadJsonAssets() function', () => {
    it('should fetch JSON assets and return their parsed content', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets(
        assets,
        Object.keys(assetsDictionary),
      );
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
        null,
        null,
        JSON.parse(vectorsJsonContent),
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should return a promise that resolves even if a JSON fails to load due to 404 error', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets(assets, [
        'maps/vectors.json',
        'maps/inline.json',
      ]);
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
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should return a promise that resolves even if a JSON fails to load due to network error', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets(assets, [
        'maps/vectors.json',
        'maps/inline.json',
      ]);
      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].reject();
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        null, // maps/vectors.json
        assetsDictionary['maps/inline.json'].source,
      ]);
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should get JSON content from cache if it was already loaded', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets(assets, [
        'maps/vectors.json',
        'maps/inline.json',
      ]);
      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await jsonsPromise;

      const sources2 = await loadJsonAssets(assets, [
        'maps/vectors.json',
        'maps/inline.json',
      ]); // it is resolved instantly

      expect(sources).toStrictEqual(sources2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should get JSON content as the same promise from cache even if it is not loaded yet', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      loadJsonAssets(assets, ['maps/vectors.json', 'maps/inline.json']);
      const jsonsPromise2 = loadJsonAssets(assets, [
        'maps/vectors.json',
        'maps/inline.json',
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
    });

    it('should load inline JSON assets synchronously', () => {
      const sources = loadJsonAssets(assets, ['maps/inline.json']);

      expect(sources).toStrictEqual([
        assetsDictionary['maps/inline.json'].source,
      ]);
    });
  });
});
