import render from 'preact-render-to-string';

import { createMerkurWidget } from '@merkur/core';
import { FactoryProperties, WidgetProperties } from '../types';

export function createPreactWidget({
  $dependencies,
  mount,
  viewFactory,
  ...restProps
}: WidgetProperties & FactoryProperties) {
  const factory = {
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
  };

  return (widgetParams) =>
    createMerkurWidget({
      ...restProps,
      ...widgetParams,
      $dependencies: {
        ...$dependencies,
        render,
      },
      mount: mount?.bind(factory) ?? factory.mount,
    });
}
