import { createMerkurWidget } from '@merkur/core';
import { httpClientPlugin } from '../index';

describe('createWidget method with http client plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
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
              "method": "GET",
              "transformers": Array [
                Object {
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
        "name": "my-widget",
        "request": [Function],
        "setup": [Function],
        "version": "1.0.0",
      }
    `);
  });
});
