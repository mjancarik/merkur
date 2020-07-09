import { createMerkurWidget, createMerkur } from '@merkur/core';
import { widgetProperties } from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    mount() {},
    update() {},
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
