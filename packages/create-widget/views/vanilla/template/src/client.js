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
    $dependencies: {},
    async mount(widget) {
      mapViews(widget, ({ container }) => {
        container
          .querySelector(`[data-merkur="on-increase"]`)
          ?.addEventListener('click', () => {
            widget.onClick();
          });

        container
          .querySelector(`[data-merkur="on-reset"]`)
          ?.addEventListener('click', () => {
            widget.onReset();
          });
      });
    },
    async unmount(widget) {
      mapViews(widget, ({ container }) => {
        container.innerHTML = '';
      });
    },
    async update(widget) {
      mapViews(widget, ({ container }) => {
        container.querySelector(`[data-merkur="counter"]`).innerText =
          widget.state.counter;
      });
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
