import { render, hydrate } from 'preact';
import { unmountComponentAtNode } from 'preact/compat';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { widgetProperties } from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render,
      hydrate,
      unmountComponentAtNode,
    },
    mount(widget) {
      const View = widget.View();
      const container = document.querySelector(widget.props.containerSelector);

      if (container && container.children.length) {
        return widget.$dependencies.hydrate(View, container);
      }

      return widget.$dependencies.render(View, container);
    },
    unmount(widget) {
      const container = document.querySelector(widget.props.containerSelector);

      return widget.$dependencies.unmountComponentAtNode(container);
    },
    update(widget) {
      const View = widget.View();
      const container = document.querySelector(widget.props.containerSelector);

      return widget.$dependencies.render(View, container);
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
