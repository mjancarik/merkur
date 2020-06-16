import { createMerkurWidget } from '@merkur/core';
import { routerPlugin, createRouter } from '../index';
import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

describe('createWidget method with router plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [componentPlugin, eventEmitterPlugin, routerPlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1,
        pathName: '/my-route',
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
              "load": [Function],
              "mount": undefined,
              "unmount": undefined,
              "update": undefined,
            },
          },
          "eventEmitter": Object {
            "event": Object {},
          },
          "router": Object {
            "isRouteActivated": false,
            "originalFunctions": Object {
              "mount": [Function],
              "unmount": [Function],
              "update": [Function],
            },
            "route": null,
          },
        },
        "$plugins": Array [
          Object {
            "create": [Function],
            "setup": [Function],
          },
          Object {
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
        "emit": [Function],
        "info": [Function],
        "load": [Function],
        "mount": [Function],
        "name": "my-widget",
        "off": [Function],
        "on": [Function],
        "props": Object {
          "param": 1,
          "pathName": "/my-route",
        },
        "router": Object {
          "getCurrentRoute": [Function],
          "link": [Function],
          "redirect": [Function],
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

  describe('router plugin API', () => {
    let widget = null;
    const routes = [
      {
        path: '/my-route',
        name: 'my-route',
        action: () => 'My route',
      },
      { path: '/other-route', name: 'other-route', action: () => 'Page Two' },
    ];

    beforeEach(async () => {
      widget = await createMerkurWidget({
        name: 'my-widget',
        version: '1.0.0',
        $plugins: [componentPlugin, eventEmitterPlugin, routerPlugin],
        props: {
          pathName: '/my-route',
        },
      });

      createRouter(widget, routes);
    });

    it('should be', async () => {
      // widget.mount();
      //
    });
  });
});
