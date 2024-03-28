import { createMerkurWidget } from '@merkur/core';

import { viewFactory } from '../views/View';
import widgetProperties from '@widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    async mount(widget) {
      const { View, slot = {} } = await viewFactory(widget);

      return {
        html: View(widget),
        slot: Object.keys(slot).reduce((acc, cur) => {
          acc[cur] = {
            name: slot[cur].name,
            html: slot[cur].View(widget),
          };

          return acc;
        }, {}),
      };
    },
  });
}
