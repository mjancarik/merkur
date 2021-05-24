import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/viewFactory';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      const { View, slots = {} } = await viewFactory(widget);
      const renderParams = {
        widget,
        state: widget.state,
        props: widget.props,
      };

      return {
        html: View.render(renderParams)?.html,
        slots: Object.keys(slots).reduce((acc, cur) => {
          acc[cur] = {
            name: slots[cur].name,
            html: slots[cur].View.render(renderParams)?.html,
          };

          return acc;
        }, {}),
      };
    },
  });
}
