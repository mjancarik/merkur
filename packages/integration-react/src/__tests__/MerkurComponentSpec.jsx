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

    wrapper = shallow(
      <MerkurComponent widgetProperties={widgetProperties}>
        <span>Fallback</span>
      </MerkurComponent>
    );

    instance = wrapper.instance();
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

      expect(instance._loadWidgetAssets).toHaveBeenCalledTimes(1);
    });

    it('should set _isMounted flag to true', () => {
      instance._isMounted = false;
      expect(instance._isMounted).toBe(false);

      instance.componentDidMount();

      expect(instance._isMounted).toBe(true);
    });
  });

  describe('componentDidUpdate() method', () => {
    it('should try to mount the widget if assets have been loaded', () => {
      wrapper.setState({ assetsLoaded: true });
      spyOn(instance, '_mountWidget').and.stub();

      instance.componentDidUpdate({}, { assetsLoaded: false });

      expect(instance._mountWidget).toHaveBeenCalledTimes(1);
    });

    it('should not try to mount the widget if assesLoaded changed but are not true', () => {
      wrapper.setState({ assetsLoaded: false });
      spyOn(instance, '_mountWidget').and.stub();

      instance.componentDidUpdate({}, { assetsLoaded: true });

      expect(instance._mountWidget).not.toHaveBeenCalled();
    });

    it('should not try to mount the widget if anything else in the state changed', () => {
      spyOn(instance, '_mountWidget').and.stub();

      instance.componentDidUpdate({}, { somethingElseChanged: true });

      expect(instance._mountWidget).not.toHaveBeenCalled();
    });

    it('should not try to mount the widget if anything else in the state changed', () => {
      spyOn(instance, '_mountWidget').and.stub();

      instance.componentDidUpdate({}, { somethingElseChanged: true });

      expect(instance._mountWidget).not.toHaveBeenCalled();
    });

    it('should remove current widget and reset state, if widgetProperties are deleted', () => {
      wrapper.setProps({ widgetProperties: null });

      spyOn(instance, '_mountWidget').and.stub();
      spyOn(instance, '_removeWidget').and.stub();
      spyOn(instance, '_loadWidgetAssets').and.stub();
      spyOn(instance, 'setState').and.callThrough();

      instance.componentDidUpdate({ widgetProperties }, {});

      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
      expect(instance.setState).toHaveBeenCalledWith({
        assetsLoaded: false,
        encounteredError: false,
      });
    });

    it('should start loading widget assets for new widget properties', () => {
      wrapper.setProps({
        widgetProperties,
      });

      spyOn(instance, '_mountWidget').and.stub();
      spyOn(instance, '_removeWidget').and.stub();
      spyOn(instance, '_loadWidgetAssets').and.stub();
      spyOn(instance, 'setState').and.callThrough();

      instance.componentDidUpdate({ widgetProperties: null }, {});

      expect(instance._loadWidgetAssets).toHaveBeenCalledTimes(1);
      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._removeWidget).not.toHaveBeenCalled();
    });

    it('should remove old widget, reset state and start loading new one', () => {
      wrapper.setProps({
        widgetProperties,
      });

      spyOn(instance, '_mountWidget').and.stub();
      spyOn(instance, '_removeWidget').and.stub();
      spyOn(instance, '_loadWidgetAssets').and.stub();
      spyOn(instance, 'setState').and.callThrough();

      instance.componentDidUpdate(
        {
          widgetProperties: {
            ...widgetProperties,
            name: 'new-name',
            version: '1.2.3',
          },
        },
        {}
      );

      expect(instance._removeWidget).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledWith(
        {
          assetsLoaded: false,
          encounteredError: false,
        },
        expect.any(Function)
      );
      expect(instance._loadWidgetAssets).toHaveBeenCalledTimes(1);
      expect(instance._mountWidget).not.toHaveBeenCalled();
    });

    it('should not call any action for any other state updates', () => {
      let oldState = Object.assign({}, wrapper.state());

      wrapper.setState({
        testKey: 'value',
        cachedWidgetMeta: {
          name: 'newName',
          version: 'newVersion',
        },
      });

      spyOn(instance, '_mountWidget').and.stub();
      spyOn(instance, '_removeWidget').and.stub();
      spyOn(instance, '_loadWidgetAssets').and.stub();
      spyOn(instance, 'setState').and.callThrough();

      instance.componentDidUpdate({ widgetProperties }, oldState);

      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._removeWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
      expect(instance.setState).not.toHaveBeenCalled();
    });

    it('should not call any action for any other prop updates', () => {
      let oldState = Object.assign({}, wrapper.state());

      wrapper.setProps({
        testKey: 'value',
      });

      spyOn(instance, '_mountWidget').and.stub();
      spyOn(instance, '_removeWidget').and.stub();
      spyOn(instance, '_loadWidgetAssets').and.stub();
      spyOn(instance, 'setState').and.callThrough();

      instance.componentDidUpdate({ widgetProperties }, oldState);

      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._removeWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
      expect(instance.setState).not.toHaveBeenCalled();
    });
  });

  describe('componentWillUnmount() method', () => {
    it('should remove widget on unmounting', () => {
      spyOn(instance, '_removeWidget');

      instance.componentWillUnmount();

      expect(instance._removeWidget).toHaveBeenCalled();
    });
  });

  describe('_renderFallback() method', () => {
    it('should return null if no children are given', () => {
      wrapper.setProps({ children: undefined });

      expect(instance._renderFallback()).toBe(null);
    });

    it('should return react element given in children', () => {
      let element = <span>Fallback</span>;
      wrapper.setProps({ children: element });

      expect(instance._renderFallback()).toBe(element);
    });

    it('should return result of children function call', () => {
      wrapper.setProps({ children: ({ error }) => `error:${error}` });
      wrapper.setState({
        encounteredError: 'test-error',
      });

      expect(instance._renderFallback()).toBe('error:test-error');
    });
  });

  describe('_renderStyleAssets() method', () => {
    it('should return array of style elements for given widget assets', () => {
      expect(instance._renderStyleAssets()).toMatchInlineSnapshot(`
        Array [
          <link
            href="http://localhost:4444/static/es9/widget.814e0cb568c7ddc0725d.css"
            rel="stylesheet"
          />,
          <style
            dangerouslySetInnerHTML={
              Object {
                "__html": "html { font-weight: bold }",
              }
            }
          />,
        ]
      `);
    });

    it('should return empty array for no style assets', () => {
      let newWidgetProperties = {
        ...widgetProperties,
        assets: [],
      };

      wrapper = shallow(
        <MerkurComponent widgetProperties={newWidgetProperties}>
          <span>Fallback</span>
        </MerkurComponent>
      );

      instance = wrapper.instance();

      expect(instance._renderStyleAssets()).toMatchInlineSnapshot(`Array []`);
    });
  });

  describe('_getWidgetHTML() method', () => {
    it('should return SSR rendered HTML', () => {
      let newWidgetProperties = {
        ...widgetProperties,
        html: null,
      };

      wrapper = shallow(
        <MerkurComponent widgetProperties={newWidgetProperties}>
          <span>Fallback</span>
        </MerkurComponent>
      );

      instance = wrapper.instance();

      spyOn(instance, '_getSSRHTML').and.returnValue('SSR HTML');

      expect(instance._getWidgetHTML()).toBe('SSR HTML');
    });

    it('should return widgetProperties html if available', () => {
      expect(instance._getWidgetHTML()).toBe(widgetProperties.html);
    });

    it('should return cached html when called multiple times', () => {
      let newWidgetProperties = {
        ...widgetProperties,
        html: null,
      };

      wrapper = shallow(
        <MerkurComponent widgetProperties={newWidgetProperties}>
          <span>Fallback</span>
        </MerkurComponent>
      );

      instance = wrapper.instance();

      spyOn(instance, '_getSSRHTML').and.returnValue('SSR HTML');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getSSRHTML).toHaveBeenCalledTimes(1);
    });
  });

  describe('_handleError() method', () => {
    let onError;

    beforeEach(() => {
      onError = jest.fn();
      wrapper = shallow(
        <MerkurComponent widgetProperties={widgetProperties} onError={onError}>
          <span>Fallback</span>
        </MerkurComponent>
      );

      instance = wrapper.instance();
      spyOn(instance, 'setState').and.callThrough();
    });

    it('should call props.onError if defined', () => {
      instance._handleError('error');

      expect(onError).toHaveBeenCalledWith('error');
    });

    it('should set error to state', () => {
      instance._handleError('error');

      expect(instance.setState).toHaveBeenCalledWith({
        encounteredError: 'error',
      });
    });
  });

  describe('_removeWidget() method', () => {
    let onWidgetUnmounting = jest.fn();

    beforeEach(() => {
      wrapper = shallow(
        <MerkurComponent
          widgetProperties={widgetProperties}
          onWidgetUnmounting={onWidgetUnmounting}>
          <span>Fallback</span>
        </MerkurComponent>
      );

      instance = wrapper.instance();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return if there is no widget instance currently available', () => {
      expect(instance._widget).toBe(null);

      instance._removeWidget();

      expect(onWidgetUnmounting).not.toHaveBeenCalled();
    });

    it('should call props.onWidgetUnmounting', () => {
      let widget = { name: 'name', unmount: jest.fn() };
      instance._widget = widget;

      instance._removeWidget();

      expect(onWidgetUnmounting).toHaveBeenCalledWith(widget);
    });

    it('should remove event listeners before unmounting', () => {
      let offWidget = jest.fn();
      instance._widget = { name: 'name', unmount: jest.fn(), off: offWidget };

      instance._removeWidget();

      expect(offWidget).toHaveBeenCalledWith(
        '@merkur/plugin-error.error',
        instance._handleClientError
      );
    });

    it('should unmount widget and do cleanup', () => {
      let unmount = jest.fn();
      let widget = { name: 'name', unmount };
      instance._widget = widget;
      instance._html = 'html';

      expect(instance._widget).toBe(widget);
      expect(instance._html).toBe('html');

      instance._removeWidget();

      expect(unmount).toHaveBeenCalled();
      expect(instance._widget).toBe(null);
      expect(instance._html).toBe(null);
    });
  });

  describe('_getSSRHTML() method', () => {
    it('return empty string if component is already mounted', () => {
      instance._isMounted = true;

      expect(instance._getSSRHTML()).toBe('');
    });

    it('return empty string if we are not on client', () => {
      spyOn(instance, '_isClient').and.returnValue(false);
      instance._isMounted = false;

      expect(instance._getSSRHTML()).toBe('');
    });

    it('return html widget content from document', () => {
      spyOn(instance, '_isClient').and.returnValue(true);
      instance._isMounted = false;
      delete global.document;
      global.document = {
        querySelector: () => ({
          children: [
            {
              outerHTML: 'outerHTML',
            },
          ],
        }),
      };

      expect(instance._getSSRHTML()).toBe('outerHTML');
    });
  });

  describe('_isClient() method', () => {
    it('should return false for non-browser environments', () => {
      delete global.window;
      delete global.document;
      expect(instance._isClient()).toBe(false);
      global.window = {};
      delete global.document;
      expect(instance._isClient()).toBe(false);
      global.document = {};
      delete global.window;
      expect(instance._isClient()).toBe(false);
    });

    it('should return true for browser environments', () => {
      global.window = {};
      global.document = {};
      expect(instance._isClient()).toBe(true);
    });
  });

  describe('_isSSRHydrate() method', () => {
    beforeEach(() => {
      MerkurComponent.prototype._isSSRHydrate.mockRestore();
    });

    it("should return true if there's some server side rendered html", () => {
      spyOn(instance, '_getSSRHTML').and.returnValue('html');

      expect(instance._isSSRHydrate()).toBe(true);
    });

    it('should return false, if SSR renderd html is empty', () => {
      spyOn(instance, '_getSSRHTML').and.returnValue('');

      expect(instance._isSSRHydrate()).toBe(false);
    });
  });
});
