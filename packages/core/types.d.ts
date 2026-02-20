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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
  $external?: WidgetExternal;
  $dependencies?: WidgetDependencies;
  $plugins?: Array<() => WidgetPlugin>;
  create?: WidgetFunction;
  setup?: WidgetFunction;
}

// Type used during initialization within `createMerkurWidget()`
// it initializes some properties (= they're not optional anymore)

export interface WidgetPartial extends WidgetDefinition, Required<Pick<WidgetDefinition, '$dependencies' | '$external' | 'create' | 'setup'>> {
  $in: WidgetInternal;
  slot: Record<any, any>; // @merkur/core knows (incorrectly?) about slot and initializes it to an empty object.
}

export interface WidgetParams {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WidgetInternal {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

export declare function assignMissingKeys<T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T;

export declare function setDefaultValueForUndefined<T extends object>(
  object: T,
  keys: (keyof T)[],
  value?: any,
): T;

export declare function bindWidgetToFunctions(
  widget: Widget,
  target?: any,
): void;

export declare function isFunction(
  value: any,
): value is (...args: any[]) => any;

export declare function isUndefined(value: any): value is undefined;

export declare function getMerkur(): Merkur;
export declare function removeMerkur(): void;
