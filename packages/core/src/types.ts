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

export type WidgetPlugin = {
  setup?: (merkur: Merkur, widgetDefintition: WidgetDefintition) => Widget;
  create?: (merkur: Merkur, widgetDefintition: WidgetDefintition) => Widget;
};

export type MerkurPlugin = {
  setup: (merkur: Merkur) => void;
};

export type WidgetProperties = {
  name: string;
  version: string;
};

export type Merkur = {
  $in: {
    widgets: Array<Merkur>;
    widgetFactory: Record<string, CreateFunction>;
  };
  $external: AnyObj;
  $dependencies: AnyObj;
  $plugins: Array<() => WidgetPlugin>;
  register: RegisterFunction;
  create: WidgetFunction;
};

export type Widget = WidgetProperties & {
  $in: AnyObj;
  $external: AnyObj;
  $dependencies: AnyObj;
  $plugins: WidgetPlugin[];
  setup: WidgetFunction;
  create: WidgetFunction;
};

export type WidgetDefintition = WidgetProperties & {
  $external: AnyObj;
  $dependencies: AnyObj;
  $plugins: Array<() => WidgetPlugin>;
  setup: WidgetFunction;
  create: WidgetFunction;
};

export type WidgetFunction = (
  widget: Widget,
  ...args: unknown[]
) => Promise<Widget>;

export type CreateFunction = (
  widgetProperties: WidgetProperties,
  ...args: unknown[]
) => Promise<Widget>;
