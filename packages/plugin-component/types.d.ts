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
      container?: Element;
    } & ViewFactorySlotType
  >;
};

export type SSRMountResult = {
  html: string;
  slot: Record<string, { name: string; html: string, containerSelector?: string }>;
};

export interface WidgetState {}
export interface WidgetProps {}

declare module '@merkur/core' {
  interface DefineWidgetArgs {
    viewFactory: ViewFactory;
  }

  interface WidgetDefinition {    
    container?: Element;
    shouldHydrate?: (widget: Widget, viewArgs: MapViewArgs) => boolean;
    mount?: (widget: Widget) => Promise<void | SSRMountResult>;
    update?: (widget: Widget) => Promise<void>;
    unmount?: (widget: Widget) => Promise<void>;
  }

  interface WidgetPartial {
      slot: Record<
      string,
      | {
          name: string;
          html: string;
          containerSelector: string;
          container?: Element;
        }
      | undefined
    >;
    state: WidgetState;
    props: WidgetProps;
  }
  interface WidgetInternal {
    component: {
      lifeCycle: Record<string, Function>;
      isMounted: boolean;
      isHydrated: boolean;
      suspendedTasks: Array<Function>;
      resolvedViews: Map<ViewFactory, MapViewArgs[]>;
    };
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
  containerSelector?: string, 
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

export declare function componentPlugin(): WidgetPlugin;
