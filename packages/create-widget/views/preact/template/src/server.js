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
      const { View, slots = {}, ...restView } = await viewFactory(widget);

      return {
        ...restView,
        html: widget.$dependencies.render(View(widget)),
        slots: Object.keys(slots).reduce((acc, cur) => {
          acc[cur] = {
            ...slots[cur],
            html: widget.$dependencies.render(slots[cur].View(widget)),
          };

          return acc;
        }, {}),
      };
    },
  });
}
