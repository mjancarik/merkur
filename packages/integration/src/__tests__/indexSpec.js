import { loadStyleAssets, loadScriptAssets } from '../index';

describe('Merkur component', () => {
  let assets = [];
  let fakeScriptObjects = [];

  const fakeScriptObjectGenerator = () => {
    const fakeScriptObject = { onload: jest.fn(), onerror: jest.fn() };
    fakeScriptObjects.push(fakeScriptObject);

    return fakeScriptObject;
  };

  const resolveFakeScripts = () => {
    for (const fakeScript of fakeScriptObjects) {
      fakeScript.onload();
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
        type: 'script',
        source:
          'http://localhost:4444/static/es9/polyfill.6961af42bfa3596bb147.js',
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

    fakeScriptObjects = [];
  });

  describe('loadStyleAssets() function', () => {
    it('should create style elements for style assets', () => {
      spyOn(document, 'createElement').and.callThrough();
      spyOn(document.head, 'appendChild').and.callThrough();

      return loadStyleAssets(assets).then(() => {
        expect(document.createElement).toHaveBeenCalledTimes(2);
        expect(document.head.appendChild).toHaveBeenCalledTimes(2);
      });
    });

    it('should return promise that resolves after the styles are loaded', () => {
      expect(loadStyleAssets(assets)).toBeInstanceOf(Promise);
    });
  });

  describe('loadScriptAssets() function', () => {
    it('should create script elements for script assets', (done) => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation(fakeScriptObjectGenerator);
      spyOn(document.head, 'appendChild').and.stub();

      loadScriptAssets(assets).then(() => {
        expect(document.createElement).toHaveBeenCalledTimes(2);
        expect(document.head.appendChild).toHaveBeenCalledTimes(2);

        done();
      });

      resolveFakeScripts();
    });

    it('should return promise that resolves after the scripts are loaded', () => {
      jest
        .spyOn(document, 'createElement')
        .mockImplementation(fakeScriptObjectGenerator);
      spyOn(document.head, 'appendChild').and.stub();

      const scriptsPromise = loadScriptAssets(assets).then(() =>
        expect(scriptsPromise).toBeInstanceOf(Promise)
      );

      resolveFakeScripts();

      return scriptsPromise;
    });
  });
});
