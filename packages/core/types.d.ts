export type ViewType = (widget: Widget) => any;

export interface WidgetDefinition {
  assets: WidgetAssset[];
  $plugins?: Array<() => WidgetPlugin>;
  $external: WidgetExternal;
  $dependencies: Record<string, any>;
  create?: WidgetFunction;
  setup?: WidgetFunction;
}

export interface WidgetAssset {
  name: string;
  type: 'stylesheet' | 'script' | 'inlineStyle';
  optional?: boolean;
  test?: string;
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
export declare function createMerkurWidget(
  widgetDefinition: WidgetDefinition,
): Widget;

export declare function createMerkur(): Merkur;

export interface CreateWidgetDefinitionArgs {}
export declare function createWidgetDefinition<
  T extends WidgetDefinition & WidgetProperties & CreateWidgetDefinitionArgs,
>(widgetDefinition: T): T;
