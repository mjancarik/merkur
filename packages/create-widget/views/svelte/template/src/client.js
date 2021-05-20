import { createMerkurWidget, createMerkur } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/viewFactory';
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
    $dependencies: {},
    async mount(widget) {
      widget.$external.app = {};

      mapViews(widget, ({ containerSelector, container, View }) => {
        if (!container) {
          return;
        }

        widget.$external.app[containerSelector] = new View({
          target: document.querySelector(containerSelector),
          props: {
            widget,
            state: widget.state,
            props: widget.props,
          },
          hydrate: true,
        });
      });
    },
    async unmount(widget) {
      mapViews(widget, ({ containerSelector }) => {
        if (!widget.$external.app[containerSelector]) {
          return;
        }

        widget.$external.app[containerSelector].$destroy();
      });
    },
    async update(widget) {
      mapViews(widget, ({ containerSelector }) => {
        if (!widget.$external.app[containerSelector]) {
          return;
        }

        widget.$external.app[containerSelector].$set({
          state: widget.state,
          props: widget.props,
        });
      });
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
