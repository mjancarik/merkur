import React from 'react';
import { shallow } from 'enzyme';
import { createMerkur, createMerkurWidget, removeMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

const mockedWidgetProperties = {
  name: 'my-widget',
  version: '0.0.1',
  containerSelector: '.container',
  assets: [
    {
      name: 'widget.js',
      type: 'script',
      source: {
        es11: 'http://localhost:4444/static/es11/widget.6961af42bfa3596bb147.js',
        es9: 'http://localhost:4444/static/es9/widget.31c5090d8c961e43fade.js',
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
      source: 'html { font-weight: bold; }',
    },
  ],
  html: '<div class="merkur__page"></div>',
  slot: {
    headline: {
      name: 'headline',
      containerSelector: '.headline',
      html: '<div class="merkur__headline"></div>',
    },
  },
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

function mockGlobalProperty(propName, value) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(global, propName);
  Object.defineProperty(global, propName, { writable: true });
  global[propName] = value;

  return () => {
    if (originalDescriptor) {
      Object.defineProperty(global, propName, originalDescriptor);
    } else {
      delete global[propName];
    }
  };
}

export {
  mockedWidgetProperties,
  mockGlobalProperty,
  widgetMockCleanup,
  widgetMockInit,
};
