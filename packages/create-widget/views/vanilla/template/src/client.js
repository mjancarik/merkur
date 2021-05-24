import { createMerkurWidget, createMerkur } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';
import { mapViews } from './lib/utils';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      mapViews(widget, viewFactory, ({ container }) => {
        if (!container) {
          return;
        }

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
      mapViews(widget, viewFactory, ({ container }) => {
        if (!container) {
          return;
        }

        container.innerHTML = '';
      });
    },
    async update(widget) {
      mapViews(widget, viewFactory, ({ container }) => {
        if (!container) {
          return;
        }

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
