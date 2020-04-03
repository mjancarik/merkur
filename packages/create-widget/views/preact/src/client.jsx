import { render } from 'preact';
import { createWidget as createMerkuWidget, createMerkur } from '@merkur/core';
import { widgetProperties } from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkuWidget({
    ...widgetParams,
    ...widgetProperties,
    $dependencies: {
      render,
    },
    mount(widget) {
      const View = widget.View();
      const container = document.getElementById(widget.container);

      return widget.$dependencies.render(View, container);
    },
    update(widget) {
      const View = widget.View();
      const container = document.getElementById(widget.container);

      return widget.$dependencies.render(View, container);
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
