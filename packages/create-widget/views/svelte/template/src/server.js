import { createMerkurWidget } from '@merkur/core';
import { widgetProperties } from './widget';
import View from './component/View.svelte';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    mount(widget) {
      const { html } = View.render({
        widget,
        state: widget.state,
        props: widget.props,
      });

      return html;
    },
  });
}
