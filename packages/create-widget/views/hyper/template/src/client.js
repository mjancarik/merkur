import hyper from 'hyperhtml';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { viewFactory } from './views/View';
import widgetProperties from './widget';
import { mapViews } from './lib/utils';
import style from './style.css'; // eslint-disable-line no-unused-vars

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

      return mapViews(
        widget,
        viewFactory,
        ({ View, containerSelector, container }) => {
          if (!container) {
            return;
          }

          widget.$external.render[
            containerSelector
          ] = widget.$dependencies.bind(container);

          View(widget, widget.$external.render[containerSelector]);
        }
      );
    },
    unmount(widget) {
      mapViews(widget, viewFactory, ({ container }) => {
        if (!container) {
          return;
        }

        container.innerHTML = '';
      });
    },
    update(widget) {
      mapViews(
        widget,
        viewFactory,
        ({ View, containerSelector, container }) => {
          if (!container) {
            return;
          }

          View(widget, widget.$external.render[containerSelector]);
        }
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
