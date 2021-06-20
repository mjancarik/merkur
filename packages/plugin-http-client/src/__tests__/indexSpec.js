import { createMerkurWidget } from '@merkur/core';
import { httpClientPlugin, setDefaultConfig } from '../index';

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

    setDefaultConfig(widget, {
      baseUrl: 'http://localhost:4444',
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
            "defaultConfig": Object {
              "baseUrl": "http://localhost:4444",
              "headers": Object {},
              "method": "GET",
              "query": Object {},
              "timeout": 15000,
              "transformers": Array [
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
    it('should add parsed body to response', async () => {
      widget.$dependencies.fetch = jest.fn(() => Promise.resolve(Response));

      const { response } = await widget.http.request({
        path: '/path',
      });

      expect(response.body).toMatchInlineSnapshot(`
        Object {
          "message": "text",
        }
      `);
    });
  });
});
