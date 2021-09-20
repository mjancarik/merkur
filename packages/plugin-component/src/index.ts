import { setDefaultValueForUndefined } from '../../core/src/index'; //'@merkur/core';
import {
  AnyObj,
  Widget,
  WidgetPlugin,
  ComponentApi,
} from '../../core/src/types';

export function componentPlugin(): WidgetPlugin {
  return {
    async setup(widget, widgetDefinition) {
      const {
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
      };

      widget = {
        ...widgetProperties,
        ...componentAPI(),
        ...widget,
      };

      widget = setDefaultValueForUndefined(widget, ['props', 'state']);
      widget = setDefaultValueForUndefined(widget, ['assets'], []);

      return widget;
    },
    create(widget) {
      return widget;
      // @TODO bind events
    },
  };
}

async function callLifeCycleMethod(
  widget: Widget,
  methodName: string,
  args: unknown[]
): Promise<unknown> {
  const { lifeCycle } = widget.$in.component;

  if (typeof lifeCycle[methodName] === 'function') {
    return lifeCycle[methodName](widget, ...args);
  }

  return;
}

function componentAPI(): ComponentApi {
  return {
    async info(widget, ...args) {
      const { name, version, props, state, assets } = widget;
      const componentInfo =
        ((await callLifeCycleMethod(widget, 'info', args)) as AnyObj) || {};

      return {
        name,
        version,
        props,
        state,
        assets,
        ...componentInfo,
      };
    },
    async mount(widget, ...args) {
      await widget.bootstrap(...args);
      await widget.load(...args);

      const html = await callLifeCycleMethod(widget, 'mount', args);
      widget.$in.component.isMounted = true;

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

      widget.state = (await callLifeCycleMethod(
        widget,
        'load',
        args
      )) as AnyObj;
    },
    async update(widget, ...args) {
      if (!widget.$in.component.isMounted) {
        return;
      }

      return callLifeCycleMethod(widget, 'update', args);
    },
    async setState(widget, state) {
      widget.state = { ...widget.state, ...state };

      return widget.update();
    },
    async setProps(widget, props) {
      widget.props = { ...widget.props, ...props };

      if (!widget.$in.component.isMounted) {
        return;
      }

      await widget.load();
      return widget.update();
    },
  };
}
