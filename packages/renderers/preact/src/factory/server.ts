import render from 'preact-render-to-string';

import {
  SSRMountResult,
  ViewType,
  WidgetDefinition,
  WidgetParams,
  createMerkurWidget,
} from '@merkur/core';
import { ViewFactory } from '../types';

/**
 * Server Factory for creating merkur widgets with preact renderer.
 */
export function createPreactWidget({
  mount,
  viewFactory,
  $dependencies,
  ...restProps
}: WidgetDefinition & { viewFactory: ViewFactory }) {
  return (widgetParams: WidgetParams) => {
    const definition: WidgetDefinition = {
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
          html: renderView(MainView(widget)),
          slot: Object.keys(slot).reduce<SSRMountResult['slot']>((acc, cur) => {
            acc[cur] = {
              name: slot[cur].name,
              html: renderView(slot[cur].View(widget)),
            };

            return acc;
          }, {}),
        };
      },
    };

    return createMerkurWidget(definition);
  };
}
