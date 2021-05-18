import { createMerkurWidget, createMerkur } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/viewFactory';
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
    $dependencies: {},
    async mount(widget) {
      widget.$external.app = {};

      mapViews(widget, ({ containerSelector, View }) => {
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
        widget.$external.app[containerSelector].$destroy();
      });
    },
    async update(widget) {
      mapViews(widget, ({ containerSelector }) => {
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
