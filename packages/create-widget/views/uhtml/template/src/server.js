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
