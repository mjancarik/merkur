declare global {
  interface GlobalContext {
    __merkur__: Merkur;
  }
}

export type AnyFn = (...args: unknown[]) => unknown;
export type AnyObj = Record<string, unknown>;

export type RegisterFunction = ({
  name,
  version,
  createWidget,
}: {
  name: string;
  version: string;
  createWidget: CreateFunction;
}) => void;

export interface WidgetPlugin {
  setup?: (
    widget: Widget,
    widgetDefintition: WidgetDefintition
  ) => Promise<Widget>;
  create?: (widget: Widget) => Widget;
}

export type MerkurPlugin = {
  setup: (merkur: Merkur) => void;
};

export interface WidgetProperties {
  name: string;
  version: string;
}

export type Merkur = {
  $in: {
    widgets: Array<Merkur>;
    widgetFactory: Record<string, CreateFunction>;
  };
  $external: AnyObj;
  $dependencies: AnyObj;
  $plugins: Array<() => WidgetPlugin>;
  register: RegisterFunction;
  create: CreateFunction;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface $in {}
export interface Widget extends WidgetProperties {
  $in: $in;
  $external: AnyObj;
  $dependencies: AnyObj;
  $plugins: WidgetPlugin[];
  setup: WidgetFunction;
  create: WidgetFunction;
}

export interface WidgetDefintition extends WidgetProperties {
  $external: AnyObj;
  $dependencies: AnyObj;
  $plugins: Array<() => WidgetPlugin>;
  setup: WidgetFunction;
  create: WidgetFunction;
  [x: string]: unknown;
}

export type WidgetFunction = (
  widget: Widget,
  ...args: unknown[]
) => Promise<Widget>;

export type CreateFunction = (
  widgetProperties: WidgetProperties,
  ...args: unknown[]
) => Promise<Widget>;
