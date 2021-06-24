declare global {
  interface GlobalContext {
    __merkur__: Merkur;
  }
}

export type AnyFn = (...args: unknown[]) => unknown;
export type AnyObj = Record<string, unknown>;
// export type Widget = AnyObj; // TODO

export type RegisterFunction = ({
  name,
  version,
  createWidget,
}: {
  name: string;
  version: string;
  createWidget: CreateFunction;
}) => void;

export type Plugin = {
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
  $plugins: Array<() => Plugin>;
  register?: RegisterFunction;
  create: WidgetFunction;
};

export type Widget = WidgetProperties &
  Omit<Merkur, '$plugins'> & {
    setup: WidgetFunction;
    $plugins: Plugin[];
  };

export type WidgetDefintition = Omit<Widget, '$plugins'> & Merkur;

export type WidgetFunction = (
  widget: Widget,
  ...args: unknown[]
) => Promise<Widget>;

export type CreateFunction = (
  widgetProperties: WidgetProperties,
  ...args: unknown[]
) => Promise<Widget>;
