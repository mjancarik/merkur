import React from 'react';
import { shallow } from 'enzyme';
import * as MerkurIntegration from '@merkur/integration';

import {
  mockedWidgetClassName,
  mockedWidgetProperties,
  widgetMockCleanup,
  widgetMockInit,
} from '../__mocks__/widgetMock';
import MerkurComponent from '../MerkurComponent';

jest.mock('@merkur/integration', () => {
  return {
    loadScriptAssets: jest.fn(() => Promise.resolve()),
    loadStyleAssets: jest.fn(() => Promise.resolve()),
  };
});

describe('Merkur component', () => {
  let widgetProperties = null;
  let widgetClassName = null;
  let wrapper = null;

  beforeEach(() => {
    jest
      .spyOn(MerkurComponent.prototype, '_isSSRHydrate')
      .mockReturnValue(false);

    widgetClassName = mockedWidgetClassName;
    widgetProperties = mockedWidgetProperties;

    widgetMockInit();
  });

  afterEach(() => {
    widgetMockCleanup();
  });

  describe('merkur component rendering', () => {
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

        done();
      });
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

      wrapper = shallow(
        <MerkurComponent
          widgetProperties={widgetProperties}
          widgetClassName={widgetClassName}>
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

  describe('SSR widget lifecycle', () => {});

  describe('SPA widget lifecycle', () => {});

  describe('widget props change lifecycle', () => {});
});
