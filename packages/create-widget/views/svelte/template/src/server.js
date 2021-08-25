import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/viewFactory';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      const { View, slot = {} } = await viewFactory(widget);
      const renderParams = {
        widget,
        state: widget.state,
        props: widget.props,
      };

      return {
        html: View.render(renderParams)?.html,
        slot: Object.keys(slot).reduce((acc, cur) => {
          acc[cur] = {
            name: slot[cur].name,
            html: slot[cur].View.render(renderParams)?.html,
          };

          return acc;
        }, {}),
      };
    },
  });
}
