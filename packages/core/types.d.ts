export interface BaseWidgetAsset {
  type: 'stylesheet' | 'script' | 'inlineStyle';
  optional?: boolean;
  module?: boolean;
  test?: string;
  attr?: Record<string, string | boolean>;
}
export interface WidgetAsset extends BaseWidgetAsset {
  name: string;
}

export interface SourceAsset extends BaseWidgetAsset {
  source: string;
}

export interface WidgetDependencies {}

export interface WidgetProperties {
  name: string;
  version: string;
}

// Type for the widget config object passed to `defineWidget()`
export interface WidgetDefinition {
  name: string;
  version: string;
  containerSelector?: string;
  assets?: (WidgetAsset | SourceAsset)[];
  $in?: WidgetInternal;
  $external?: WidgetExternal;
  $dependencies?: WidgetDependencies;
  $plugins?: Array<() => WidgetPlugin>;
  create?: WidgetFunction;
  setup?: WidgetFunction;
}

// Type used during initialization (setup() method etc)
export interface WidgetPartial extends WidgetDefinition {}

export interface WidgetParams {}
export interface WidgetInternal {}
export interface WidgetExternal {}

export interface WidgetPlugin {
  create?: WidgetFunction;
  setup?: WidgetFunction;
}

export type WidgetFunction = (
  widget: WidgetPartial,
  ...rest: unknown[]
) => Promise<WidgetPartial> | WidgetPartial;

export type WidgetCreate = (widgetParams: WidgetParams) => Promise<Widget>;

export interface Merkur {
  $in: {
    widgets: []; // TODO
    widgetFactory: Record<string, MerkurCreate>;
  };
  $external: WidgetExternal;
  $dependencies: WidgetDependencies;
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

// `createMerkurWidget()` binds all WidgetFunctions to the widget instance using `bindWidgetToFunctions()`
// This series of types replicates that for the typing. 
type TupleTail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type FunctionLike = (...args: any[]) => any;
type BoundWidgetFunction<T extends FunctionLike> = (...args: TupleTail<Parameters<T>>) => ReturnType<T>;
type BoundWidget<T> = {
  [K in keyof T]: T[K] extends FunctionLike ? BoundWidgetFunction<T[K]> : T[K];
}
export interface Widget extends BoundWidget<WidgetPartial> {}

export type MerkurCreate = (
  widgetProperties: WidgetProperties,
) => Promise<Widget>;

export interface DefineWidgetArgs {}
export declare function defineWidget<
  T extends WidgetDefinition & WidgetProperties & DefineWidgetArgs,
>(widgetDefinition: T): T;

export declare function createMerkur(): Merkur;
export declare function hookMethod(
  widget: Widget,
  path: string,
  handler: (widget: Widget, originalFunction: any, ...args: any[]) => any,
): Promise<void>;

