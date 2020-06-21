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
        pathname: '/my-route',
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
          "pathname": "/my-route",
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
    let homeRoute = {
      init: jest.fn(),
      load: jest.fn(() => ({ page: 'home' })),
      destroy: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
    };
    let otherRoute = {
      init: jest.fn(),
      load: jest.fn(() => ({ page: 'other' })),
      destroy: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
    };

    const routes = [
      {
        path: '/',
        name: 'home',
        action: () => homeRoute,
      },
      {
        path: '/other',
        name: 'other',
        action: () => otherRoute,
      },
    ];

    beforeEach(async () => {
      widget = await createMerkurWidget({
        name: 'my-widget',
        version: '1.0.0',
        $plugins: [componentPlugin, eventEmitterPlugin, routerPlugin],
        props: {
          pathname: '/',
        },
      });

      createRouter(widget, routes);
    });

    it('should resolve route to home', async () => {
      await widget.mount();

      expect(widget.router.getCurrentRoute()).toEqual(homeRoute);
    });

    it('should call init method on home route', async () => {
      await widget.mount();

      expect(homeRoute.init).toHaveBeenCalled();
    });

    it('should call load method on home route', async () => {
      await widget.mount();

      //expect(widget.state.page).toEqual('home');
      expect(homeRoute.load).toHaveBeenCalled();
    });

    it('should call activate method on home route', async () => {
      await widget.mount();

      expect(homeRoute.activate).toHaveBeenCalled();
    });

    it('should call deactivate method on home route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(homeRoute.deactivate).toHaveBeenCalled();
    });

    it('should call destroy method on home route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(homeRoute.destroy).toHaveBeenCalled();
    });

    it('should call destroy method on home route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(homeRoute.destroy).toHaveBeenCalled();
    });

    it('should call init method on other route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(otherRoute.init).toHaveBeenCalled();
    });

    it('should call load method on other route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(otherRoute.load).toHaveBeenCalled();
    });

    it('should call activate method on other route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(otherRoute.activate).toHaveBeenCalled();
    });
  });
});
