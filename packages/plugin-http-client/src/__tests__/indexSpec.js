import { createMerkurWidget } from '@merkur/core';
import {
  httpClientPlugin,
  setDefaultConfig,
  getDefaultTransformers,
} from '../index';

describe('createWidget method with http client plugin', () => {
  let widget = null;
  let Response = null;

  beforeEach(async () => {
    widget = await createMerkurWidget({
      $plugins: [httpClientPlugin],
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

    function transformInCache(widget) {
      widget.$in.httpClient.cache = {};
      return {
        async transformResponse(widget, request, response) {
          if (request.cache) {
            widget.$in.httpClient.cache[request.url] = response;
          }

          return [request, response];
        },
      };
    }

    function transformOutCache(widget) {
      widget.$in.httpClient.cache = {};
      return {
        async transformRequest(widget, request, response) {
          if (!widget.$in.httpClient.cache[request.url] || !request.cache) {
            return [request, response];
          }

          return [request, widget.$in.httpClient.cache[request.url]];
        },
      };
    }

    setDefaultConfig(widget, {
      baseUrl: 'http://localhost:4444',
      transformers: [
        transformInCache(widget),
        ...getDefaultTransformers(),
        transformOutCache(widget),
      ],
    });

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
      Object {
        "$dependencies": Object {
          "AbortController": [Function],
          "fetch": [Function],
        },
        "$external": Object {
          "AbortController": [Function],
          "fetch": [Function],
        },
        "$in": Object {
          "httpClient": Object {
            "cache": Object {},
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
            },
          },
        },
        "$plugins": Array [
          Object {
            "setup": [Function],
          },
        ],
        "create": [Function],
        "http": Object {
          "request": [Function],
        },
        "name": "my-widget",
        "setup": [Function],
        "version": "1.0.0",
      }
    `);
  });

  describe('API request', () => {
    beforeEach(() => {
      widget.$dependencies.fetch = jest.fn(() => Promise.resolve(Response));
    });

    it('should generate absolute url', async () => {
      const { request } = await widget.http.request({
        path: '/path/to/url',
      });

      expect(request.url).toMatchInlineSnapshot(
        `"http://localhost:4444/path/to/url"`
      );
    });

    it('should always generate valid absolute url', async () => {
      let requests = [
        {
          baseUrl: 'http://base.com/',
          path: '/route/id',
        },
        {
          baseUrl: 'http://base.com',
          path: '/route/id',
        },
        {
          baseUrl: 'http://base.com',
          path: 'route/id',
        },
        {
          baseUrl: 'http://base.com/',
          path: 'route/id',
        },
      ];

      await requests.forEach(async (request) => {
        const { request: newRequest } = await widget.http.request({
          baseUrl: request.baseUrl,
          path: request.path,
        });

        expect(newRequest.url).toEqual('http://base.com/route/id');
      });
    });

    it('should generate absolute url with query', async () => {
      const { request } = await widget.http.request({
        path: '/path?c=d',
      });

      expect(request.url).toMatchInlineSnapshot(
        `"http://localhost:4444/path?c=d"`
      );
    });

    it('should generate new query string', async () => {
      const { request } = await widget.http.request({
        path: '/path',
        query: { a: 'b' },
      });

      expect(request.url).toMatchInlineSnapshot(
        `"http://localhost:4444/path?a=b"`
      );
    });

    it('should generate add query string to existing one', async () => {
      const { request } = await widget.http.request({
        path: '/path?c=d',
        query: { a: 'b' },
      });

      expect(request.url).toMatchInlineSnapshot(
        `"http://localhost:4444/path?c=d&a=b"`
      );
    });

    it('should send body', async () => {
      const { request } = await widget.http.request({
        method: 'POST',
        path: '/path?c=d',
        body: { a: 'b' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(request.body).toMatchInlineSnapshot(`"{\\"a\\":\\"b\\"}"`);
    });

    it('should timeout request which exceed predefined timeout limit', async () => {
      widget.$dependencies.fetch = jest.fn((url, request) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            request.signal.aborted ? reject(new Error('Timeout')) : resolve();
          }, 10);
        });
      });

      try {
        await widget.http.request({
          path: '/path',
          timeout: 5,
        });
      } catch (error) {
        expect(error.message).toEqual('Timeout');
        expect(widget.$dependencies.fetch).toHaveBeenCalled();
      }
    });
  });

  describe('API response', () => {
    beforeEach(() => {
      widget.$dependencies.fetch = jest.fn(() => Promise.resolve(Response));
    });

    it('should add parsed body to response', async () => {
      const { response } = await widget.http.request({
        path: '/path',
      });

      expect(response.body).toMatchInlineSnapshot(`
        Object {
          "message": "text",
        }
      `);
    });

    it('should intercept request and return response from request transformer', async () => {
      const { response } = await widget.http.request({
        path: '/path',
        cache: true,
      });
      const { response: cachedResponse } = await widget.http.request({
        path: '/path',
        cache: true,
      });

      expect(response).toEqual(cachedResponse);
      expect(widget.$dependencies.fetch.mock.calls.length).toEqual(1);
    });

    it('should reject promise for status code greater than 299', async () => {
      widget.$dependencies.fetch = jest.fn(() =>
        Promise.resolve({ ...Response, ...{ ok: false } })
      );

      try {
        await widget.http.request({
          path: '/path',
          cache: true,
        });
      } catch ({ response, request }) {
        expect(request.url).toMatchInlineSnapshot(
          `"http://localhost:4444/path"`
        );
        expect(response).toMatchInlineSnapshot(`
          Object {
            "body": Object {
              "message": "text",
            },
            "headers": Object {
              "get": [Function],
            },
            "ok": false,
            "redirected": undefined,
            "status": 200,
            "statusText": undefined,
            "trailers": undefined,
            "type": undefined,
            "url": undefined,
            "useFinalURL": undefined,
          }
        `);
      }
    });
  });
});
