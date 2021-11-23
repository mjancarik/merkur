import { createMerkurWidget } from '@merkur/core';
import { graphqlClientPlugin, setEndpointUrl } from '../index';
import { httpClientPlugin } from '@merkur/plugin-http-client';
import { componentPlugin } from '@merkur/plugin-component';

describe('createWidget method with graphql client plugin', () => {
  let widget = null;

  beforeEach(async () => {
    widget = await createMerkurWidget({
      $plugins: [componentPlugin, httpClientPlugin, graphqlClientPlugin],
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

    setEndpointUrl(widget, 'http://localhost:4444');
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
          "graphqlClient": Object {
            "endpointUrl": "http://localhost:4444",
            "entityClasses": Object {},
          },
          "httpClient": Object {
            "defaultConfig": Object {
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
        "graphql": Object {
          "request": [Function],
        },
        "http": Object {
          "request": [Function],
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
});
