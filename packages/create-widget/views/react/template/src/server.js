import { renderToString } from 'react-dom/server';
import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render: renderToString,
    },
    async mount(widget) {
      const { View, slots } = await viewFactory(widget);

      return {
        html: widget.$dependencies.render(View(widget)),
        slots: slots.map((slot) => {
          return {
            ...slot,
            html: widget.$dependencies.render(slot.View(widget)),
          };
        }),
      };
    },
  });
}
