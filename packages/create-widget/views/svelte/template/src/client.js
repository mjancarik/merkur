import { createMerkurWidget, createMerkur } from '@merkur/core';
import { widgetProperties } from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars
import View from './component/View.svelte'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    mount(widget) {
      widget.$external.app = new View({
        target: document.querySelector(widget.props.containerSelector),
        props: {
          widget,
          state: widget.state,
          props: widget.props,
        },
        hydrate: true,
      });
    },
    unmount(widget) {
      widget.$external.app.$destroy();
    },
    update(widget) {
      widget.$external.app.$set({
        state: widget.state,
        props: widget.props,
      });
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
