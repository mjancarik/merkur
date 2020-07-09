import { render, hydrate } from 'react-dom';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { widgetProperties } from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      hydrate,
      render,
    },
    mount(widget) {
      const View = widget.View();
      const container = document.querySelector(widget.props.containerSelector);

      return widget.$dependencies.hydrate(View, container);
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
