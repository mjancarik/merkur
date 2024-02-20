function mapViews(widget, factoryFn, callback) {
  if (widget.$external.resolvedViews) {
    return mapResolvedViews(widget, callback);
  }

  return factoryFn(widget).then(({ View, slot = {} }) => {
    const { containerSelector } = widget;
    // Add container selectors defined on widget instance after creation
    Object.keys(widget.slot).forEach((slotName) => {
      slot[slotName].isSlot = true;
      slot[slotName].containerSelector =
        widget.slot[slotName].containerSelector;
    });

    widget.$external.resolvedViews = [
      { View, containerSelector, isSlot: false },
      ...Object.values(slot),
    ];

    return mapResolvedViews(widget, callback);
  });
}

function mapResolvedViews(widget, callback) {
  return widget.$external.resolvedViews.map(
    ({ View, containerSelector, isSlot }) => {
      callback({
        View,
        isSlot,
        containerSelector,
        container:
          (containerSelector && document?.querySelector(containerSelector)) ||
          widget.container,
      });
    },
  );
}

export { mapViews };
