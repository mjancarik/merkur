import { type WidgetDefinition, type WidgetPlugin } from '@merkur/core';
import { ViewType } from '@merkur/plugin-component';

export type RouteParams = Record<string, string>;

export interface Route {
  name: string;
  path: string;
  action: (params?: RouteParams) => Pick<
    WidgetDefinition,
    'mount' | 'update' | 'unmount'
  > & {
    PageView: ViewType;
    load: () => Promise<void>;
  };
}

declare module '@merkur/core' {
  interface Widget {
    router: {
      redirect: (url: string, data?: Record<string, any>) => void;
      link: (routeName: string, data?: Record<string, any>) => string;
      getCurrentRoute: () => Route;
      getCurrentContext: () => unknown;
    };
  }

  interface WidgetPartial {
    router: {
      redirect: (
        widget: WidgetPartial,
        url: string,
        data?: Record<string, any>,
      ) => void;
      link: (
        widget: WidgetPartial,
        routeName: string,
        data?: Record<string, any>,
      ) => string;
      getCurrentRoute: (widget: WidgetPartial) => Route;
      getCurrentContext: (widget: WidgetPartial) => unknown;
    };
  }
}

declare module '@merkur/plugin-component' {
  interface WidgetProps {
    pathname: string;
  }
}

declare function routerPlugin(): WidgetPlugin;
