async function mapViews(widget, factoryFn, callback) {
  const { View, slot = {} } = await factoryFn(widget);
  const { containerSelector } = widget;

  // Add container selectors defined on widget instance after creation
  Object.keys(widget.slot).forEach((slotName) => {
    slot[slotName].isSlot = true;
    slot[slotName].containerSelector = widget.slot[slotName].containerSelector;
  });

  return [
    { View, containerSelector, isSlot: false },
    ...Object.values(slot),
  ].map(({ View, containerSelector, isSlot }) => {
    callback({
      View,
      isSlot,
      containerSelector,
      container:
        containerSelector && document?.querySelector(containerSelector),
    });
  });
}

export { mapViews };
