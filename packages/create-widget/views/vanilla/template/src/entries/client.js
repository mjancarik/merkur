import { createMerkurWidget, createMerkur } from '@merkur/core';

import { mapViews } from '@merkur/plugin-component/helpers';
import { viewFactory } from '../views/View';
import widgetProperties from '@widget';

import '../style.css';

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
