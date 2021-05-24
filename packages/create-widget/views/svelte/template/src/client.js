import { createMerkurWidget, createMerkur } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/viewFactory';
import { mapViews } from './lib/utils';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      widget.$external.app = {};

      mapViews(
        widget,
        viewFactory,
        ({ containerSelector, container, View }) => {
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
            hydrate: !!container?.children?.length,
          });
        }
      );
    },
    async unmount(widget) {
      mapViews(widget, viewFactory, ({ containerSelector }) => {
        if (!widget.$external.app[containerSelector]) {
          return;
        }

        widget.$external.app[containerSelector].$destroy();
      });
    },
    async update(widget) {
      mapViews(widget, viewFactory, ({ containerSelector }) => {
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
