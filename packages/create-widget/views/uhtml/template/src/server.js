import { html } from 'ucontent';
import { createMerkurWidget } from '@merkur/core';
import { widgetProperties } from './widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      html,
    },
    mount(widget) {
      return widget.View();
    },
  });
}
