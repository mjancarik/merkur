import { ViewType, Widget } from '@merkur/core';
import { ViewFactory, ViewFactorySlotType } from '../types';

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
  const { containerSelector } = widget;
  const { View, ErrorView, slot = {} } = await viewFactory(widget);

  // Add additional slot information to slot views
  const slots = Object.keys(widget.slot).reduce<
    Exclude<MapViewArgs['slot'], undefined>
  >((acc, cur) => {
    acc[cur] = {
      ...slot[cur],
      isSlot: true,
      containerSelector: widget.slot[cur]?.containerSelector,
    };

    return acc;
  }, {});

  const views = [
    { View, ErrorView, containerSelector, isSlot: false },
    ...Object.values(slots),
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
