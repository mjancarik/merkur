async function mapViews(widget, factoryFn, callback) {
  const { View, slots = {} } = await factoryFn(widget);
  const { containerSelector } = widget;

  // Add container selectors defined on widget instance after creation
  Object.keys(widget.slots).forEach((slotName) => {
    slots[slotName].isSlot = true;
    slots[slotName].containerSelector =
      widget.slots[slotName].containerSelector;
  });

  return [
    { View, containerSelector, isSlot: false },
    ...Object.values(slots),
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
