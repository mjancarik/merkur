import { render, hydrate } from 'preact';
import { unmountComponentAtNode } from 'preact/compat';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { viewFactory } from './views/View.jsx';
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
      render,
      hydrate,
      unmountComponentAtNode,
    },
    async mount(widget) {
      return mapViews(widget, ({ View, container }) => {
        if (!container) {
          return null;
        }

        return (container?.children?.length
          ? widget.$dependencies.hydrate
          : widget.$dependencies.render)(View(widget), container);
      });
    },
    async unmount(widget) {
      mapViews(widget, ({ container }) => {
        if (container) {
          widget.$dependencies.unmountComponentAtNode(container);
        }
      });
    },
    async update(widget) {
      return mapViews(
        widget,
        ({ View, container }) =>
          container && widget.$dependencies.render(View(widget), container)
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
