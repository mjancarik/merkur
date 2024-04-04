import { Widget } from '@merkur/core';

export interface ViewType {
  (widget: Widget): any;
}

export type MapViewArgs = {
  View: ViewType;
  ErrorView?: ViewType;
  containerSelector: string;
  container: Element | null;
  isSlot: boolean;
  slot?: Record<
    string,
    {
      isSlot: boolean;
      containerSelector?: string;
    } & ViewFactorySlotType
  >;
};

export type SSRMountResult = {
  html: string;
  slot: Record<string, { name: string; html: string }>;
};

export interface WidgetState {}
export interface WidgetProps {}

declare module '@merkur/core' {
  interface DefineWidgetArgs {
    viewFactory: ViewFactory;
  }

  interface Widget {
    shouldHydrate: (viewArgs: MapViewArgs) => boolean;
    mount: () => Promise<void | SSRMountResult>;
    update: () => Promise<void>;
    unmount: () => Promise<void>;
    slot: Record<
      string,
      { name: string; html: string; containerSelector: string } | undefined
    >;
    state: WidgetState;
    props: WidgetProps;
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
