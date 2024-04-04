import { render, hydrate } from 'preact';

import {
  WidgetParams,
  createMerkur,
  createMerkurWidget,
  defineWidget,
} from '@merkur/core';
import { mapViews } from '@merkur/plugin-component/helpers';

/**
 * Client Factory for creating merkur widgets with preact renderer.
 */
export function createPreactWidget({
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
        hydrate,
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

            const { render, hydrate } = widget.$dependencies;
            const renderView = widget.shouldHydrate(widget, {
              View,
              container,
              ...rest,
            })
              ? hydrate
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
            container && widget.$dependencies.render(View(widget), container),
        );
      },
      async unmount(widget) {
        await mapViews(widget, viewFactory, ({ container }) => {
          if (container) {
            widget.$dependencies.render(null, container);
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
