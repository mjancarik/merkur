import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/viewFactory';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      const { View, slots } = await viewFactory(widget);
      const renderParams = {
        widget,
        state: widget.state,
        props: widget.props,
      };

      return {
        html: View.render(renderParams)?.html,
        slots: slots.map((slot) => {
          const { html } = slot.View.render(renderParams);

          return {
            ...slot,
            html,
          };
        }),
      };
    },
  });
}
