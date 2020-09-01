import { loadStyleAssets, loadScriptAssets } from '../index';

describe('Merkur component', () => {
  let assets = [];
  let fakeAssetObjects = [];

  const fakeAssetObjectGenerator = () => {
    const fakeAssetObject = { onload: jest.fn(), onerror: jest.fn() };
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
      },
      {
        name: 'polyfill.js',
        test: 'var a;',
        type: 'script',
        source:
          'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb147.js',
      },
      {
        name: 'polyfill.js',
        test: '(function () {foo();})()',
        type: 'script',
        source:
          'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb1472.js',
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
