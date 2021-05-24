import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      const { View, slots = {} } = await viewFactory(widget);

      return {
        html: View(widget),
        slots: Object.keys(slots).reduce((acc, cur) => {
          acc[cur] = {
            name: slots[cur].name,
            html: slots[cur].View(widget),
          };

          return acc;
        }, {}),
      };
    },
  });
}
