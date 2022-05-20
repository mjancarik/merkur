/* eslint-disable no-unused-vars */

export interface WidgetInternal {}
export interface WidgetExternal {}

export interface Widget {
  name: string;
  version: string;
  $in: WidgetInternal;
  $external: WidgetExternal;
  $dependencies: Record<string, any>;
  $plugins: Record<string, any>[];

  create: any;
  setup: any;
}

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

  register: ({
    name,
    version,
    createWidget,
  }: {
    name: string;
    version: string;
    createWidget: CreateWidget;
  }) => void;

  create: CreateWidget;
}
