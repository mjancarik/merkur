import { Widget } from '@merkur/core';
import {
  ViewFactory,
  ViewFactorySlotType,
  ViewType,
} from '@merkur/plugin-component';

export type MapViewArgs = {
  View: ViewType;
  ErrorView?: ViewType;
  containerSelector: string;
  container: Element | null;
  isSlot: boolean;
  slot?: Record<
    string,
    {
      isSlot: boolean;
      containerSelector?: string;
      container?: Element;
    } & ViewFactorySlotType
  >;
};

/**
 * Utility function to iterate thorugh views returned from
 * view factory and call callback function with view arguments
 * on each them.
 */
export async function mapViews<T>(
  widget: Widget,
  viewFactory: ViewFactory,
  callback: (viewArgs: MapViewArgs) => T,
) {
  if (widget.$in.component.resolvedViews.has(viewFactory)) {
    return mapResolvedViews(
      widget.$in.component.resolvedViews.get(viewFactory) ?? [],
      callback,
    );
  }

  const { containerSelector } = widget;
  const { View, ErrorView, slot = {} } = await viewFactory(widget);

  // Add additional slot information to slot views
  const slots = Object.keys(widget.slot ?? {}).reduce<
    Exclude<MapViewArgs['slot'], undefined>
  >((acc, cur) => {
    acc[cur] = {
      ...slot[cur],
      isSlot: true,
      containerSelector: widget.slot[cur]?.containerSelector,
      container: widget.slot[cur]?.container,
    };

    return acc;
  }, {});

  const views = [
    {
      View,
      ErrorView,
      containerSelector,
      isSlot: false,
      container: widget.container,
    },
    ...Object.values(slots),
  ] as MapViewArgs[];

  widget.$in.component.resolvedViews.set(viewFactory, views);

  return mapResolvedViews(views, callback);
}

function mapResolvedViews<T>(
  views: MapViewArgs[],
  callback: (viewArgs: MapViewArgs) => T,
) {
  return views.map(({ View, containerSelector, isSlot, container }) => {
    callback({
      View,
      isSlot,
      containerSelector,
      container:
        (containerSelector && document?.querySelector(containerSelector)) ||
        container ||
        null,
    });
  });
}
