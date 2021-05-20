import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/viewFactory';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      const { View, slots = {}, ...restView } = await viewFactory(widget);
      const renderParams = {
        widget,
        state: widget.state,
        props: widget.props,
      };

      return {
        ...restView,
        html: View.render(renderParams)?.html,
        slots: Object.keys(slots).reduce((acc, cur) => {
          const { html } = slots[cur].View.render(renderParams);

          acc[cur] = {
            ...slots[cur],
            html,
          };

          return acc;
        }),
      };
    },
  });
}
