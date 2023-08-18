import { MapViewArgs } from './factory/utils';

declare module '@merkur/core' {
  type SSRMountResult = {
    html: string;
    slot: Record<string, { name: string; html: string }>;
  };

  interface DefineWidgetArgs {
    viewFactory: ViewFactory;
  }

  interface Widget {
    // TODO These should be moved to plugin-component
    shouldHydrate: (widget: Widget, viewArgs: MapViewArgs) => boolean;
    mount: (widget: Widget) => Promise<void | SSRMountResult>;
    update: (widget: Widget) => Promise<void>;
    unmount: (widget: Widget) => Promise<void>;
  }

  interface WidgetDefinition {
    // TODO These should be moved to plugin-component
    shouldHydrate: (widget: Widget, viewArgs: MapViewArgs) => boolean;
    mount: (widget: Widget) => Promise<void | SSRMountResult>;
    update: (widget: Widget) => Promise<void>;
    unmount: (widget: Widget) => Promise<void>;
  }
}
