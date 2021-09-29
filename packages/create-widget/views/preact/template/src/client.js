import { render, hydrate } from 'preact';
import { unmountComponentAtNode } from 'preact/compat';

import { createMerkurWidget, createMerkur } from '@merkur/core';

import { mapViews } from './lib/utils';
import { viewFactory } from './views/View.jsx';
import widgetProperties from './widget';

import './style.css';

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render,
      hydrate,
      unmountComponentAtNode,
    },
    async mount(widget) {
      return mapViews(widget, viewFactory, ({ View, container, isSlot }) => {
        if (!container) {
          return null;
        }

        return (
          container?.children?.length && !isSlot
            ? widget.$dependencies.hydrate
            : widget.$dependencies.render
        )(View(widget), container);
      });
    },
    async unmount(widget) {
      mapViews(widget, viewFactory, ({ container }) => {
        if (container) {
          widget.$dependencies.unmountComponentAtNode(container);
        }
      });
    },
    async update(widget) {
      return mapViews(
        widget,
        viewFactory,
        ({ View, container }) =>
          container && widget.$dependencies.render(View(widget), container)
      );
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
