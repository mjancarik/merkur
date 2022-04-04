import { createMerkurWidget } from '@merkur/core';
import {
  httpCachePlugin,
  cacheInTransformer,
  cacheOutTransformer,
  getCacheKey,
} from '../index';
import CacheEntry from '../CacheEntry';
import { componentPlugin } from '@merkur/plugin-component';
import {
  httpClientPlugin,
  setDefaultConfig,
  getDefaultTransformers,
} from '@merkur/plugin-http-client';
import clone from 'clone';

describe('createWidget method with http client plugin', () => {
  let widget = null;
  let Response = null;
  let cacheMock = null;

  beforeEach(async () => {
    widget = await createMerkurWidget({
      $plugins: [componentPlugin, httpClientPlugin, httpCachePlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1,
        containerSelector: '.container',
      },
      assets: [
        {
          type: 'script',
          source: 'http://www.example.com/static/1.0.0/widget.js',
        },
      ],
    });

    setDefaultConfig(widget, {
      baseUrl: 'http://localhost:4444',
      transformers: [
        cacheInTransformer(widget),
        ...getDefaultTransformers(),
        cacheOutTransformer(widget),
      ],
      useCache: true,
    });

    cacheMock = {};

    widget.$dependencies.fetch = jest.fn(() => Promise.resolve(Response));
    widget.$in.httpClient.cache = {
      get: jest.fn((key) => cacheMock[key]),
      set: jest.fn((key, value) => (cacheMock[key] = value)),
    };

    Response = {
      json() {
        return Promise.resolve({ message: 'text' });
      },
      clone() {
        return clone(this);
      },
      ok: true,
      headers: {
        get() {
          return 'application/json';
        },
      },
      status: 200,
    };
  });

  it('should create empty widget', async () => {
    expect(widget).toMatchInlineSnapshot(`
      Object {
        "$dependencies": Object {
          "AbortController": [Function],
          "fetch": [MockFunction],
        },
        "$external": Object {
          "AbortController": [Function],
          "fetch": [MockFunction],
        },
        "$in": Object {
          "component": Object {
            "isHydrated": false,
            "isMounted": false,
            "lifeCycle": Object {
              "bootstrap": undefined,
              "info": undefined,
              "load": undefined,
              "mount": undefined,
              "unmount": undefined,
              "update": undefined,
            },
          },
          "httpClient": Object {
            "cache": Object {
              "get": [MockFunction],
              "set": [MockFunction],
            },
            "defaultConfig": Object {
              "baseUrl": "http://localhost:4444",
              "headers": Object {},
              "method": "GET",
              "query": Object {},
              "timeout": 15000,
              "transformers": Array [
                Object {
                  "transformResponse": [Function],
                },
                Object {
                  "transformRequest": [Function],
                  "transformResponse": [Function],
                },
                Object {
                  "transformRequest": [Function],
                },
                Object {
                  "transformRequest": [Function],
                  "transformResponse": [Function],
                },
                Object {
                  "transformRequest": [Function],
                },
              ],
              "ttl": 60000,
              "useCache": true,
            },
          },
        },
        "$plugins": Array [
          Object {
            "create": [Function],
            "setup": [Function],
          },
          Object {
            "create": [Function],
            "setup": [Function],
          },
          Object {
            "create": [Function],
            "setup": [Function],
          },
        ],
        "assets": Array [
          Object {
            "source": "http://www.example.com/static/1.0.0/widget.js",
            "type": "script",
          },
        ],
        "bootstrap": [Function],
        "containerSelector": null,
        "create": [Function],
        "http": Object {
          "request": [Function],
        },
        "httpCache": Object {
          "deserialize": [Function],
          "get": [Function],
          "serialize": [Function],
        },
        "info": [Function],
        "load": [Function],
        "mount": [Function],
        "name": "my-widget",
        "props": Object {
          "containerSelector": ".container",
          "param": 1,
        },
        "setProps": [Function],
        "setState": [Function],
        "setup": [Function],
        "state": Object {},
        "unmount": [Function],
        "update": [Function],
        "version": "1.0.0",
      }
    `);
  });

  it('should store response in cache', async () => {
    const { request } = await widget.http.request({ path: '/path/to/url' });

    const cacheKey = getCacheKey(request);

    expect(widget.$in.httpClient.cache.set).toHaveBeenCalledWith(
      cacheKey,
      expect.any(CacheEntry)
    );
    expect(cacheMock[cacheKey]).toBeInstanceOf(CacheEntry);
  });

  it('should use response from cache', async () => {
    const { request } = await widget.http.request({ path: '/path/to/url' });

    const cacheKey = getCacheKey(request);

    expect(widget.$in.httpClient.cache.set).toHaveBeenCalled();

    const { response } = await widget.http.request({ path: '/path/to/url' });

    expect(widget.$in.httpClient.cache.get).toHaveBeenCalledWith(cacheKey);
    expect(response.cached).toBeTruthy();
  });

  it('should keep same cached value when mutating response object', async () => {
    const { request } = await widget.http.request({ path: '/path/to/url' });

    const cacheKey = getCacheKey(request);

    const { response } = await widget.http.request({ path: '/path/to/url' });

    response.body = { data: 'change' };
    expect(cacheMock[cacheKey]._value.body).toEqual({ message: 'text' });
  });
});
