import { render, hydrate, unmountComponentAtNode } from 'react-dom';
import { createMerkurWidget, createMerkur } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View.jsx';
import { mapViews } from './lib/utils';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      hydrate,
      render,
      unmountComponentAtNode,
    },
    async mount(widget) {
      return mapViews(widget, viewFactory, ({ View, container }) => {
        if (!container) {
          return null;
        }

        return (container?.children?.length
          ? widget.$dependencies.hydrate
          : widget.$dependencies.render)(View(widget), container);
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
