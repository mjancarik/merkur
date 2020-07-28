import { shallow } from 'enzyme';
import { createMerkur, createMerkurWidget, removeMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import React from 'react';
import MerkurComponent from '../MerkurComponent';

describe('Merkur component', () => {
  let widgetProperties = null;
  let widgetClassName = null;
  let wrapper = null;

  beforeEach(() => {
    const merkur = createMerkur();

    widgetClassName = 'container';

    widgetProperties = {
      name: 'my-widget',
      version: '0.0.1',
      props: {
        containerSelector: '.container',
      },
      assets: [
        {
          type: 'script',
          source: 'http://localhost:4444/static/widget-client.js',
        },
        {
          type: 'stylesheet',
          source: 'http://localhost:4444/static/widget-client.css',
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
      $plugins: [componentPlugin],
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

  it('should render fallback view for not defined widgetProperties', () => {
    wrapper = shallow(
      <MerkurComponent>
        <span>Fallback</span>
      </MerkurComponent>
    );

    expect(wrapper).toMatchInlineSnapshot(`
      <span>
        Fallback
      </span>
    `);
  });

  it('should render merkur component for defined widgetProperties', () => {
    spyOn(MerkurComponent.prototype, '_loadScriptAssets').and.stub();

    wrapper = shallow(
      <MerkurComponent
        widgetProperties={widgetProperties}
        widgetClassName={widgetClassName}>
        <span>Fallback</span>
      </MerkurComponent>
    );

    expect(wrapper).toMatchInlineSnapshot(`
      <Fragment>
        <link
          href="http://localhost:4444/static/widget-client.css"
          key="1"
          rel="stylesheet"
        />
        <div
          className="container"
          dangerouslySetInnerHTML={
            Object {
              "__html": "<div class=\\"merkur__page\\"></div>",
            }
          }
        />
      </Fragment>
    `);
  });

  it('should load script assets prior to mounting the widget', () => {
    spyOn(MerkurComponent.prototype, '_loadScript').and.stub();

    wrapper = shallow(
      <MerkurComponent
        widgetProperties={widgetProperties}
        widgetClassName={widgetClassName}>
        <span>Fallback</span>
      </MerkurComponent>
    );

    expect(MerkurComponent.prototype._loadScript).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'script',
        source: 'http://localhost:4444/static/widget-client.js',
      })
    );
  });

  it('should call onWidgetMounted and onWidgetUnmouting callback', (done) => {
    spyOn(MerkurComponent.prototype, '_loadScriptAssets').and.returnValue(
      Promise.resolve()
    );
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
    spyOn(MerkurComponent.prototype, '_loadScript').and.returnValue(
      Promise.reject()
    );
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
});
