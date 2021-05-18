import { render, hydrate } from 'preact';
import { unmountComponentAtNode } from 'preact/compat';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { viewFactory } from './views/View.jsx';
import widgetProperties from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars

async function mapViews(widget, callback) {
  const { View, containerSelector, slots = [] } = await viewFactory(widget);

  return [{ View, containerSelector }, ...slots].map(
    ({ View, containerSelector }) =>
      callback({
        View,
        containerSelector,
        container: document.querySelector(containerSelector),
      })
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
      return mapViews(widget, ({ View, container }) =>
        (container && container.children.length
          ? widget.$dependencies.hydrate
          : widget.$dependencies.render)(View(widget), container)
      );
    },
    async unmount(widget) {
      mapViews(widget, ({ container }) => {
        if (container) {
          widget.$dependencies.unmountComponentAtNode(container);
        }
      });
    },
    async update(widget) {
      return mapViews(widget, ({ View, container }) =>
        widget.$dependencies.render(View(widget), container)
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
