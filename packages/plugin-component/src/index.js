import { assignMissingKeys, setDefaultValueForUndefined } from '@merkur/core';

export function componentPlugin() {
  return {
    async setup(widget, widgetDefinition) {
      let {
        info,
        bootstrap,
        load,
        mount,
        unmount,
        update,
        ...widgetProperties
      } = widgetDefinition;

      const lifeCycle = {
        info,
        bootstrap,
        load,
        mount,
        unmount,
        update,
      };

      widget.$in.component = {
        lifeCycle,
        isMounted: false,
        isHydrated: false,
        suspendedTasks: [],
        resolvedViews: new Map(),
      };

      assignMissingKeys(widget, componentAPI(), widgetProperties);

      widget = setDefaultValueForUndefined(widget, ['props', 'state']);
      widget = setDefaultValueForUndefined(widget, ['assets'], []);
      widget = setDefaultValueForUndefined(widget, ['containerSelector'], null);

      return widget;
    },
    create(widget) {
      return widget;
      // @TODO bind events
    },
  };
}

async function callLifeCycleMethod(widget, methodName, args) {
  const { lifeCycle } = widget.$in.component;

  if (typeof lifeCycle[methodName] === 'function') {
    return lifeCycle[methodName](widget, ...args);
  }
}

function componentAPI() {
  return {
    async info(widget, ...args) {
      const { name, version, props, state, assets, containerSelector } = widget;
      const componentInfo =
        (await callLifeCycleMethod(widget, 'info', args)) || {};

      return {
        name,
        version,
        props,
        state,
        assets,
        containerSelector,
        ...componentInfo,
      };
    },
    async mount(widget, ...args) {
      await widget.bootstrap(...args);
      await widget.load(...args);

      const html = await callLifeCycleMethod(widget, 'mount', args);
      widget.$in.component.isMounted = true;

      for (let task of widget.$in.component.suspendedTasks) {
        await task();
      }

      return html;
    },
    async unmount(widget, ...args) {
      widget.$in.component.isMounted = false;
      widget.$in.component.isHydrated = false;

      return callLifeCycleMethod(widget, 'unmount', args);
    },
    async bootstrap(widget, ...args) {
      return callLifeCycleMethod(widget, 'bootstrap', args);
    },
    async load(widget, ...args) {
      const { $in, state } = widget;

      if (
        $in.component.isMounted === false &&
        $in.component.isHydrated === false &&
        state &&
        Object.keys(state).length !== 0
      ) {
        $in.component.isHydrated = true;
        return;
      }

      widget.state = await callLifeCycleMethod(widget, 'load', args);
    },
    async update(widget, ...args) {
      if (!widget.$in.component.isMounted) {
        widget.$in.component.suspendedTasks.push(() => widget.update(...args));
        return;
      }

      return callLifeCycleMethod(widget, 'update', args);
    },
    async setState(widget, stateSetter) {
      widget.state = {
        ...widget.state,
        ...(typeof stateSetter === 'function'
          ? stateSetter(widget.state)
          : stateSetter),
      };

      return widget.update();
    },
    async setProps(widget, propsSetter) {
      if (!widget.$in.component.isMounted) {
        widget.$in.component.suspendedTasks.push(() =>
          widget.setProps(propsSetter),
        );
        return;
      }

      widget.props = {
        ...widget.props,
        ...(typeof propsSetter === 'function'
          ? propsSetter(widget.props)
          : propsSetter),
      };

      await widget.load();
      return widget.update();
    },
  };
}

/**
 * Typed helper to make it easier to define widget properties.
 *
 * @type import('@merkur/plugin-component').createSlotFactory
 */
export function createSlotFactory(creator) {
  return async (widget) => creator(widget);
}

/**
 * Typed helper to make it easier to define widget properties.
 *
 * @type import('@merkur/plugin-component').createViewFactory
 */
export function createViewFactory(creator) {
  return async (widget) => {
    const { slotFactories, ...restParams } = await creator(widget);

    if (!slotFactories) {
      return {
        ...restParams,
      };
    }

    const slot = (
      await Promise.all(slotFactories.map((creator) => creator(widget)))
    ).reduce((acc, cur) => {
      acc[cur.name] = cur;

      return acc;
    }, {});

    return {
      ...restParams,
      slot,
    };
  };
}
