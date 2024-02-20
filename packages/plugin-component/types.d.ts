import { MapViewArgs } from './factory/utils';

export type SSRMountResult = {
  html: string;
  slot: Record<string, { name: string; html: string }>;
};

declare module '@merkur/core' {
  interface DefineWidgetArgs {
    viewFactory: ViewFactory;
  }

  interface Widget {
    shouldHydrate: (widget: Widget, viewArgs: MapViewArgs) => boolean;
    mount: (widget: Widget) => Promise<void | SSRMountResult>;
    update: (widget: Widget) => Promise<void>;
    unmount: (widget: Widget) => Promise<void>;
  }

  interface WidgetDefinition {
    shouldHydrate: (widget: Widget, viewArgs: MapViewArgs) => boolean;
    mount: (widget: Widget) => Promise<void | SSRMountResult>;
    update: (widget: Widget) => Promise<void>;
    unmount: (widget: Widget) => Promise<void>;
  }
}

export {};
