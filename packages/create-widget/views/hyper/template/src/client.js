import hyper from 'hyperhtml';
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
      bind: hyper.bind,
      wire: hyper.wire,
    },
    mount(widget) {
      widget.$external.render = {};

      return mapViews(widget, ({ View, containerSelector, container }) => {
        widget.$external.render[containerSelector] = widget.$dependencies.bind(
          container
        );

        View(widget.$external.render[containerSelector]);
      });
    },
    unmount(widget) {
      mapViews(widget, ({ container }) => {
        container.innerHTML = '';
      });
    },
    update(widget) {
      mapViews(widget, ({ View, containerSelector }) => {
        View(widget.$external.render[containerSelector]);
      });
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
