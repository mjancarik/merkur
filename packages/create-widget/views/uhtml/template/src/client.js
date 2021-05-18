import { render, html } from 'uhtml';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';
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
      html,
    },
    async mount(widget) {
      return mapViews(widget, ({ View, container }) =>
        widget.$dependencies.render(container, View(widget))
      );
    },
    async unmount(widget) {
      return mapViews(widget, ({ container }) =>
        widget.$dependencies.render(container, widget.$dependencies.html``)
      );
    },
    async update(widget) {
      return mapViews(widget, ({ View, container }) =>
        widget.$dependencies.render(container, View(widget))
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
