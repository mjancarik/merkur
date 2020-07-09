import { createMerkurWidget } from '@merkur/core';
import { widgetProperties } from './widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    mount(widget) {
      return widget.View();
    },
  });
}
