import hyper from 'hyperhtml';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { viewFactory } from './views/View';
import widgetProperties from './widget';
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
      bind: hyper.bind,
      wire: hyper.wire,
    },
    mount(widget) {
      widget.$external.render = {};

      return mapViews(widget, ({ View, containerSelector, container }) => {
        if (!container) {
          return;
        }

        widget.$external.render[containerSelector] = widget.$dependencies.bind(
          container
        );

        View(widget, widget.$external.render[containerSelector]);
      });
    },
    unmount(widget) {
      mapViews(widget, ({ container }) => {
        if (!container) {
          return;
        }

        container.innerHTML = '';
      });
    },
    update(widget) {
      mapViews(widget, ({ View, containerSelector, container }) => {
        if (!container) {
          return;
        }

        View(widget, widget.$external.render[containerSelector]);
      });
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
