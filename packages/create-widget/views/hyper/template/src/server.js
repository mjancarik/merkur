import viper from 'viperhtml';

import { createMerkurWidget } from '@merkur/core';

import { viewFactory } from './views/View';
import widgetProperties from './widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      bind: viper.bind,
      wire: viper.wire,
    },
    async mount(widget) {
      const { View, slot = {} } = await viewFactory(widget);
      const render = widget.$dependencies.bind(widget.state);

      return {
        html: View(widget, render).toString(),
        slot: Object.keys(slot).reduce((acc, cur) => {
          acc[cur] = {
            name: slot[cur].name,
            html: slot[cur].View(widget, render).toString(),
          };

          return acc;
        }, {}),
      };
    },
  });
}
