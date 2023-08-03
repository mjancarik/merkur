export type ViewType = (widget: Widget) => any;

export interface WidgetDefinition {
  $plugins?: Array<() => WidgetPlugin>;
  $external: WidgetExternal;
  $dependencies: Record<string, any>;
  create?: WidgetFunction;
  setup?: WidgetFunction;
}

export interface Widget {
  name: string;
  version: string;
  containerSelector?: string;
  $in: WidgetInternal;
  $external: WidgetExternal;
  $dependencies: Record<string, any>;
  $plugins: WidgetPlugin[];
  slot: Record<
    string,
    { name: string; html: string; containerSelector: string } | undefined
  >;
}

export interface WidgetProperties {
  name: string;
  version: string;
}

export interface WidgetParams {}
export interface WidgetInternal {}
export interface WidgetExternal {}

export interface WidgetPlugin {
  create?: WidgetFunction;
  setup?: WidgetFunction;
}

export type WidgetFunction = (
  widget: Partial<Widget>,
  ...rest: unknown[]
) => Promise<Partial<Widget>> | Partial<Widget>;

export type CreateWidget = (
  widgetProperties: WidgetProperties,
) => Promise<Widget>;

export interface Merkur {
  $in: {
    widgets: [];
    widgetFactory: Record<string, CreateWidget>;
  };
  $external: Record<string, any>;
  $dependencies: Record<string, any>;
  create: CreateWidget;
  register: ({
    name,
    version,
    createWidget,
  }: {
    name: string;
    version: string;
    createWidget: CreateWidget;
  }) => void;
}
