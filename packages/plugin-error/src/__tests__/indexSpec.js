import { createMerkurWidget } from '@merkur/core';
import { errorPlugin, setErrorInfo } from '../index';
import { componentPlugin } from '@merkur/plugin-component';

describe('createWidget method with error plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [componentPlugin, errorPlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1,
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
        "$dependencies": Object {},
        "$external": Object {},
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
          "error": Object {
            "originalFunctions": Object {
              "info": [Function],
              "load": [Function],
              "mount": [Function],
              "update": [Function],
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
        ],
        "assets": Array [
          Object {
            "source": "http://www.example.com/static/1.0.0/widget.js",
            "type": "script",
          },
        ],
        "bootstrap": [Function],
        "create": [Function],
        "error": Object {
          "message": null,
          "status": null,
        },
        "info": [Function],
        "load": [Function],
        "mount": [Function],
        "name": "my-widget",
        "props": Object {
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

describe('setErrorInfo', () => {
  const error = new Error('ERROR MESSAGE');
  error.status = 123;

  let widgetMock;

  beforeEach(() => {
    widgetMock = {
      error: {},
    };
  });

  it('should set error info on widget', () => {
    const expectedObject = {
      message: 'ERROR MESSAGE',
      status: 123,
    };

    try {
      throw error;
    } catch (err) {
      setErrorInfo(widgetMock, err);

      expect(widgetMock.error).toMatchObject(expectedObject);
    }
  });
});
