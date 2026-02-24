import {
  type Widget,
  type WidgetFunction,
  type WidgetPartial,
  type WidgetPlugin,
} from '@merkur/core';

export interface ViewType {
  (widget: WidgetPartial): any;
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
  slot: Record<
    string,
    { name: string; html: string; containerSelector?: string }
  >;
};

export interface WidgetState {}
export interface WidgetProps {}

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
  containerSelector?: string;
  View: ViewType;
}

export type ViewFactory = (widget: Widget) => Promise<ViewFactoryResult>;
export type SlotFactory = (widget: WidgetPartial) => Promise<SlotDefinition>;

export declare function createSlotFactory(
  creator: (widget: WidgetPartial) => SlotDefinition | Promise<SlotDefinition>,
): SlotFactory;

export declare function createViewFactory(
  creator: (widget: WidgetPartial) => ViewDefinition | Promise<ViewDefinition>,
): ViewFactory;

export declare function componentPlugin(): WidgetPlugin;

declare module '@merkur/core' {
  interface DefineWidgetArgs {
    viewFactory: ViewFactory;
  }

  interface Widget {}

  interface WidgetPlugin {}

  interface WidgetDefinition {
    bootstrap?: (widget: WidgetPartial) => void;
    container?: Element;
    info?: (widget: WidgetPartial) => Promise<void>;
    mount?: (widget: WidgetPartial) => Promise<void | SSRMountResult>;
    shouldHydrate?: (widget: WidgetPartial, viewArgs: MapViewArgs) => boolean;
    update?: (widget: WidgetPartial) => Promise<void>;
    unmount?: (widget: WidgetPartial) => Promise<void>;
  }

  interface RequiredWidgetKeys {
    bootstrap: unknown;
    container: unknown;
    info: unknown;
    mount: unknown;
    shouldHydrate: unknown;
    update: unknown;
    unmount: unknown;
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
    setState: (widget: WidgetPartial, newState: WidgetState) => void;
    setProps: (widget: WidgetPartial, newProps: WidgetProps) => void;
  }
  interface WidgetInternal {
    component: {
      lifeCycle: Record<string, WidgetFunction>;
      isMounted: boolean;
      isHydrated: boolean;
      suspendedTasks: Array<() => Promise<void>>;
      resolvedViews: Map<ViewFactory, MapViewArgs[]>;
    };
  }
}
