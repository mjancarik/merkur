/**
 * Utility function to iterate thorugh views returned from
 * view factory and call callback function with view arguments
 * on each them.
 */
export async function mapViews(widget, viewFactory, callback) {
  if (widget.$in.component.resolvedViews.has(viewFactory)) {
    return mapResolvedViews(
      widget.$in.component.resolvedViews.get(viewFactory) ?? [],
      callback,
    );
  }

  const { containerSelector } = widget;
  const { View, ErrorView, slot = {} } = await viewFactory(widget);

  // Add additional slot information to slot views
  const slots = Object.keys(widget.slot ?? {}).reduce((acc, cur) => {
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
  ];

  widget.$in.component.resolvedViews.set(viewFactory, views);

  return mapResolvedViews(views, callback);
}

function mapResolvedViews(views, callback) {
  return views.map(
    ({ View, ErrorView, containerSelector, isSlot, container }) => {
      callback({
        View,
        ErrorView,
        isSlot,
        containerSelector,
        container:
          (containerSelector && document?.querySelector(containerSelector)) ||
          container ||
          null,
      });
    },
  );
}
