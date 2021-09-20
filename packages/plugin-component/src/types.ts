import { WidgetPlugin } from '../../core/src/types';

declare module '../../core/src/types' {
  interface Widget {
    props: AnyObj;
    state: AnyObj;
    assets: AnyObj[];
    info: (...args: unknown[]) => unknown; // todo
    bootstrap: (...args: unknown[]) => unknown;
    load: (...args: unknown[]) => void;
    mount: (...args: unknown[]) => unknown;
    unmount: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
  }

  interface $in {
    component: Component;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface WidgetDefintition extends LifeCycle {}

  export type LifeCycle = {
    info: (widget: Widget, ...args: unknown[]) => unknown; // todo
    bootstrap: (widget: Widget, ...args: unknown[]) => unknown;
    load: (widget: Widget, ...args: unknown[]) => void;
    mount: (widget: Widget, ...args: unknown[]) => unknown;
    unmount: (widget: Widget, ...args: unknown[]) => unknown;
    update: (widget: Widget, ...args: unknown[]) => unknown;
  };

  export type ComponentApi = LifeCycle & {
    setProps: (widget: Widget, props: AnyObj) => unknown;
    setState: (widget: Widget, state: AnyObj) => unknown;
  };

  export interface ComponentPlugin extends WidgetPlugin {
    setup: (
      widget: Widget,
      widgetDefinition: WidgetDefintition
    ) => Promise<Widget>;
    create: (widget: Widget) => Widget;
  }

  export type Component = {
    lifeCycle: LifeCycle;
    isMounted: boolean;
    isHydrated: boolean;
  };
}
