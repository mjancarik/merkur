import { render, html } from 'uhtml';

import { createMerkurWidget, createMerkur } from '@merkur/core';

import { mapViews } from './lib/utils';
import { viewFactory } from './views/View';
import widgetProperties from './widget';

import './style.css';

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render,
      html,
    },
    async mount(widget) {
      return mapViews(
        widget,
        viewFactory,
        ({ View, container }) =>
          container && widget.$dependencies.render(container, View(widget))
      );
    },
    async unmount(widget) {
      return mapViews(
        widget,
        viewFactory,
        ({ container }) =>
          container &&
          widget.$dependencies.render(container, widget.$dependencies.html``)
      );
    },
    async update(widget) {
      return mapViews(
        widget,
        viewFactory,
        ({ View, container }) =>
          container && widget.$dependencies.render(container, View(widget))
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
