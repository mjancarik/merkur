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
  let instance = null;

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

  describe('static hasWidgetChanged() method', () => {
    it('should return false for invalid inputs', () => {
      expect(MerkurComponent.hasWidgetChanged(null, undefined)).toBe(false);
      expect(MerkurComponent.hasWidgetChanged()).toBe(false);
      expect(MerkurComponent.hasWidgetChanged('', '')).toBe(false);
      expect(MerkurComponent.hasWidgetChanged(1, {})).toBe(false);
      expect(MerkurComponent.hasWidgetChanged({ a: 1, b: 2 })).toBe(false);
      expect(
        MerkurComponent.hasWidgetChanged(
          { name: 'name', version: 'version' },
          { a: 4, b: 5 }
        )
      ).toBe(false);
    });

    it('should return false for same widgets', () => {
      expect(
        MerkurComponent.hasWidgetChanged(
          { name: 'todo', version: '1.0.0' },
          { name: 'todo', version: '1.0.0' }
        )
      ).toBe(false);
    });

    it('should return true for different versions of the widget', () => {
      expect(
        MerkurComponent.hasWidgetChanged(
          { name: 'todo', version: '1.0.0' },
          { name: 'todo', version: '0.1.0' }
        )
      ).toBe(true);
      expect(
        MerkurComponent.hasWidgetChanged(
          { name: 'todo', version: '1.1.0' },
          { name: 'todo', version: '1.0.0' }
        )
      ).toBe(true);
    });

    it('should return true for different widgets', () => {
      expect(
        MerkurComponent.hasWidgetChanged(
          { name: 'articles', version: '1.0.0' },
          { name: 'todo', version: '0.1.0' }
        )
      ).toBe(true);
      expect(
        MerkurComponent.hasWidgetChanged(
          { name: 'todos', version: '1.0.0' },
          { name: 'todo', version: '1.0.0' }
        )
      ).toBe(true);
    });
  });

  describe('static getDerivedStateFromProps() method', () => {
    it('should return null if there are no next widgetProperties', () => {
      expect(
        MerkurComponent.getDerivedStateFromProps({
          color: 'blue',
          size: 'large',
        })
      ).toBe(null);

      expect(MerkurComponent.getDerivedStateFromProps()).toBe(null);
      expect(MerkurComponent.getDerivedStateFromProps(null, null)).toBe(null);
      expect(
        MerkurComponent.getDerivedStateFromProps(null, { widgetProperties: {} })
      ).toBe(null);
      expect(
        MerkurComponent.getDerivedStateFromProps({ widgetProperties: {} })
      ).toBe(null);
    });

    it('should cache widget metadata on receiving widget properties for the first time', () => {
      expect(
        MerkurComponent.getDerivedStateFromProps(
          {
            widgetProperties,
          },
          { cachedWidgetMeta: null }
        )
      ).toEqual({
        cachedWidgetMeta: {
          name: widgetProperties.name,
          version: widgetProperties.version,
        },
      });
    });

    it('should return null for following calls after widget meta are already cached and not changed', () => {
      expect(
        MerkurComponent.getDerivedStateFromProps(
          {
            widgetProperties,
          },
          { cachedWidgetMeta: null }
        )
      ).toEqual({
        cachedWidgetMeta: {
          name: widgetProperties.name,
          version: widgetProperties.version,
        },
      });

      expect(
        MerkurComponent.getDerivedStateFromProps(
          {
            widgetProperties,
          },
          {
            cachedWidgetMeta: {
              name: widgetProperties.name,
              version: widgetProperties.version,
            },
          }
        )
      ).toBe(null);
    });

    it('should re-cache widget metadata on receiving new widget properties, that changed and reset state.', () => {
      let newWidgetProperties = {
        name: 'todos',
        version: '1.0.0',
      };

      expect(
        MerkurComponent.getDerivedStateFromProps(
          {
            widgetProperties: newWidgetProperties,
          },
          {
            cachedWidgetMeta: {
              name: widgetProperties.name,
              version: widgetProperties.version,
            },
          }
        )
      ).toEqual({
        encounteredError: false,
        assetsLoaded: false,
        cachedWidgetMeta: {
          name: newWidgetProperties.name,
          version: newWidgetProperties.version,
        },
      });
    });
  });

  describe('shouldComponentUpdate() method', () => {
    beforeEach(() => {
      wrapper = shallow(
        <MerkurComponent widgetProperties={widgetProperties}>
          <span>Fallback</span>
        </MerkurComponent>
      );

      instance = wrapper.instance();
    });

    it('should always return false except for specific cases, when widgetProperties are defined', () => {
      let defaultState = wrapper.state();

      expect(
        instance.shouldComponentUpdate({ widgetProperties }, defaultState)
      ).toBe(false);
      expect(
        instance.shouldComponentUpdate(
          { a: 'test', b: 'new props' },
          defaultState
        )
      ).toBe(false);
      expect(
        instance.shouldComponentUpdate(
          {},
          {
            ...defaultState,
            newStateKey: 1,
            thisShouldBeIgnored: true,
          }
        )
      ).toBe(false);
      expect(
        instance.shouldComponentUpdate(
          {
            ...widgetProperties,
            sameProps: 'with new keys and values',
            butStill: 'the same name or version',
          },
          defaultState
        )
      ).toBe(false);
    });

    it('should return true when widgetProperties are not defined', () => {
      wrapper.setProps({ widgetProperties: null });

      expect(instance.shouldComponentUpdate({}, wrapper.state())).toBe(true);
    });

    it('should return true when encounteredError flag changes', () => {
      let defaultState = wrapper.state();

      expect(
        instance.shouldComponentUpdate(
          { widgetProperties },
          {
            ...defaultState,
            encounteredError: !defaultState.encounteredError,
          }
        )
      ).toBe(true);
    });

    it('should return true when assetsLoaded flag changes', () => {
      let defaultState = wrapper.state();

      expect(
        instance.shouldComponentUpdate(
          { widgetProperties },
          {
            ...defaultState,
            assetsLoaded: !defaultState.assetsLoaded,
          }
        )
      ).toBe(true);
    });

    it('should return true when widget name or version changes', () => {
      expect(
        instance.shouldComponentUpdate(
          {
            widgetProperties: {
              ...widgetProperties,
              name: widgetProperties.name,
              version: '1.2.3',
            },
          },
          wrapper.state()
        )
      ).toBe(true);

      expect(
        instance.shouldComponentUpdate(
          {
            widgetProperties: {
              ...widgetProperties,
              name: 'newName',
              version: widgetProperties.version,
            },
          },
          wrapper.state()
        )
      ).toBe(true);
    });
  });

  describe('componentDidMount() method', () => {
    it('should load widget assets upon mounting', () => {
      spyOn(instance, '_loadWidgetAssets');

      instance.componentDidMount();

      expect(instance._loadWidgetAssets).toHaveBeenCalled();
    });

    it('should set _isMounted flag to true', () => {
      instance._isMounted = false;
      expect(instance._isMounted).toBe(false);

      instance.componentDidMount();

      expect(instance._isMounted).toBe(true);
    });
  });

  describe('SSR widget lifecycle', () => {});

  describe('SPA widget lifecycle', () => {});

  describe('widget props change lifecycle', () => {});
});
