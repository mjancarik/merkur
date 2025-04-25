import {
  loadAssets,
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
          (el.dataset?.src &&
            el.dataset.src === selector.match(/src='([^']+)'/)?.[1]),
      ),
    ),
    querySelectorAll: jest.fn((selector) =>
      fakeAssetObjects.filter((el) =>
        selector === 'script[type="application/json"]'
          ? el.tagName === 'script' && el.type === 'application/json'
          : el.tagName === selector,
      ),
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
      text: () => Promise.resolve(defaultResponseBody),
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

  function getAssetWithElement(assetNameOrObject, element, additionalProps) {
    return {
      ...(typeof assetNameOrObject === 'string'
        ? assetsDictionary[assetNameOrObject]
        : assetNameOrObject),
      element,
      ...additionalProps,
    };
  }

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
          es13: 'http://localhost:4444/static/es13/widget.6241af42bfa3596bb129.js',
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
    it('should create style elements for style assets and return them in asset objects', async () => {
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
        getAssetWithElement('widget.js', null),
        getAssetWithElement('polyfill1.js', null),
        getAssetWithElement('undefined.js', null),
        getAssetWithElement('polyfill2.js', null),
        getAssetWithElement('unnamed.js', null),
        getAssetWithElement('widget.css', fakeAssetObjects[0]),
        getAssetWithElement('unnamed.css', fakeAssetObjects[1]),
        getAssetWithElement('maps/vectors.json', null),
        getAssetWithElement('maps/inline.json', null),
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
      const widgetCss = {
        ...assetsDictionary['widget.css'],
        optional: true,
      };
      const stylesPromise = loadStyleAssets([
        widgetCss,
        assetsDictionary['unnamed.css'],
      ]);
      rejectFakeAssets();

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      const sources = await stylesPromise;

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1); // widget.css
      expect(fakeAssetObjects[1].remove).not.toHaveBeenCalled(); // unnamed.css
      expect(sources).toStrictEqual([
        getAssetWithElement(widgetCss, null),
        getAssetWithElement('unnamed.css', fakeAssetObjects[1]),
      ]);
    });

    it('should return a promise that resolves when a style (not created by loadStyleAssets) is already present in the DOM and is already loaded', async () => {
      const link = fakeAssetObjectGenerator('link');
      link.href = assetsDictionary['widget.css'].source;
      const noAssetStyle = fakeAssetObjectGenerator('style');
      noAssetStyle.innerHTML = 'https://not-found.com/asset.css';
      const style = fakeAssetObjectGenerator('style');
      style.innerHTML = assetsDictionary['unnamed.css'].source;
      resolveFakeAssets();

      const stylesPromise = loadStyleAssets([
        assetsDictionary['widget.css'],
        assetsDictionary['unnamed.css'],
      ]);
      const sources = await stylesPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([
        getAssetWithElement('widget.css', link),
        getAssetWithElement('unnamed.css', style),
      ]);
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

      expect(sources).toStrictEqual([
        getAssetWithElement('widget.css', fakeAssetObjects[0]),
      ]);
    });
  });

  describe('loadScriptAssets() function', () => {
    it('should create script elements for script assets and return them in asset objects', async () => {
      const scriptsPromise = loadScriptAssets(assets);

      expect(scriptsPromise).toBeInstanceOf(Promise);
      expect(document.createElement).toHaveBeenCalledTimes(4); // without polyfill1.js
      expect(document.head.appendChild).toHaveBeenCalledTimes(4); // without polyfill1.js

      resolveFakeAssets();
      const sources = await scriptsPromise;

      expect(fakeAssetObjects).toMatchSnapshot();
      expect(sources).toStrictEqual([
        getAssetWithElement('widget.js', fakeAssetObjects[0], {
          source: assetsDictionary['widget.js'].source.es13,
        }),
        getAssetWithElement('polyfill1.js', null, {
          source: assetsDictionary['polyfill1.js'].source.es11,
        }),
        getAssetWithElement('undefined.js', fakeAssetObjects[1], {
          source: assetsDictionary['undefined.js'].source.es9, // es11 is undefined
        }),
        getAssetWithElement('polyfill2.js', fakeAssetObjects[2], {
          source: assetsDictionary['polyfill2.js'].source,
        }),
        getAssetWithElement('unnamed.js', fakeAssetObjects[3], {
          source: assetsDictionary['unnamed.js'].source,
        }),
        getAssetWithElement('widget.css', null),
        getAssetWithElement('unnamed.css', null),
        getAssetWithElement('maps/vectors.json', null),
        getAssetWithElement('maps/inline.json', null),
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
      const testJs = {
        name: 'test.js',
        type: 'script',
        source: {
          es9: 'http://localhost:4444/static/es9/test.6961af42bfa3596bb147.js',
        },
        optional: true,
      };
      const scriptsPromise = loadScriptAssets([
        testJs,
        assetsDictionary['unnamed.js'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(2);

      rejectFakeAssets();
      const sources = await scriptsPromise;

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
      expect(sources).toStrictEqual([
        getAssetWithElement(testJs, null, {
          source: testJs.source.es9,
        }),
        getAssetWithElement('unnamed.js', fakeAssetObjects[1]),
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
      script.src = assetsDictionary['widget.js'].source.es13;
      const inlineScript = fakeAssetObjectGenerator('script');
      inlineScript.textContent = assetsDictionary['unnamed.js'].source;
      resolveFakeAssets();

      const widgetJs = {
        ...assetsDictionary['widget.js'],
        test: 'return true',
      };
      const sciptsPromise = loadScriptAssets([
        widgetJs,
        assetsDictionary['unnamed.js'],
      ]);
      const sources = await sciptsPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([
        getAssetWithElement(widgetJs, script, {
          source: assetsDictionary['widget.js'].source.es13,
        }),
        getAssetWithElement('unnamed.js', inlineScript),
      ]);
    });

    it('should resolve if a script (not created by loadScriptAssets) is already present in the DOM but not yet loaded', async () => {
      const script = fakeAssetObjectGenerator('script');
      script.src = assetsDictionary['widget.js'].source.es13;

      const sciptsPromise = loadScriptAssets([
        { ...assetsDictionary['widget.js'] },
      ]);

      resolveFakeAssets();
      const sources = await sciptsPromise;

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([
        getAssetWithElement('widget.js', script, {
          source: assetsDictionary['widget.js'].source.es13,
        }),
      ]);
    });

    it('should resolve if a script (created by loadScriptAsssets) is already present in the DOM and is already loaded', async () => {
      const script = assetsDictionary['widget.js'];
      const sciptsPromise = loadScriptAssets([script]);
      resolveFakeAssets();
      await sciptsPromise;

      expect(document.createElement).toHaveBeenCalledTimes(1);
      document.createElement.mockClear();

      const sources = await loadScriptAssets([script]);

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(sources).toStrictEqual([
        getAssetWithElement('widget.js', fakeAssetObjects[0], {
          source: assetsDictionary['widget.js'].source.es13,
        }),
      ]);
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

      expect(sources).toStrictEqual([
        getAssetWithElement('widget.js', fakeAssetObjects[0], {
          source: assetsDictionary['widget.js'].source.es13,
        }),
      ]);
    });
  });

  describe('loadJsonAssets() function', () => {
    it('should create script elements (with type="application/json") for JSON assets and return them in asset objects', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets(assets);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        getAssetWithElement('widget.js', null),
        getAssetWithElement('polyfill1.js', null),
        getAssetWithElement('undefined.js', null),
        getAssetWithElement('polyfill2.js', null),
        getAssetWithElement('unnamed.js', null),
        getAssetWithElement('widget.css', null),
        getAssetWithElement('unnamed.css', null),
        getAssetWithElement('maps/vectors.json', fakeAssetObjects[0]),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[1]),
      ]);
      expect(fakeAssetObjects).toStrictEqual([
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: vectorsJsonContent,
        }),
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: JSON.stringify(
            assetsDictionary['maps/inline.json'].source,
          ),
        }),
      ]);
      expect(fakeAssetObjects[0].type).toBe('application/json');
      expect(fakeAssetObjects[0].textContent).toBe(vectorsJsonContent);
      expect(fakeAssetObjects[1].type).toBe('application/json');
      expect(fakeAssetObjects[1].textContent).toBe(
        JSON.stringify(assetsDictionary['maps/inline.json'].source),
      );
      expect(console.warn).not.toHaveBeenCalled();
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
    });

    it('should reject when a JSON fails to load due to 400 error', async () => {
      expect.assertions(5);
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve({
        ok: false,
        status: 404,
      });

      try {
        await jsonsPromise;
      } catch (error) {
        expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(Error);
        expect(error.asset).toEqual(assetsDictionary['maps/vectors.json']);
      }
    });

    it('should resolve if an optional JSON fails to load due to 404 error', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const vectorsJson = {
        ...assetsDictionary['maps/vectors.json'],
        optional: true,
      };
      const jsonsPromise = loadJsonAssets([
        vectorsJson,
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      assetLoadingDeferreds[vectorsJson.source][0].resolve({
        ok: false,
        status: 404,
      });
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        getAssetWithElement(vectorsJson, null),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[1]),
      ]);
      expect(console.warn).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1); // maps/vectors.json
    });

    it('should reject when a JSON fails to load due to network error', async () => {
      expect.assertions(5);
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);
      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].reject();

      try {
        await jsonsPromise;
      } catch (error) {
        expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(Error);
        expect(error.asset).toEqual(assetsDictionary['maps/vectors.json']);
      }
    });

    it('should resolve if an optional JSON fails to load due to network error', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const vectorsJson = {
        ...assetsDictionary['maps/vectors.json'],
        optional: true,
      };
      const jsonsPromise = loadJsonAssets([
        vectorsJson,
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      assetLoadingDeferreds[vectorsJson.source][0].reject();
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        getAssetWithElement(vectorsJson, null),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[1]),
      ]);
      expect(console.warn).toHaveBeenCalledTimes(1); // maps/vectors.json
      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1); // maps/vectors.json
    });

    it('should resolve if a JSON script (created by loadJsonAsssets) is already present in the DOM and is already loaded', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const jsonsPromise = loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);
      document.createElement.mockClear();

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await jsonsPromise;

      const sources2 = await loadJsonAssets([
        getAssetWithElement('maps/vectors.json', fakeAssetObjects[0]),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[1]),
      ]);

      expect(fakeAssetObjects).toStrictEqual([
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: vectorsJsonContent,
        }),
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: JSON.stringify(
            assetsDictionary['maps/inline.json'].source,
          ),
        }),
      ]);
      expect(sources).toStrictEqual(sources2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(console.warn).not.toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
    });

    it('should resolve if a JSON script (created by loadJsonAsssets) is already present in the DOM but not yet loaded', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);
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
        getAssetWithElement('maps/vectors.json', fakeAssetObjects[0]),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[1]),
      ]);
      expect(fakeAssetObjects).toStrictEqual([
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: vectorsJsonContent,
        }),
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: JSON.stringify(
            assetsDictionary['maps/inline.json'].source,
          ),
        }),
      ]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(console.warn).not.toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
    });

    it('should resolve if a JSON script (not created by loadJsonAsssets) is already present in the DOM and is already loaded', async () => {
      const script = fakeAssetObjectGenerator('script');
      script.type = 'application/json';
      script.dataset.src = assetsDictionary['maps/vectors.json'].source;
      script.textContent = vectorsJsonContent;

      const sources = await loadJsonAssets([
        assetsDictionary['maps/vectors.json'],
        assetsDictionary['maps/inline.json'],
      ]);

      expect(sources).toStrictEqual([
        getAssetWithElement('maps/vectors.json', script),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[1]),
      ]);
      expect(fakeAssetObjects).toStrictEqual([
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: vectorsJsonContent,
        }),
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: JSON.stringify(
            assetsDictionary['maps/inline.json'].source,
          ),
        }),
      ]);
      expect(document.createElement).toHaveBeenCalledTimes(1); // maps/inline.json
      expect(document.head.appendChild).toHaveBeenCalledTimes(1); // maps/inline.json
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should reject if a JSON script (not created by loadJsonAsssets) is already present in the DOM and does not have textContent', async () => {
      expect.assertions(3);
      const script = fakeAssetObjectGenerator('script');
      script.type = 'application/json';
      script.dataset.src = assetsDictionary['maps/vectors.json'].source;

      try {
        await loadJsonAssets([
          assetsDictionary['maps/vectors.json'],
          assetsDictionary['maps/inline.json'],
        ]);
      } catch (error) {
        expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
        expect(error).toBeInstanceOf(Error);
        expect(error.asset).toEqual(assetsDictionary['maps/vectors.json']);
      }
    });

    it('should resolve to an asset object with element: null if an optional JSON script (not created by loadJsonAsssets) is already present in the DOM and does not have textContent', async () => {
      const script = fakeAssetObjectGenerator('script');
      script.type = 'application/json';
      script.dataset.src = assetsDictionary['maps/vectors.json'].source;

      const vectorsJson = {
        ...assetsDictionary['maps/vectors.json'],
        optional: true,
      };
      const sources = await loadJsonAssets([
        vectorsJson,
        assetsDictionary['maps/inline.json'],
      ]);

      expect(sources).toStrictEqual([
        getAssetWithElement(vectorsJson, null),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[1]),
      ]);
      expect(document.createElement).toHaveBeenCalledTimes(1); // maps/inline.json
      expect(document.head.appendChild).toHaveBeenCalledTimes(1); // maps/inline.json
      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1); // maps/vectors.json
    });

    it('should remove a JSON script element if ttl is set after the timeout', async () => {
      jest.useFakeTimers();
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const ttl1 = 1000;
      const ttl2 = 2000;
      const vectorsJson = {
        ...assetsDictionary['maps/vectors.json'],
        ttl: ttl1,
      };
      const inlineJson = {
        ...assetsDictionary['maps/inline.json'],
        ttl: ttl2,
      };
      const jsonsPromise = loadJsonAssets([vectorsJson, inlineJson]);
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.head.appendChild).toHaveBeenCalledTimes(2);

      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await jsonsPromise;

      expect(sources).toStrictEqual([
        getAssetWithElement(vectorsJson, fakeAssetObjects[0]),
        getAssetWithElement(inlineJson, fakeAssetObjects[1]),
      ]);
      expect(fakeAssetObjects).toStrictEqual([
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: vectorsJsonContent,
        }),
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: JSON.stringify(
            assetsDictionary['maps/inline.json'].source,
          ),
        }),
      ]);
      jest.advanceTimersByTime(ttl1 - 1);

      expect(fakeAssetObjects[0].remove).not.toHaveBeenCalled();
      expect(fakeAssetObjects[1].remove).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
      expect(fakeAssetObjects[1].remove).not.toHaveBeenCalled();

      jest.advanceTimersByTime(ttl2 - ttl1 - 1);

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
      expect(fakeAssetObjects[1].remove).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);

      expect(fakeAssetObjects[0].remove).toHaveBeenCalledTimes(1);
      expect(fakeAssetObjects[1].remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadAssets() function', () => {
    it('should load assets', async () => {
      global.fetch.mockImplementation(
        fetchMockImplementation({ defaultResponseBody: vectorsJsonContent }),
      );
      const assetsPromise = loadAssets(assets);
      resolveFakeAssets();
      assetLoadingDeferreds[
        assetsDictionary['maps/vectors.json'].source
      ][0].resolve();
      const sources = await assetsPromise;

      expect(assetsPromise).toBeInstanceOf(Promise);
      expect(document.createElement).toHaveBeenCalledTimes(8);
      expect(sources).toStrictEqual([
        getAssetWithElement('widget.js', fakeAssetObjects[0], {
          source: assetsDictionary['widget.js'].source.es13,
        }),
        getAssetWithElement('polyfill1.js', null, {
          source: assetsDictionary['polyfill1.js'].source.es11,
        }),
        getAssetWithElement('undefined.js', fakeAssetObjects[1], {
          source: assetsDictionary['undefined.js'].source.es9,
        }),
        getAssetWithElement('polyfill2.js', fakeAssetObjects[2], {
          source: assetsDictionary['polyfill2.js'].source,
        }),
        getAssetWithElement('unnamed.js', fakeAssetObjects[3], {
          source: assetsDictionary['unnamed.js'].source,
        }),
        getAssetWithElement('widget.css', fakeAssetObjects[4]),
        getAssetWithElement('unnamed.css', fakeAssetObjects[5]),
        getAssetWithElement('maps/vectors.json', fakeAssetObjects[6]),
        getAssetWithElement('maps/inline.json', fakeAssetObjects[7]),
      ]);
      expect([fakeAssetObjects[6], fakeAssetObjects[7]]).toStrictEqual([
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: vectorsJsonContent,
        }),
        expect.objectContaining({
          tagName: 'script',
          type: 'application/json',
          textContent: JSON.stringify(
            assetsDictionary['maps/inline.json'].source,
          ),
        }),
      ]);

      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
