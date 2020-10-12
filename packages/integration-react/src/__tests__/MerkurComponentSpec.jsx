import { shallow } from 'enzyme';
import { createMerkur, createMerkurWidget, removeMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';
import * as MerkurIntegration from '@merkur/integration';
import React from 'react';

jest.mock('@merkur/integration', () => {
  return {
    loadScriptAssets: jest.fn(() => Promise.resolve()),
    loadStyleAssets: jest.fn(() => Promise.resolve()),
  };
});

import MerkurComponent from '../MerkurComponent';

describe('Merkur component', () => {
  let widgetProperties = null;
  let widgetClassName = null;
  let wrapper = null;

  beforeEach(() => {
    const merkur = createMerkur();

    jest
      .spyOn(MerkurComponent.prototype, '_isSSRHydrate')
      .mockReturnValue(false);

    widgetClassName = 'container';

    widgetProperties = {
      name: 'my-widget',
      version: '0.0.1',
      props: {
        containerSelector: '.container',
      },
      assets: [
        {
          name: 'widget.js',
          type: 'script',
          source: {
            es9:
              'http://localhost:4444/static/es9/widget.6961af42bfa3596bb147.js',
            es5:
              'http://localhost:4444/static/es5/widget.31c5090d8c961e43fade.js',
          },
        },
        {
          name: 'widget.css',
          type: 'stylesheet',
          source:
            'http://localhost:4444/static/es9/widget.814e0cb568c7ddc0725d.css',
        },
      ],
      html: '<div class="merkur__page"></div>',
    };

    const widgetDefinition = {
      name: 'my-widget',
      version: '0.0.1',
      $dependencies: {
        shallow,
      },
      $plugins: [componentPlugin, eventEmitterPlugin],
      assets: widgetProperties.assets,
      mount(widget) {
        return widget.$dependencies.shallow(<span />);
      },
      update(widget) {
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
  });

  afterEach(() => {
    removeMerkur();
  });

  it('should render nothing for not defined widgetProperties', () => {
    wrapper = shallow(
      <MerkurComponent>
        <span>Fallback</span>
      </MerkurComponent>
    );

    expect(wrapper.exists()).toBeTruthy();
  });

  it('should render merkur component for defined widgetProperties', (done) => {
    jest
      .spyOn(MerkurIntegration, 'loadScriptAssets')
      .mockImplementation(() => Promise.resolve());

    wrapper = shallow(
      <MerkurComponent
        widgetProperties={widgetProperties}
        widgetClassName={widgetClassName}>
        <span>Fallback</span>
      </MerkurComponent>
    );

    setImmediate(() => {
      expect(MerkurIntegration.loadScriptAssets).toHaveBeenCalled();
      expect(wrapper).toMatchInlineSnapshot(`
        <Fragment>
          <WidgetWrapper
            className="container"
            html="<div class=\\"merkur__page\\"></div>"
          />
        </Fragment>
      `);
    });

    done();
  });

  it('should call onWidgetMounted and onWidgetUnmouting callback', (done) => {
    const onWidgetMounted = jest.fn();
    const onWidgetUnmounting = jest.fn();

    wrapper = shallow(
      <MerkurComponent
        widgetProperties={widgetProperties}
        widgetClassName={widgetClassName}
        onWidgetMounted={onWidgetMounted}
        onWidgetUnmounting={onWidgetUnmounting}>
        <span>Fallback</span>
      </MerkurComponent>
    );

    setImmediate(() => {
      const widget = wrapper.instance()._widget;
      expect(onWidgetMounted).toHaveBeenCalledWith(widget);

      wrapper.unmount();

      setImmediate(() => {
        expect(onWidgetUnmounting).toHaveBeenCalledWith(widget);
        done();
      });
    });
  });

  it('should call onError callback and render fallback when script loading fails.', (done) => {
    jest
      .spyOn(MerkurIntegration, 'loadScriptAssets')
      .mockImplementation(() => Promise.reject('failed to load'));

    const onError = jest.fn();

    wrapper = shallow(
      <MerkurComponent
        widgetProperties={widgetProperties}
        widgetClassName={widgetClassName}
        onError={onError}>
        <span>Fallback</span>
      </MerkurComponent>
    );

    setImmediate(() => {
      expect(onError).toHaveBeenCalled();

      expect(wrapper).toMatchInlineSnapshot(`
        <span>
          Fallback
        </span>
      `);

      done();
    });
  });

  it('should load style assets on unmount', (done) => {
    jest
      .spyOn(MerkurIntegration, 'loadStyleAssets')
      .mockImplementation(() => Promise.resolve());
    const onWidgetMounted = jest.fn();
    const onWidgetUnmounting = jest.fn();

    wrapper = shallow(
      <MerkurComponent
        widgetProperties={widgetProperties}
        widgetClassName={widgetClassName}
        onWidgetMounted={onWidgetMounted}
        onWidgetUnmounting={onWidgetUnmounting}>
        <span>Fallback</span>
      </MerkurComponent>
    );

    setImmediate(() => {
      wrapper.unmount();

      setImmediate(() => {
        expect(MerkurIntegration.loadStyleAssets).toHaveBeenCalled();
        done();
      });
    });
  });
});
