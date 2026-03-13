import { createMerkurWidget } from '@merkur/core';
import {
  httpCachePlugin,
  cacheInTransformer,
  cacheOutTransformer,
  internalCacheTransformer,
  getCacheKey,
} from '../index';
import CacheEntry from '../CacheEntry';
import { componentPlugin } from '@merkur/plugin-component';
import {
  httpClientPlugin,
  setDefaultConfig,
  getDefaultTransformers,
} from '@merkur/plugin-http-client';

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
        ...getDefaultTransformers(),
        cacheInTransformer(widget),
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
{
  "$dependencies": {
    "AbortController": [Function],
    "fetch": [MockFunction],
  },
  "$external": {},
  "$in": {
    "component": {
      "isHydrated": false,
      "isMounted": false,
      "lifeCycle": {
        "bootstrap": undefined,
        "info": undefined,
        "load": undefined,
        "mount": undefined,
        "unmount": undefined,
        "update": undefined,
      },
      "loadingPromise": null,
      "resolvedViews": Map {},
      "suspendedTasks": [],
    },
    "httpClient": {
      "cache": {
        "get": [MockFunction],
        "set": [MockFunction],
      },
      "defaultConfig": {
        "baseUrl": "http://localhost:4444",
        "headers": {},
        "method": "GET",
        "query": {},
        "timeout": 15000,
        "transferServerCache": false,
        "transformers": [
          {
            "transformRequest": [Function],
            "transformResponse": [Function],
          },
          {
            "transformRequest": [Function],
          },
          {
            "transformRequest": [Function],
            "transformResponse": [Function],
          },
          {
            "transformResponse": [Function],
          },
          {
            "transformRequest": [Function],
          },
        ],
        "ttl": 60000,
        "useCache": true,
      },
      "pendingRequests": Map {},
    },
  },
  "$plugins": [
    {
      "create": [Function],
      "setup": [Function],
    },
    {
      "create": [Function],
      "setup": [Function],
    },
    {
      "create": [Function],
      "setup": [Function],
    },
  ],
  "assets": [
    {
      "source": "http://www.example.com/static/1.0.0/widget.js",
      "type": "script",
    },
  ],
  "bootstrap": [Function],
  "containerSelector": null,
  "create": [Function],
  "http": {
    "request": [Function],
  },
  "httpCache": {
    "deserialize": [Function],
    "get": [Function],
    "serialize": [Function],
  },
  "info": [Function],
  "load": [Function],
  "mount": [Function],
  "name": "my-widget",
  "props": {
    "containerSelector": ".container",
    "param": 1,
  },
  "setProps": [Function],
  "setState": [Function],
  "setup": [Function],
  "slot": {},
  "state": {},
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
      expect.any(CacheEntry),
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

  it('should not read response from cache when revalidating', async () => {
    const { request } = await widget.http.request({
      path: '/path/to/url',
      revalidateCache: true,
    });

    const cacheKey = getCacheKey(request);

    expect(widget.$in.httpClient.cache.get).not.toHaveBeenCalled();
    expect(widget.$in.httpClient.cache.set).toHaveBeenCalledWith(
      cacheKey,
      expect.any(CacheEntry),
    );
    expect(cacheMock[cacheKey]).toBeInstanceOf(CacheEntry);
  });

  it('should keep same cached value when mutating response object', async () => {
    const { request } = await widget.http.request({ path: '/path/to/url' });

    const cacheKey = getCacheKey(request);

    const { response } = await widget.http.request({ path: '/path/to/url' });

    response.body = { data: 'change' };
    expect(cacheMock[cacheKey]._value.body).toEqual({ message: 'text' });
  });
});

describe('internalCacheTransformer', () => {
  let widget = null;
  let fetchMock = null;

  const makeResponse = (body = { message: 'text' }) => ({
    json() {
      return Promise.resolve(body);
    },
    ok: true,
    headers: {
      get() {
        return 'application/json';
      },
    },
    status: 200,
  });

  beforeEach(async () => {
    widget = await createMerkurWidget({
      $plugins: [componentPlugin, httpClientPlugin, httpCachePlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {},
      assets: [],
    });

    fetchMock = jest.fn(() => Promise.resolve(makeResponse()));
    widget.$dependencies.fetch = fetchMock;

    setDefaultConfig(widget, {
      baseUrl: 'http://localhost:4444',
      transformers: [
        ...getDefaultTransformers(),
        cacheOutTransformer(widget),
        internalCacheTransformer(widget),
        cacheInTransformer(widget),
      ],
      useCache: true,
    });
  });

  it('should deduplicate concurrent requests – fetch called only once', async () => {
    const [result1, result2] = await Promise.all([
      widget.http.request({ path: '/api/data' }),
      widget.http.request({ path: '/api/data' }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result1.response.body).toEqual({ message: 'text' });
    expect(result2.response.body).toEqual({ message: 'text' });
    expect(result2.response.cached).toBe(true);
  });

  it('should clean up pendingRequests after successful request', async () => {
    await widget.http.request({ path: '/api/data' });

    expect(widget.$in.httpClient.pendingRequests.size).toBe(0);
  });

  it('should propagate error to all waiting requests', async () => {
    const networkError = new Error('Network failure');
    fetchMock.mockRejectedValueOnce(networkError);

    const [p1, p2] = [
      widget.http.request({ path: '/api/fail' }),
      widget.http.request({ path: '/api/fail' }),
    ];

    await expect(p1).rejects.toThrow('Network failure');
    await expect(p2).rejects.toThrow('Network failure');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should clean up pendingRequests after failed request', async () => {
    fetchMock.mockRejectedValueOnce(new Error('fail'));

    await widget.http.request({ path: '/api/fail' }).catch(() => {});

    expect(widget.$in.httpClient.pendingRequests.size).toBe(0);
  });

  it('should bypass internalCache when revalidateCache is true', async () => {
    // First request – populates resolved cache
    await widget.http.request({ path: '/api/data' });

    fetchMock
      .mockResolvedValueOnce(makeResponse({ message: 'fresh-1' }))
      .mockResolvedValueOnce(makeResponse({ message: 'fresh-2' }));

    // Both revalidate requests must bypass internal cache and hit network independently
    const [r1, r2] = await Promise.all([
      widget.http.request({ path: '/api/data', revalidateCache: true }),
      widget.http.request({ path: '/api/data', revalidateCache: true }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(3); // 1 initial + 2 revalidate
    expect(r1.response.body).toEqual({ message: 'fresh-1' });
    expect(r2.response.body).toEqual({ message: 'fresh-2' });
  });

  it('should not mark first (pending) request response as cached', async () => {
    const [result1] = await Promise.all([
      widget.http.request({ path: '/api/data' }),
      widget.http.request({ path: '/api/data' }),
    ]);

    expect(result1.response.cached).toBeUndefined();
  });

  describe('transformError', () => {
    it('should reject waiting requests via transformError when first request fails', async () => {
      const networkError = new Error('Network failure');
      fetchMock.mockRejectedValueOnce(networkError);

      const p1 = widget.http.request({ path: '/api/data' });
      const p2 = widget.http.request({ path: '/api/data' });

      await expect(p1).rejects.toThrow('Network failure');
      await expect(p2).rejects.toThrow('Network failure');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should clean up pendingRequests via transformError after network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('fail'));

      await widget.http.request({ path: '/api/data' }).catch(() => {});

      expect(widget.$in.httpClient.pendingRequests.size).toBe(0);
    });

    it('should not call transformError when response comes from resolved cache', async () => {
      // populate cache
      await widget.http.request({ path: '/api/data' });

      const errorTransformerSpy = jest.fn();
      setDefaultConfig(widget, {
        transformers: [
          ...getDefaultTransformers(),
          cacheOutTransformer(widget),
          internalCacheTransformer(widget),
          cacheInTransformer(widget),
          { transformError: errorTransformerSpy },
        ],
      });

      fetchMock.mockRejectedValueOnce(new Error('never'));

      // should be served from cache, fetch never called, transformError never called
      const { response } = await widget.http.request({ path: '/api/data' });

      expect(response.cached).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1); // only the initial populate call
      expect(errorTransformerSpy).not.toHaveBeenCalled();
    });
  });
});
