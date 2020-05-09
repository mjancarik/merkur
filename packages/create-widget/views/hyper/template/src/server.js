import viper from 'viperhtml';
import { createMerkurWidget } from '@merkur/core';
import { widgetProperties } from './widget';

export function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {
      bind: viper.bind,
      wire: viper.wire,
    },
    mount(widget) {
      const render = widget.$dependencies.bind(widget.state);

      return widget.View(render).toString();
    },
  });
}
