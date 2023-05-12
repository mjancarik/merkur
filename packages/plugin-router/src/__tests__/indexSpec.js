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
      {
        "$dependencies": {},
        "$external": {},
        "$in": {
          "component": {
            "isHydrated": false,
            "isMounted": false,
            "lifeCycle": {
              "bootstrap": undefined,
              "info": undefined,
              "load": [Function],
              "mount": undefined,
              "unmount": undefined,
              "update": undefined,
            },
            "suspendedTasks": [],
          },
          "eventEmitter": {
            "event": {},
          },
          "router": {
            "isBootstrapCalled": false,
            "isMounting": false,
            "isRouteActivated": false,
            "pathname": null,
            "route": null,
          },
        },
        "$plugins": [
          {
            "create": [Function],
            "setup": [Function],
          },
          {
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
        "emit": [Function],
        "info": [Function],
        "load": [Function],
        "mount": [Function],
        "name": "my-widget",
        "off": [Function],
        "on": [Function],
        "props": {
          "param": 1,
          "pathname": "/my-route",
        },
        "router": {
          "getCurrentRoute": [Function],
          "link": [Function],
          "redirect": [Function],
        },
        "setProps": [Function],
        "setState": [Function],
        "setup": [Function],
        "state": {},
        "unmount": [Function],
        "update": [Function],
        "version": "1.0.0",
      }
    `);
  });

  describe('router plugin API', () => {
    let widget = null;
    let bootstrap = jest.fn();
    let load = jest.fn(() => ({
      globalData: 'global value',
    }));
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

    let widgetProperties = {
      name: 'my-widget',
      version: '1.0.0',
      $plugins: [componentPlugin, eventEmitterPlugin, routerPlugin],
      props: {
        pathname: '/',
      },
      bootstrap,
      load,
    };

    beforeEach(async () => {
      widget = await createMerkurWidget({ ...widgetProperties });

      createRouter(widget, routes);
      jest.clearAllMocks();
    });

    it('should resolve route to home', async () => {
      await widget.mount();

      expect(widget.router.getCurrentRoute()).toEqual(homeRoute);
    });

    it('should call widget bootstrap method once', async () => {
      await widget.mount();
      await widget.mount();

      expect(bootstrap).toHaveBeenCalledTimes(1);
    });

    it('should call init method on home route', async () => {
      await widget.mount();

      expect(homeRoute.init).toHaveBeenCalledTimes(1);
    });

    it('should call load method on home route without defined global load method', async () => {
      const cloneWidgetProperties = { ...widgetProperties };
      delete cloneWidgetProperties['load'];
      widget = await createMerkurWidget(cloneWidgetProperties);
      createRouter(widget, routes);

      await widget.mount();

      expect(widget.state.page).toEqual('home');
      expect(homeRoute.load).toHaveBeenCalledTimes(1);
    });

    it('should call load method on home route', async () => {
      await widget.mount();

      expect(widget.state.page).toEqual('home');
      expect(homeRoute.load).toHaveBeenCalledTimes(1);
    });

    it('should call activate method on home route', async () => {
      await widget.mount();

      expect(homeRoute.activate).toHaveBeenCalledTimes(1);
    });

    it('should not call deactivate method on initial route', async () => {
      await widget.mount();

      expect(homeRoute.deactivate).not.toHaveBeenCalled();
    });

    it('should not call destroy method on initial route', async () => {
      await widget.mount();

      expect(homeRoute.destroy).not.toHaveBeenCalled();
    });

    it('should not call deactivate method on home route for same pathname', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/', key: 1 });

      expect(homeRoute.deactivate).not.toHaveBeenCalled();
    });

    it('should call deactivate method on home route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(homeRoute.deactivate).toHaveBeenCalledTimes(1);
    });

    it('should call destroy method on home route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(homeRoute.destroy).toHaveBeenCalledTimes(1);
    });

    it('should call destroy method on home route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(homeRoute.destroy).toHaveBeenCalledTimes(1);
    });

    it('should call init method on other route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(otherRoute.init).toHaveBeenCalledTimes(1);
    });

    it('should call load method on other route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(widget.state.page).toEqual('other');
      expect(otherRoute.load).toHaveBeenCalledTimes(1);
    });

    it('should call activate method on other route', async () => {
      await widget.mount();
      await widget.setProps({ pathname: '/other' });

      expect(otherRoute.activate).toHaveBeenCalledTimes(1);
    });
  });
});
