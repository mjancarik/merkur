import React from 'react';
import { shallow } from 'enzyme';
import { createMerkur, createMerkurWidget, removeMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

const mockedWidgetClassName = 'container';
const mockedWidgetProperties = {
  name: 'my-widget',
  version: '0.0.1',
  props: {
    containerSelector: `.${mockedWidgetClassName}`,
  },
  assets: [
    {
      name: 'widget.js',
      type: 'script',
      source: {
        es9: 'http://localhost:4444/static/es9/widget.6961af42bfa3596bb147.js',
        es5: 'http://localhost:4444/static/es5/widget.31c5090d8c961e43fade.js',
      },
    },
    {
      name: 'widget.css',
      type: 'stylesheet',
      source:
        'http://localhost:4444/static/es9/widget.814e0cb568c7ddc0725d.css',
    },
    {
      type: 'inlineStyle',
      source: 'html { font-weight: bold }',
    },
  ],
  html: '<div class="merkur__page"></div>',
};

function widgetMockInit() {
  const merkur = createMerkur();

  const widgetDefinition = {
    name: 'my-widget',
    version: '0.0.1',
    $dependencies: {
      shallow,
    },
    $plugins: [componentPlugin, eventEmitterPlugin],
    assets: mockedWidgetProperties.assets,
    async mount(widget) {
      return widget.$dependencies.shallow(<span />);
    },
    async update(widget) {
      return widget.$dependencies.shallow(<span />);
    },
  };

  function createWidget(widgetParams) {
    return createMerkurWidget({
      ...widgetParams,
      ...widgetDefinition,
    });
  }

  merkur.register({
    ...widgetDefinition,
    createWidget,
  });
}

function widgetMockCleanup() {
  removeMerkur();
}

export {
  mockedWidgetClassName,
  mockedWidgetProperties,
  widgetMockCleanup,
  widgetMockInit,
};
