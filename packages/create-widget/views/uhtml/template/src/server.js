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
      const { View, slots } = await viewFactory(widget);

      return {
        html: View(widget),
        slots: slots.map((slot) => {
          return {
            ...slot,
            html: slot.View(widget),
          };
        }),
      };
    },
  });
}
