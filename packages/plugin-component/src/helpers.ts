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
  // if (widget.$in?.component?.resolvedViews?.has(viewFactory)) {
  //   return mapResolvedViews(widget, callback);
  // }

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
    { View, ErrorView, containerSelector, isSlot: false },
    ...Object.values(slots),
  ] as Omit<MapViewArgs, 'container'>[];

  return views.map(({ containerSelector, ...rest }) => {
    callback({
      containerSelector,
      container:
        (containerSelector && document?.querySelector(containerSelector)) ||
        widget?.container ||
        null,
      ...rest,
    });
  });
}

// function mapViews(widget, factoryFn, callback) {
//   if (widget.$external.resolvedViews) {
//     return mapResolvedViews(widget, callback);
//   }

//   return factoryFn(widget).then(({ View, slot = {} }) => {
//     const { containerSelector } = widget;
//     // Add container selectors defined on widget instance after creation
//     Object.keys(widget.slot).forEach((slotName) => {
//       slot[slotName].isSlot = true;
//       slot[slotName].containerSelector =
//         widget.slot[slotName].containerSelector;
//     });

//     widget.$external.resolvedViews = [
//       { View, containerSelector, isSlot: false },
//       ...Object.values(slot),
//     ];

//     return mapResolvedViews(widget, callback);
//   });
// }

// function mapResolvedViews(widget, callback) {
//   return widget.$external.resolvedViews.map(
//     ({ View, containerSelector, isSlot }) => {
//       callback({
//         View,
//         isSlot,
//         containerSelector,
//         container:
//           (containerSelector && document?.querySelector(containerSelector)) ||
//           widget.container,
//       });
//     },
//   );
// }
