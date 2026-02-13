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

export interface Widget {
  name: string;
  version: string;
  containerSelector?: string;
  $in: WidgetInternal;
  $external: WidgetExternal;
  $dependencies: WidgetDependencies;
  $plugins: WidgetPlugin[];
}

export interface WidgetProperties {
  name: string;
  version: string;
}

export interface WidgetDefinition {
  assets: (WidgetAsset | SourceAsset)[];
  $plugins?: Array<() => WidgetPlugin>;
  $external: WidgetExternal;
  $dependencies: WidgetDependencies;
  create?: WidgetFunction;
  setup?: WidgetFunction;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
