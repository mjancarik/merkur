import { html } from 'ucontent';
import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      html,
    },
    async mount(widget) {
      const { View, slots = {}, ...restView } = await viewFactory(widget);

      return {
        ...restView,
        html: View(widget),
        slots: Object.keys(slots).reduce((acc, cur) => {
          acc[cur] = {
            ...slots[cur],
            html: slots[cur].View(widget),
          };

          return acc;
        }, {}),
      };
    },
  });
}
