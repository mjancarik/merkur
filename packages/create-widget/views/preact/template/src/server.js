import render from 'preact-render-to-string';

import { createMerkurWidget } from '@merkur/core';

import { viewFactory } from './views/View';
import widgetProperties from './widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      render,
    },
    async mount(widget) {
      const { View, slot = {} } = await viewFactory(widget);

      return {
        html: widget.$dependencies.render(View(widget)),
        slot: Object.keys(slot).reduce((acc, cur) => {
          acc[cur] = {
            name: slot[cur].name,
            html: widget.$dependencies.render(slot[cur].View(widget)),
          };

          return acc;
        }, {}),
      };
    },
  });
}
