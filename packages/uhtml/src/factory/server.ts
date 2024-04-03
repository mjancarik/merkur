import { html } from 'ucontent';

import {
  ViewType,
  WidgetParams,
  createMerkurWidget,
  defineWidget,
} from '@merkur/core';
import { SSRMountResult } from '@merkur/plugin-component';

/**
 * Server Factory for creating merkur widgets with uhtml renderer.
 */
export function createUhtmlWidget({
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
        html,
      },
      async mount(widget) {
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
            return ErrorView(widget);
          }

          // @ts-expect-error the @merkur/plugin-error is optional
          if (widget?.error?.status) {
            return null;
          }

          return View(widget);
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
