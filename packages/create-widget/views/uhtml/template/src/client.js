import { render, html } from 'uhtml';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';
import style from './style.css'; // eslint-disable-line no-unused-vars

async function mapViews(widget, callback) {
  const { View, slots = {} } = await viewFactory(widget);
  const { containerSelector } = widget;

  // Update new slot container selectors
  Object.keys(widget.slots).forEach((slotName) => {
    slots[slotName].containerSelector =
      widget.slots[slotName].containerSelector;
  });

  return [{ View, containerSelector }, ...Object.values(slots)].map(
    ({ View, containerSelector }) => {
      callback({
        View,
        containerSelector,
        container:
          containerSelector && document.querySelector(containerSelector),
      });
    }
  );
}

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render,
      html,
    },
    async mount(widget) {
      return mapViews(
        widget,
        ({ View, container }) =>
          container && widget.$dependencies.render(container, View(widget))
      );
    },
    async unmount(widget) {
      return mapViews(
        widget,
        ({ container }) =>
          container &&
          widget.$dependencies.render(container, widget.$dependencies.html``)
      );
    },
    async update(widget) {
      return mapViews(
        widget,
        ({ View, container }) =>
          container && widget.$dependencies.render(container, View(widget))
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
