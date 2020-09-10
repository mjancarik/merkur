import { loadStyleAssets, loadScriptAssets } from '../index';

global.console.warn = jest.fn();

describe('Merkur component', () => {
  let assets = [];
  let fakeAssetObjects = [];

  const fakeAssetObjectGenerator = () => {
    const fakeAssetObject = {
      onerror: jest.fn(),
      onload: jest.fn(),
      removeAttribute: (name) => delete fakeAssetObject[name],
      setAttribute: (name, value) => (fakeAssetObject[name] = value),
    };
    fakeAssetObjects.push(fakeAssetObject);

    return fakeAssetObject;
  };

  const resolveFakeAssets = () => {
    for (const fakeAsset of fakeAssetObjects) {
      fakeAsset.onload();
    }
  };

  beforeEach(() => {
    assets = [
      {
        name: 'widget.js',
        type: 'script',
        source: {
          es9:
            'http://localhost:4444/static/es9/widget.6961af42bfa3596bb147.js',
          es5:
            'http://localhost:4444/static/es5/widget.31c5090d8c961e43fade.js',
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
          es9:
            'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb147.js',
          es5:
            'http://localhost:4444/static/es5/polyfill.6961af42bfa3596bb147.js',
        },
      },
      {
        name: 'undefined.js',
        type: 'script',
        source: {
          es9: undefined,
          es5:
            'http://localhost:4444/static/es5/undefined.6961af42bfa3596bb147.js',
        },
      },
      {
        name: 'polyfill2.js',
        test: 'return (function () {foo();})()',
        type: 'script',
        source:
          'http://localhost:4444/static/es5/polyfill.6961af42bfa3596bb147.js',
      },
      {
        type: 'inlineScript',
        source: 'alert();',
      },
      {
        name: 'widget.css',
        type: 'stylesheet',
        source:
          'http://localhost:4444/static/es9/widget.814e0cb568c7ddc0725d.css',
      },
      {
        type: 'inlineStyle',
        source: '.cssClass { margin-top: 5px; }',
      },
    ];

    fakeAssetObjects = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadStyleAssets() function', () => {
    it('should create style elements for style assets', (done) => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation(fakeAssetObjectGenerator);
      spyOn(document.head, 'appendChild');

      loadStyleAssets(assets).then(() => {
        expect(document.createElement).toHaveBeenCalledTimes(2);
        expect(document.head.appendChild).toHaveBeenCalledTimes(2);

        done();
      });

      resolveFakeAssets();

      expect(fakeAssetObjects).toMatchSnapshot();
    });

    it('should return promise that resolves after the styles are loaded', (done) => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation(fakeAssetObjectGenerator);
      spyOn(document.head, 'appendChild');

      const stylePromise = loadStyleAssets(assets).then(() => {
        expect(stylePromise).toBeInstanceOf(Promise);

        done();
      });

      resolveFakeAssets();
    });
  });

  describe('loadScriptAssets() function', () => {
    it('should create script elements for script assets', (done) => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation(fakeAssetObjectGenerator);
      spyOn(document.head, 'appendChild');

      loadScriptAssets(assets).then(() => {
        expect(document.createElement).toHaveBeenCalledTimes(3);
        expect(document.head.appendChild).toHaveBeenCalledTimes(3);

        done();
      });

      resolveFakeAssets();

      expect(fakeAssetObjects).toMatchSnapshot();
    });

    it('should return promise that resolves after the scripts are loaded', (done) => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation(fakeAssetObjectGenerator);
      spyOn(document.head, 'appendChild');

      const scriptsPromise = loadScriptAssets(assets).then(() => {
        expect(scriptsPromise).toBeInstanceOf(Promise);

        done();
      });

      resolveFakeAssets();
    });
  });
});
