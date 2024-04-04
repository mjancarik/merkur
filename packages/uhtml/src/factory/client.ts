import { render, html } from 'uhtml';

import {
  WidgetParams,
  createMerkur,
  createMerkurWidget,
  defineWidget,
} from '@merkur/core';
import { mapViews } from '@merkur/plugin-component/helpers';

declare module '@merkur/core' {
  interface WidgetDependencies {
    render: typeof render;
    html: typeof html;
  }
}

/**
 * Client Factory for creating merkur widgets with uhtml renderer.
 */
export function createUHtmlWidget({
  name,
  version,
  $dependencies,
  viewFactory,
  ...restProps
}: Parameters<typeof defineWidget>[0]) {
  const widgetFactory = async (widgetParams: WidgetParams) =>
    createMerkurWidget({
      ...restProps,
      ...widgetParams,
      $dependencies: {
        ...$dependencies,
        render,
        html,
      },
      shouldHydrate(widget, { container, isSlot }) {
        return Boolean(container?.children?.length && !isSlot);
      },
      async mount(widget) {
        await mapViews(
          widget,
          viewFactory,
          ({ View, ErrorView, container, ...rest }) => {
            if (!container) {
              return;
            }

            const { render, html } = widget.$dependencies;
            const renderView = widget.shouldHydrate({
              View,
              ErrorView,
              container,
              ...rest,
            })
              ? html
              : render;

            // @ts-expect-error the @merkur/plugin-error is optional
            if (widget?.error?.status) {
              return ErrorView
                ? renderView(ErrorView(widget), container)
                : render(null, container);
            }

            return renderView(View(widget), container);
          },
        );
      },
      async update(widget) {
        await mapViews(
          widget,
          viewFactory,
          ({ View, container }) =>
            container && widget.$dependencies.render(container, View(widget)),
        );
      },
      async unmount(widget) {
        await mapViews(widget, viewFactory, ({ container }) => {
          if (container) {
            widget.$dependencies.render(container, widget.$dependencies.html``);
          }
        });
      },
    });

  // Register widget factory on client
  createMerkur().register({
    name,
    version,
    createWidget: widgetFactory,
  });

  return widgetFactory;
}
