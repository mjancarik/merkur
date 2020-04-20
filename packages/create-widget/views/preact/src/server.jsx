import render from 'preact-render-to-string';
import { createMerkurWidget } from '@merkur/core';
import { widgetProperties } from './widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetParams,
    ...widgetProperties,
    $dependencies: {
      render,
    },
    mount(widget) {
      const View = widget.View();

      return widget.$dependencies.render(View);
    },
  });
}
