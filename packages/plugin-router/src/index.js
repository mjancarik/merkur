import {
  assignMissingKeys,
  bindWidgetToFunctions,
  setDefaultValueForUndefined,
  hookMethod,
  isFunction,
} from '@merkur/core';

import UniversalRouter from 'universal-router';
import generateUrls from 'universal-router/generateUrls';

import RouterEvents from './RouterEvents';

// Re-export for easier named import
export * from './RouterEvents';

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

export function createRouter(widget, routes, options) {
  let wrappedRoutes = routes.reduce((result, route) => {
    const clonedRoute = { ...route };

    if (isFunction(clonedRoute.action)) {
      const originAction = clonedRoute.action;
      clonedRoute.action = (...rest) => {
        // @TODO UniversalRouter don't parse query from url so context.params are only named route parameters
        // For some application can be helpful to have named route parameters and query parameters merged
        // because link method support both named parameters and query parameters
        widget.$in.router.context = rest[0];

        return originAction(...rest);
      };
    }

    result.push(clonedRoute);

    return result;
  }, []);

  widget.$dependencies.router = new UniversalRouter(wrappedRoutes, options);
  widget.$dependencies.link = generateUrls(widget.$dependencies.router, {
    stringifyQueryParams: (params) => new URLSearchParams(params).toString(),
  });
  widget.$in.router.options = options;
}

export function routerPlugin() {
  return {
    async setup(widget) {
      assignMissingKeys(widget, routerAPI());

      widget.$in.router = {
        route: null,
        context: null,
        options: {},
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
            'You must install missing plugin: npm i @merkur/plugin-component',
          );
        }

        if (!widget.$in.eventEmitter) {
          throw new Error(
            'You must install missing plugin: npm i @merkur/plugin-event-emitter',
          );
        }
      }

      widget.$in.component.lifeCycle = setDefaultValueForUndefined(
        widget.$in.component.lifeCycle,
        ['load'],
        () => {},
      );
      hookMethod(widget, '$in.component.lifeCycle.load', loadHook);
      hookMethod(widget, 'bootstrap', bootstrapHook);
      hookMethod(widget, 'mount', mountHook);
      hookMethod(widget, 'unmount', unmountHook);
      hookMethod(widget, 'update', updateHook);

      return widget;
    },
  };
}

function getOrigin(widget) {
  const { protocol, host } = widget.$in.router.options;

  if (!host) {
    return '';
  }

  if (!protocol) {
    return `//${host}`;
  }

  return `${protocol.replace(':', '').trim()}://${host.trim()}`;
}

function routerAPI() {
  return {
    router: {
      redirect(widget, url, data = {}) {
        widget.emit(RouterEvents.REDIRECT, { url, ...data });
      },
      link(widget, routeName, data = {}) {
        const origin = getOrigin(widget);
        const path = widget.$dependencies.link(routeName, data);

        if (origin && path === '/') {
          return origin;
        }

        return `${origin}${path}`;
      },
      getCurrentRoute(widget) {
        return widget.$in.router.route;
      },
      getCurrentContext(widget) {
        return widget.$in.router.context;
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
async function loadHook(widget, originalLoad, ...rest) {
  const plugin = widget.$in.router;

  if (!plugin.isMounting && widget.props.pathname !== plugin.pathname) {
    await tearDownRouterCycle(widget, ...rest);

    await setupRouterCycle(widget, ...rest);
  }

  if (!isFunction(plugin.route.load)) {
    throw new Error('The load method is mandatory.');
  }

  const globalStatePromise = isFunction(originalLoad)
    ? originalLoad(widget, ...rest)
    : Promise.resolve({});
  const routeStatePromise = plugin.route.load(widget, {
    route: plugin.route,
    context: plugin.context,
    args: rest,
    globalState: globalStatePromise,
  });

  const [globalState, routeState] = await Promise.all([
    globalStatePromise,
    routeStatePromise,
  ]);

  return { ...globalState, ...routeState };
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
    await plugin.route.init(widget, {
      route: plugin.route,
      context: plugin.context,
      args: rest,
    });
  }

  if (
    isFunction(plugin.route.activate) &&
    isClient() &&
    !plugin.isRouteActivated
  ) {
    plugin.isRouteActivated = true;
    plugin.route.activate(widget, {
      route: plugin.route,
      context: plugin.context,
      args: rest,
    });
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
    plugin.route.activate(widget, {
      route: plugin.route,
      context: plugin.context,
      args: rest,
    });
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
        'You must add calling of createRouter(widget, routes, options) to widget.setup method.',
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
  const plugin = widget.$in.router;

  if (isFunction(route.init)) {
    await route.init(widget, { route, context: plugin.context, args: rest });
  }
}

async function tearDownRouterCycle(widget, ...rest) {
  const plugin = widget.$in.router;

  const { route, isRouteActivated } = plugin;

  if (route) {
    if (isFunction(route.deactivate) && isRouteActivated === true) {
      await route.deactivate(widget, {
        route,
        context: plugin.context,
        args: rest,
      });
    }

    if (isFunction(route.destroy)) {
      await route.destroy(widget, {
        route,
        context: plugin.context,
        args: rest,
      });
    }
  }

  plugin.isRouteActivated = false;
}

function isClient() {
  return typeof window !== 'undefined';
}
