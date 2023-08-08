import render from 'preact-render-to-string';

import {
  SSRMountResult,
  ViewType,
  WidgetParams,
  createMerkurWidget,
  createWidgetDefinition,
} from '@merkur/core';

/**
 * Server Factory for creating merkur widgets with preact renderer.
 */
export function createPreactWidget({
  viewFactory,
  $dependencies,
  ...restProps
}: Parameters<typeof createWidgetDefinition>[0]) {
  return (widgetParams: WidgetParams) =>
    createMerkurWidget({
      ...restProps,
      ...widgetParams,
      $dependencies: {
        ...$dependencies,
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
        const renderView = (View: ViewType) => {
          // @ts-expect-error the @merkur/plugin-error is optional
          if (widget?.error?.status && ErrorView) {
            return render(ErrorView(widget));
          }

          // @ts-expect-error the @merkur/plugin-error is optional
          if (widget?.error?.status) {
            return render(null);
          }

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
