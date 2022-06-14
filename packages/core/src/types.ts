/* eslint-disable no-unused-vars */

export interface WidgetDefinition {
  name: string;
  version: string;
  $plugins?: Array<() => WidgetPlugin>;
  $external: WidgetExternal;
  $dependencies: Record<string, any>;

  create?: WidgetFunction;
  setup?: WidgetFunction;
}

export interface Widget {
  name: string;
  version: string;
  $in: WidgetInternal;
  $external: WidgetExternal;
  $dependencies: Record<string, any>;
  $plugins: WidgetPlugin[];
}

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

export interface WidgetProperties {
  name: string;
  version: string;
}

export type CreateWidget = (
  widgetProperties: WidgetProperties
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
