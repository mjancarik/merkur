import { renderToString } from 'react-dom/server';
import { createMerkurWidget } from '@merkur/core';
import { widgetProperties } from './widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetParams,
    ...widgetProperties,
    $dependencies: {
      render: renderToString,
    },
    mount(widget) {
      const View = widget.View();

      return widget.$dependencies.render(View);
    },
  });
}
