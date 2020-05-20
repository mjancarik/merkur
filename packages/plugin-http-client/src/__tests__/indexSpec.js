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
          "fetch": [Function],
        },
        "$external": Object {
          "fetch": [Function],
        },
        "$in": Object {
          "httpClient": Object {
            "defaultConfig": Object {
              "baseUrl": "http://localhost:4444",
              "headers": Object {
                "Content-Type": "application/json",
              },
              "method": "GET",
              "query": Object {},
              "transformers": Array [
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
        "name": "my-widget",
        "request": [Function],
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
      const { request } = await widget.request({
        path: '/path',
      });

      expect(request.url).toMatchInlineSnapshot(
        `"http://localhost:4444/path?"`
      );
    });

    it('should generate new query string', async () => {
      const { request } = await widget.request({
        path: '/path',
        query: { a: 'b' },
      });

      expect(request.url).toMatchInlineSnapshot(
        `"http://localhost:4444/path?a=b"`
      );
    });

    it('should generate add query string to existing one', async () => {
      const { request } = await widget.request({
        path: '/path?c=d',
        query: { a: 'b' },
      });

      expect(request.url).toMatchInlineSnapshot(
        `"http://localhost:4444/path?c=d&a=b"`
      );
    });

    it('should send body', async () => {
      const { request } = await widget.request({
        method: 'POST',
        path: '/path?c=d',
        body: { a: 'b' },
      });

      expect(request.body).toMatchInlineSnapshot(`"{\\"a\\":\\"b\\"}"`);
    });
  });

  describe('API response', () => {
    it('should add parsed body to response', async () => {
      widget.$dependencies.fetch = jest.fn(() => Promise.resolve(Response));

      const { response } = await widget.request({
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
