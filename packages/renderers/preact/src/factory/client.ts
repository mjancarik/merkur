import { render, hydrate } from 'preact';

import {
  Widget,
  WidgetDefinition,
  WidgetParams,
  WidgetProperties,
  createMerkur,
  createMerkurWidget,
} from '@merkur/core';
import { mapViews } from './utils';
import { ViewFactory } from '../types';

/**
 * Factory for creating merkur widgets with preact renderer.
 */
export function createPreactWidget({
  name,
  version,
  $dependencies,
  viewFactory,
  ...restProps
}: WidgetDefinition & WidgetProperties & { viewFactory: ViewFactory }) {
  // Create new widget factory function
  const widgetFactory = (widgetParams: WidgetParams) => {
    // TODO this can be inlined when createMerkurWidget is typed properly
    const definition: WidgetDefinition = {
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
      async mount(widget: Widget) {
        mapViews(
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
      async update(widget: Widget) {
        mapViews(
          widget,
          viewFactory,
          ({ View, container }) =>
            container && widget.$dependencies.render(View(widget), container),
        );
      },
      async unmount(widget: Widget) {
        mapViews(widget, viewFactory, ({ container }) => {
          if (container) {
            widget.$dependencies.render(null, container);
          }
        });
      },
    };

    return createMerkurWidget(definition);
  };

  // Register widget factory on client
  createMerkur().register({
    name,
    version,
    createWidget: widgetFactory,
  });

  return widgetFactory;
}
