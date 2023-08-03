import { render, hydrate } from 'preact';

import { createMerkur, createMerkurWidget } from '@merkur/core';
import {
  FactoryProperties,
  MapViewArgs,
  Widget,
  WidgetProperties,
} from '../types';

export async function mapViews(
  widget: Widget,
  factoryFn,
  callback: (viewArgs: MapViewArgs) => void
) {
  const { View, slot = {}, ...rest } = await factoryFn(widget);
  const { containerSelector } = widget;

  // Add container selectors defined on widget instance after creation
  Object.keys(widget.slot).forEach((slotName) => {
    slot[slotName].isSlot = true;
    slot[slotName].containerSelector = widget.slot[slotName].containerSelector;
  });

  const views = [
    { View, containerSelector, isSlot: false, ...rest },
    ...Object.values(slot),
  ] as Omit<MapViewArgs, 'container'>[];

  return views.map(({ containerSelector, ...rest }) => {
    callback({
      containerSelector,
      container:
        (containerSelector && document?.querySelector(containerSelector)) ||
        null,
      ...rest,
    });
  });
}

export function createPreactWidget({
  name,
  version,
  $dependencies,
  mount,
  unmount,
  update,
  shouldHydrate,
  viewFactory,
  ...restProps
}: WidgetProperties & FactoryProperties) {
  const factory = {
    shouldHydrate(_, { container, isSlot }) {
      return container?.children?.length && !isSlot;
    },
    async mount(widget) {
      return mapViews(widget, viewFactory, ({ View, container, ...rest }) => {
        if (!container) {
          return null;
        }

        return (
          widget.shouldHydrate(widget, { View, container, ...rest })
            ? widget.$dependencies.hydrate
            : widget.$dependencies.render
        )(View(widget), container);
      });
    },
    async unmount(widget) {
      mapViews(widget, viewFactory, ({ container }) => {
        if (container) {
          widget.$dependencies.render(null, container);
        }
      });
    },
    async update(widget) {
      return mapViews(
        widget,
        viewFactory,
        ({ View, container }) =>
          container && widget.$dependencies.render(View(widget), container)
      );
    },
  };

  // Create new widget factory function
  const widgetFactory = (widgetParams) =>
    createMerkurWidget({
      ...restProps,
      ...widgetParams,
      $dependencies: {
        ...$dependencies,
        render,
        hydrate,
      },
      shouldHydrate: shouldHydrate?.bind(factory) ?? factory.shouldHydrate,
      mount: mount?.bind(factory) ?? factory.mount,
      unmount: unmount?.bind(factory) ?? factory.unmount,
      update: update?.bind(factory) ?? factory.update,
    });

  // Register widget factory on client
  createMerkur().register({
    name,
    version,
    createWidget: widgetFactory,
  });

  return widgetFactory;
}
