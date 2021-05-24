import render from 'preact-render-to-string';
import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render,
    },
    async mount(widget) {
      const { View, slots = {} } = await viewFactory(widget);

      return {
        html: widget.$dependencies.render(View(widget)),
        slots: Object.keys(slots).reduce((acc, cur) => {
          acc[cur] = {
            name: slots[cur].name,
            html: widget.$dependencies.render(slots[cur].View(widget)),
          };

          return acc;
        }, {}),
      };
    },
  });
}
