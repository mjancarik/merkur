import render from 'preact-render-to-string';

import { WidgetParams, createMerkurWidget, defineWidget } from '@merkur/core';
import { ViewType, type SSRMountResult } from '@merkur/plugin-component';

/**
 * Server Factory for creating merkur widgets with preact renderer.
 */
export function createPreactWidget({
  viewFactory,
  $dependencies,
  ...restProps
}: Parameters<typeof defineWidget>[0]) {
  return (widgetParams: WidgetParams) =>
    createMerkurWidget({
      ...restProps,
      ...widgetParams,
      $dependencies: {
        ...$dependencies,
        // @ts-expect-error conflict with client types
        render,
      },
      async mount(widget) {
        const { render } = widget.$dependencies;
        const {
          View: MainView,
          ErrorView,
          slot = {},
        } = await viewFactory(widget);

        /**
         * Wrapper around $dependencies.render function which
         * handles connection to ErrorView and error plugin when defined.
         */
        const renderView = (View: ViewType): string => {
          // @ts-expect-error the @merkur/plugin-error is optional
          if (widget?.error?.status && ErrorView) {
            // @ts-expect-error conflict with client types
            return render(ErrorView(widget));
          }

          // @ts-expect-error the @merkur/plugin-error is optional
          if (widget?.error?.status) {
            // @ts-expect-error conflict with client types
            return render(null);
          }

          // @ts-expect-error conflict with client types
          return render(View(widget));
        };

        return {
          html: renderView(MainView),
          slot: Object.keys(slot).reduce<SSRMountResult['slot']>((acc, cur) => {
            acc[cur] = {
              name: slot[cur].name,
              html: renderView(slot[cur].View),
            };

            return acc;
          }, {}),
        };
      },
    });
}
