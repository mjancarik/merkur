export type ViewType = (widget: Widget) => any;

export interface BaseWidgetAsset {
  type: 'stylesheet' | 'script' | 'inlineStyle';
  optional?: boolean;
  test?: string;
  attr?: Record<string, string | boolean>;
}
export interface WidgetAsset extends BaseWidgetAsset {
  name: string;
}

export interface SourceAsset extends BaseWidgetAsset {
  source: string;
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

export interface WidgetDefinition {
  assets: (WidgetAsset | SourceAsset)[];
  $plugins?: Array<() => WidgetPlugin>;
  $external: WidgetExternal;
  $dependencies: Record<string, any>;
  create?: WidgetFunction;
  setup?: WidgetFunction;
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

export type MerkurCreate = (
  widgetProperties: WidgetProperties,
) => Promise<Widget>;

export type WidgetCreate = (widgetParams: WidgetParams) => Promise<Widget>;

export interface Merkur {
  $in: {
    widgets: []; // TODO
    widgetFactory: Record<string, MerkurCreate>;
  };
  $external: Record<string, any>;
  $dependencies: Record<string, any>;
  create: MerkurCreate;
  register: ({
    name,
    version,
    createWidget,
  }: {
    name: string;
    version: string;
    createWidget: WidgetCreate;
  }) => void;
}

/**
 * Merkur API types
 */
export interface CreateMerkurWidgetArgs {}
export declare function createMerkurWidget<
  T extends WidgetDefinition & CreateMerkurWidgetArgs,
>(widgetDefinition: T): Widget;

export interface DefineWidgetArgs {}
export declare function defineWidget<
  T extends WidgetDefinition & WidgetProperties & DefineWidgetArgs,
>(widgetDefinition: T): T;

export type SlotDefinition = { name: string; View: ViewType };
export declare function defineSlot(params: SlotDefinition);

export type ViewDefinition = {
  View: ViewType;
  ErrorView?: ViewType;
  slotFactories: (widget: Widget) => SlotDefinition | Promise<SlotDefinition>;
};

export type ViewFactorySlotType = { name: string; View: ViewType };
export type ViewFactory = (widget: Widget) => Promise<{
  View: ViewType;
  ErrorView?: ViewType;
  slot?: Record<string, ViewFactorySlotType>;
}>;

export declare function createViewFactory(params: ViewDefinition): ViewFactory;

export declare function createMerkur(): Merkur;
export declare function hookMethod(
  widget: Widget,
  path: string,
  handler: (widget: Widget, originalFunction: any, ...args: any[]) => any,
): Promise<void>;
