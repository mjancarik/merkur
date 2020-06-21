import { render, html } from 'uhtml';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { widgetProperties } from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render,
      html,
    },
    mount(widget) {
      return widget.$dependencies.render(
        document.querySelector(widget.props.containerSelector),
        widget.View()
      );
    },
    update(widget) {
      return widget.$dependencies.render(
        document.querySelector(widget.props.containerSelector),
        widget.View()
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
