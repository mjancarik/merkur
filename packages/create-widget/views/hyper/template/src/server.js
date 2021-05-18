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
      const { View, slots } = await viewFactory(widget);
      const render = widget.$dependencies.bind(widget.state);

      return {
        html: View(render).toString(),
        slots: slots.map((slot) => {
          return {
            ...slot,
            html: slot.View(render).toString(),
          };
        }),
      };
    },
  });
}
