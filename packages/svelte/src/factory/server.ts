import { WidgetParams, createMerkurWidget, defineWidget } from '@merkur/core';
import { SSRMountResult, ViewType } from '@merkur/plugin-component';
import { RenderParams } from '../types';

declare module '@merkur/plugin-component' {
  interface ViewType {
    render: (params: RenderParams) => { html: string } | null;
  }
}

/**
 * Server Factory for creating merkur widgets with svelte renderer.
 */
export function createSvelteWidget({
  viewFactory,
  ...restProps
}: Parameters<typeof defineWidget>[0]) {
  return (widgetParams: WidgetParams) =>
    createMerkurWidget({
      ...restProps,
      ...widgetParams,
      async mount(widget) {
        const {
          View: MainView,
          ErrorView,
          slot = {},
        } = await viewFactory(widget);

        const renderParams: RenderParams = {
          widget,
          state: widget.state,
          props: widget.props,
        };

        /**
         * Wrapper around $dependencies.render function which
         * handles connection to ErrorView and error plugin when defined.
         */
        const renderView = (View: ViewType): string => {
          // @ts-expect-error the @merkur/plugin-error is optional
          if (widget?.error?.status && ErrorView) {
            return ErrorView.render(renderParams)?.html ?? '';
          }

          // @ts-expect-error the @merkur/plugin-error is optional
          if (widget?.error?.status) {
            return '';
          }

          return View.render(renderParams)?.html ?? '';
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
