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
    slot: Record<
      string,
      { name: string; html: string; containerSelector: string } | undefined
    >;
  }

  interface WidgetDefinition {
    shouldHydrate: (widget: Widget, viewArgs: MapViewArgs) => boolean;
    mount: (widget: Widget) => Promise<void | SSRMountResult>;
    update: (widget: Widget) => Promise<void>;
    unmount: (widget: Widget) => Promise<void>;
  }
}

export interface SlotDefinition {
  name: string;
  View: ViewType;
}

export interface ViewDefinition {
  View: ViewType;
  ErrorView?: ViewType;
  slotFactories: ((
    widget: Widget,
  ) => SlotDefinition | Promise<SlotDefinition>)[];
}

export interface ViewFactoryResult {
  View: ViewType;
  ErrorView?: ViewType;
  slot?: Record<string, ViewFactorySlotType>;
}

export interface ViewFactorySlotType {
  name: string;
  View: ViewType;
}

export type ViewFactory = (widget: Widget) => Promise<ViewFactoryResult>;
export type SlotFactory = (widget: Widget) => Promise<SlotDefinition>;

export declare function createSlotFactory(
  creator: (widget: Widget) => SlotDefinition | Promise<SlotDefinition>,
): SlotFactory;

export declare function createViewFactory(
  creator: (widget: Widget) => ViewDefinition | Promise<ViewDefinition>,
): ViewFactory;

export declare function componentPlugin();
