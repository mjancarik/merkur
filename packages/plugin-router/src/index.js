import { bindWidgetToFunctions } from '@merkur/core';

import UniversalRouter from 'universal-router';
import generateUrls from 'universal-router/generateUrls';

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

export function createRouter(widget, routes, options) {
  widget.$dependencies.router = new UniversalRouter(routes, options);
  widget.$dependencies.link = generateUrls(widget.$dependencies.router);
}

export const ROUTER_EVENTS = {
  REDIRECT: '@mekur/plugin-router.redirect',
};

export function routerPlugin() {
  return {
    async setup(widget) {
      widget = {
        ...routerAPI(),
        ...widget,
      };

      widget.$in.router = {
        route: null,
        isRouteActivated: false,
        originalFunctions: {},
      };

      bindWidgetToFunctions(widget, widget.router);

      return widget;
    },
    async create(widget) {
      if (ENV === DEV) {
        if (!widget.$in.component) {
          throw new Error(
            'You must install missing plugin: npm i @merkur/plugin-component'
          );
        }

        if (!widget.$in.eventEmitter) {
          throw new Error(
            'You must install missing plugin: npm i @merkur/plugin-event-emitter'
          );
        }
      }

      widget.$in.component.lifeCycle.load = loadHook;
      const { mount, unmount, update } = widget;

      widget.$in.router.originalFunctions = {
        mount,
        unmount,
        update,
      };

      widget.mount = mountHook;
      widget.unmount = unmountHook;
      widget.update = updateHook;

      return widget;
    },
  };
}

function routerAPI() {
  return {
    router: {
      redirect(widget, url) {
        widget.emit(ROUTER_EVENTS.REDIRECT, { url });
      },
      link(widget, routeName, data = {}) {
        return widget.$dependencies.link(routeName, data);
      },
      getCurrentRoute(widget) {
        return widget.$in.router.route;
      },
    },
  };
}

// hook Component
async function loadHook(widget, ...rest) {
  const plugin = widget.$in.router;

  await tearDownRouterCycle(widget, ...rest);

  await setupRouterCycle(widget, ...rest);

  if (!isFunction(plugin.route.load)) {
    throw new Error('The load method is mandatory.');
  }

  return plugin.route.load(widget, { route: plugin.route, args: rest });
}

// hook Component
async function mountHook(widget, ...rest) {
  const plugin = widget.$in.router;
  let initRoute = false;

  if (!plugin.route) {
    plugin.route = await resolveRoute(widget);
    initRoute = true;
  }

  const result = await widget.$in.router.originalFunctions.mount(
    widget,
    ...rest
  );

  if (initRoute && isFunction(plugin.route.init)) {
    await plugin.route.init(widget, { route: plugin.route, args: rest });
  }

  if (
    isFunction(plugin.route.activate) &&
    isClient() &&
    !plugin.isRouteActivated
  ) {
    plugin.isRouteActivated = true;
    plugin.route.activate(widget, { route: plugin.route, args: rest });
  }

  return result;
}

// hook Component
async function updateHook(widget, ...rest) {
  const result = await widget.$in.router.originalFunctions.update(
    widget,
    ...rest
  );

  const plugin = widget.$in.router;

  if (
    isFunction(plugin.route.activate) &&
    isClient() &&
    !plugin.isRouteActivated
  ) {
    plugin.isRouteActivated = true;
    plugin.route.activate(widget, { route: plugin.route, args: rest });
  }

  return result;
}

// hook Component
async function unmountHook(widget, ...rest) {
  const result = await widget.$in.router.originalFunctions.unmount(
    widget,
    ...rest
  );

  await tearDownRouterCycle(widget, ...rest);

  return result;
}

async function resolveRoute(widget) {
  if (ENV === DEV) {
    if (!widget.props.pathname) {
      throw new Error('The props pathname is not defined.');
    }

    if (!widget.$dependencies.router) {
      throw new Error(
        'You must add calling of createRouter(widget, routes, options) to widget.setup method.'
      );
    }
  }

  return widget.$dependencies.router.resolve({
    pathname: widget.props.pathname,
    widget,
  });
}

async function setupRouterCycle(widget, ...rest) {
  const route = await resolveRoute(widget);

  if (isFunction(route.init)) {
    await route.init(widget, { route, args: rest });
  }

  widget.$in.router.route = route;
}

async function tearDownRouterCycle(widget, ...rest) {
  const plugin = widget.$in.router;

  const { route, isRouteActivated } = plugin;

  if (route) {
    if (isFunction(route.deactivate) && isRouteActivated === true) {
      await route.deactivate(widget, { route, args: rest });
    }

    if (isFunction(route.destroy)) {
      await route.destroy(widget, { route, args: rest });
    }
  }

  plugin.isRouteActivated = false;
}

function isFunction(value) {
  return typeof value === 'function';
}

function isClient() {
  return typeof window !== 'undefined';
}
