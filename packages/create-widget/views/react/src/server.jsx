import { renderToString } from 'react-dom/server';
import { createWidget as createMerkuWidget } from '@merkur/core';
import { widgetProperties } from './widget';

export function createWidget(widgetParams) {
  return createMerkuWidget({
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
