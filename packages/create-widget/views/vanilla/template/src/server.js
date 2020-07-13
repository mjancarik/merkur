import { createMerkurWidget } from '@merkur/core';
import { widgetProperties } from './widget';
import View from './component/View';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    View,
    mount(widget) {
      return widget.View();
    },
  });
}
