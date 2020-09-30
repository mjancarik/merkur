import { bindWidgetToFunctions, hookMethod, isFunction } from '@merkur/core';

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
  REDIRECT: '@merkur/plugin-router.redirect',
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
        pathname: null,
        isMounting: false,
        isRouteActivated: false,
        isBootstrapCalled: false,
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

      hookMethod(widget, 'bootstrap', bootstrapHook);
      hookMethod(widget, 'mount', mountHook);
      hookMethod(widget, 'unmount', unmountHook);
      hookMethod(widget, 'update', updateHook);

      return widget;
    },
  };
}

function routerAPI() {
  return {
    router: {
      redirect(widget, url, openInNewTab) {
        widget.emit(ROUTER_EVENTS.REDIRECT, { url, openInNewTab });
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

async function bootstrapHook(widget, originalBootstrap, ...rest) {
  if (widget.$in.router.isBootstrapCalled) {
    return;
  }

  widget.$in.router.isBootstrapCalled = true;

  return originalBootstrap(...rest);
}

// hook Component
async function loadHook(widget, ...rest) {
  const plugin = widget.$in.router;

  if (!plugin.isMounting && widget.props.pathname !== plugin.pathname) {
    await tearDownRouterCycle(widget, ...rest);

    await setupRouterCycle(widget, ...rest);
  }

  if (!isFunction(plugin.route.load)) {
    throw new Error('The load method is mandatory.');
  }

  return plugin.route.load(widget, { route: plugin.route, args: rest });
}

// hook Component
async function mountHook(widget, originalMount, ...rest) {
  await widget.bootstrap(...rest);

  const plugin = widget.$in.router;
  if (!plugin.route) {
    await resolveRoute(widget);
    plugin.isMounting = true;
  }

  const result = await originalMount(...rest);

  if (plugin.isMounting && isFunction(plugin.route.init)) {
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

  plugin.isMounting = false;

  return result;
}

// hook Component
async function updateHook(widget, originalUpdate, ...rest) {
  const result = await originalUpdate(...rest);

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
async function unmountHook(widget, originalUnmount, ...rest) {
  const result = await originalUnmount(...rest);

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

  const route = await widget.$dependencies.router.resolve({
    pathname: widget.props.pathname,
    widget,
  });

  widget.$in.router.route = route;
  widget.$in.router.pathname = widget.props.pathname;

  return route;
}

async function setupRouterCycle(widget, ...rest) {
  const route = await resolveRoute(widget);

  if (isFunction(route.init)) {
    await route.init(widget, { route, args: rest });
  }
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

function isClient() {
  return typeof window !== 'undefined';
}
