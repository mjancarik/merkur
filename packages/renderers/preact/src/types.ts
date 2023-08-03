export type ViewType = (widget: Widget) => any;

export interface Widget {
  name: string;
  version: string;
  containerSelector?: string;
  $in: Record<string, any>;
  $external: Record<string, any>;
  $dependencies: Record<string, any>;
  $plugins: any[];
  slot: Record<
    string,
    { name: string; View: ViewType; containerSelector: string }
  >;
}

export interface WidgetProperties {
  name: string;
  version: string;
  containerSelector?: string;
  $in: Record<string, any>;
  $external: Record<string, any>;
  $dependencies: Record<string, any>;
  $plugins: any[];
}

export type MapViewArgs = {
  View: ViewType;
  isSlot: boolean;
  containerSelector: string;
  container: Element | null;
};

export type ViewFactory = (
  widget: Widget,
  ...args: any[]
) => {
  [key: string]: any;
  View: ViewType;
  slot?: Record<string, { name: string; View: ViewType }>;
};

export interface FactoryProperties extends Widget {
  mount: (widget: Widget) => void;
  unmount: (widget: Widget) => void;
  update: (widget: Widget) => void;
  shouldHydrate: (widget: Widget, viewArgs: MapViewArgs) => void;
  viewFactory: ViewFactory;
}
