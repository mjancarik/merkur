import { loadStyleAssets, loadScriptAssets } from '../index';

global.console.warn = jest.fn();

describe('Merkur component', () => {
  let assets = [];
  let fakeAssetObjects = [];
  let rootElement = null;

  const fakeAssetObjectGenerator = () => {
    const fakeAssetObject = {
      onerror: jest.fn(),
      onload: jest.fn(),
      removeAttribute: (name) => delete fakeAssetObject[name],
      setAttribute: (name, value) => (fakeAssetObject[name] = value),
      addEventListener: jest.fn((type, callback) => callback(type)),
      src: 'http://localhost:4444/static/es9/test.6961af42bfa3596bb147.js',
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

  beforeEach(() => {
    assets = [
      {
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
      {
        name: 'polyfill1.js',
        test: 'return typeof window !== "undefined"',
        type: 'script',
        source: {
          es11: 'http://localhost:4444/static/es11/polyfill.6961af42bfa3596bb147.js',
          es9: 'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb147.js',
        },
      },
      {
        name: 'undefined.js',
        type: 'script',
        source: {
          es11: undefined,
          es9: 'http://localhost:4444/static/es9/undefined.6961af42bfa3596bb147.js',
        },
      },
      {
        name: 'polyfill2.js',
        test: 'return (function () {foo();})()',
        type: 'script',
        source:
          'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb147.js',
      },
      {
        type: 'inlineScript',
        source: 'alert();',
      },
      {
        name: 'widget.css',
        type: 'stylesheet',
        source:
          'http://localhost:4444/static/es11/widget.814e0cb568c7ddc0725d.css',
      },
      {
        type: 'inlineStyle',
        source: '.cssClass { margin-top: 5px; }',
      },
    ];

    fakeAssetObjects = [];

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
  });

  describe('loadStyleAssets() function', () => {
    it('should create style elements for style assets', (done) => {
      loadStyleAssets(assets)
        .then(() => {
          expect(document.createElement).toHaveBeenCalledTimes(2);
          expect(document.createElement).toHaveBeenNthCalledWith(1, 'link');
          expect(document.createElement).toHaveBeenNthCalledWith(2, 'style');
          expect(document.head.appendChild).toHaveBeenCalledTimes(2);

          done();
        })
        .catch(done);

      resolveFakeAssets();

      expect(fakeAssetObjects).toMatchSnapshot();
    });

    it('should return promise that resolves after the styles are loaded', (done) => {
      const stylePromise = loadStyleAssets(assets)
        .then(() => {
          expect(stylePromise).toBeInstanceOf(Promise);

          done();
        })
        .catch(done);

      resolveFakeAssets();
    });

    it('should append style assets to specified element', (done) => {
      loadStyleAssets(assets, rootElement)
        .then(() => {
          expect(rootElement.appendChild).toHaveBeenCalledTimes(2);
          done();
        })
        .catch(done);

      resolveFakeAssets();
    });
  });

  describe('loadScriptAssets() function', () => {
    it('should create script elements for script assets', (done) => {
      loadScriptAssets(assets)
        .then(() => {
          expect(document.createElement).toHaveBeenCalledTimes(4);
          expect(document.head.appendChild).toHaveBeenCalledTimes(4);

          done();
        })
        .catch(done);

      resolveFakeAssets();

      expect(fakeAssetObjects).toMatchSnapshot();
    });

    it('should return promise that resolves after the scripts are loaded', (done) => {
      const scriptsPromise = loadScriptAssets(assets)
        .then(() => {
          expect(scriptsPromise).toBeInstanceOf(Promise);

          done();
        })
        .catch(done);

      resolveFakeAssets();
    });

    it('should append script assets to specified element', (done) => {
      loadScriptAssets(assets, rootElement)
        .then(() => {
          expect(document.createElement).toHaveBeenCalledTimes(4);
          expect(rootElement.appendChild).toHaveBeenCalledTimes(4);

          done();
        })
        .catch(done);

      resolveFakeAssets();
    });

    it('should return promise that rejects after script fails to load', (done) => {
      let script;
      jest.spyOn(rootElement, 'appendChild').mockImplementation((child) => {
        script = child;
      });
      loadScriptAssets(
        [
          {
            name: 'test.js',
            type: 'script',
            source: {
              es9: 'http://localhost:4444/static/es9/test.6961af42bfa3596bb147.js',
            },
          },
        ],
        rootElement,
      )
        .then(() => {
          done('promise was resolved');
        })
        .catch(() => {
          expect(document.createElement).toHaveBeenCalledTimes(1);
          expect(rootElement.appendChild).toHaveBeenCalledTimes(1);
          expect(script.remove).toHaveBeenCalledTimes(1);
          done();
        });

      rejectFakeAssets();
    });

    it('should return promise that resolves after script fails to load', (done) => {
      let script;
      jest.spyOn(rootElement, 'appendChild').mockImplementation((child) => {
        script = child;
      });
      loadScriptAssets(
        [
          {
            name: 'test.js',
            type: 'script',
            source: {
              es9: 'http://localhost:4444/static/es9/test.6961af42bfa3596bb147.js',
            },
            optional: true,
          },
        ],
        rootElement,
      )
        .then(() => {
          expect(document.createElement).toHaveBeenCalledTimes(1);
          expect(rootElement.appendChild).toHaveBeenCalledTimes(1);
          expect(script.remove).toHaveBeenCalledTimes(1);
          done();
        })
        .catch(() => {
          done('promise was rejected');
        });

      rejectFakeAssets();
    });

    it('should return promise that resolves after existing script loads', (done) => {
      const fakeAssetObject = fakeAssetObjectGenerator();
      jest
        .spyOn(rootElement, 'querySelector')
        .mockImplementationOnce(() => fakeAssetObject);
      performance.getEntriesByName = jest.fn(() => []);

      loadScriptAssets(
        [
          {
            name: 'test.js',
            type: 'script',
            optional: true,
            source: {
              es9: 'http://localhost:4444/static/es9/test.6961af42bfa3596bb147.js',
            },
          },
        ],
        rootElement,
      )
        .then(() => {
          expect(fakeAssetObject.addEventListener).toHaveBeenCalledWith(
            'load',
            expect.any(Function),
          );
          expect(fakeAssetObject.addEventListener).toHaveBeenCalledWith(
            'error',
            expect.any(Function),
          );
          expect(fakeAssetObject.addEventListener).toHaveBeenCalledTimes(2);
          expect(document.createElement).toHaveBeenCalledTimes(0);

          done();
        })
        .catch((e) => {
          console.error(e);
          done('promise was rejected');
        });
    });

    it('should throw an error, if script have no source', (done) => {
      loadScriptAssets(
        [
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
        ],
        rootElement,
      )
        .then(() => {
          done('did not reject');
        })
        .catch((error) => {
          expect(error.message).toBe(
            "Asset 'nosource.js' is missing ES variant and could not be loaded.",
          );
          expect(error.asset).toBeTruthy();

          done();
        });
    });

    it('should resolve if script is already present in DOM and loaded', (done) => {
      jest
        .spyOn(rootElement, 'querySelector')
        .mockImplementation(() => 'truthy');

      loadScriptAssets(
        [
          {
            name: 'test.js',
            type: 'script',
            source: {
              es11: 'http://localhost:4444/static/es11/test.6961af42bfa3596bb147.js',
            },
            test: 'return true',
          },
          {
            name: 'test2.js',
            type: 'script',
            source: {
              es11: 'http://localhost:4444/static/es11/test.6961af42bfa3596bb147.js',
            },
          },
        ],
        rootElement,
      )
        .then(() => {
          expect(document.createElement).toHaveBeenCalledTimes(0);

          done();
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
