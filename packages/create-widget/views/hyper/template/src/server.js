import viper from 'viperhtml';
import { createMerkurWidget } from '@merkur/core';
import widgetProperties from './widget';
import { viewFactory } from './views/View';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      bind: viper.bind,
      wire: viper.wire,
    },
    async mount(widget) {
      const { View, slots = {} } = await viewFactory(widget);
      const render = widget.$dependencies.bind(widget.state);

      return {
        html: View(widget, render).toString(),
        slots: Object.keys(slots).reduce((acc, cur) => {
          acc[cur] = {
            name: slots[cur].name,
            html: slots[cur].View(widget, render).toString(),
          };

          return acc;
        }, {}),
      };
    },
  });
}
