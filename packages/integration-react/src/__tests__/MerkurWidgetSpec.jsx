import React from 'react';
import { shallow } from 'enzyme';
import * as MerkurIntegration from '@merkur/integration';

import {
  mockedWidgetProperties,
  widgetMockCleanup,
  widgetMockInit,
} from '../__mocks__/widgetMock';
import MerkurWidget from '../MerkurWidget';

jest.mock('../WidgetWrapper', () => {
  const { WidgetWrapperComponent } = jest.requireActual('../WidgetWrapper');

  return {
    __esModule: true,
    default: WidgetWrapperComponent,
  };
});

jest.mock('@merkur/integration', () => {
  return {
    loadScriptAssets: jest.fn(() => Promise.resolve()),
    loadStyleAssets: jest.fn(() => Promise.resolve()),
  };
});

describe('Merkur component', () => {
  let widgetProperties = null;
  let wrapper = null;

  beforeEach(() => {
    // Cache mocked widget data
    widgetProperties = { ...mockedWidgetProperties };

    // Mock basic function so first render can pass
    jest.spyOn(MerkurWidget.prototype, '_isSSRHydrate').mockReturnValue(false);

    // Shallow render component
    wrapper = shallow(
      <MerkurWidget widgetProperties={widgetProperties}>Fallback</MerkurWidget>
    );

    widgetMockInit();
  });

  afterEach(() => {
    widgetMockCleanup();
    jest.clearAllMocks();
  });

  describe('merkur component rendering', () => {
    it('should render fallback for not defined widgetProperties', () => {
      wrapper = shallow(
        <MerkurWidget>
          <span>Fallback</span>
        </MerkurWidget>
      );

      expect(wrapper.exists()).toBeTruthy();
    });

    it('should render merkur component for defined widgetProperties', (done) => {
      jest
        .spyOn(MerkurIntegration, 'loadScriptAssets')
        .mockImplementation(() => Promise.resolve());

      wrapper = shallow(
        <MerkurWidget widgetProperties={widgetProperties}>
          <span>Fallback</span>
        </MerkurWidget>
      );

      setImmediate(() => {
        expect(MerkurIntegration.loadScriptAssets).toHaveBeenCalled();
        expect(wrapper).toMatchInlineSnapshot(`
          <Fragment>
            <WidgetWrapper
              containerSelector=".container"
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
        <MerkurWidget
          widgetProperties={widgetProperties}
          onWidgetMounted={onWidgetMounted}
          onWidgetUnmounting={onWidgetUnmounting}>
          <span>Fallback</span>
        </MerkurWidget>
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
        <MerkurWidget widgetProperties={widgetProperties} onError={onError}>
          <span>Fallback</span>
        </MerkurWidget>
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
        <MerkurWidget widgetProperties={widgetProperties}>
          <span>Fallback</span>
        </MerkurWidget>
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
});

describe('Merkur component methods', () => {
  let widgetProperties = null;
  let wrapper = null;
  let instance = null;

  beforeEach(() => {
    // Cache mocked widget data
    widgetProperties = mockedWidgetProperties;

    // Mock resource loading functions
    jest
      .spyOn(MerkurIntegration, 'loadStyleAssets')
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(MerkurIntegration, 'loadScriptAssets')
      .mockImplementation(() => Promise.resolve());

    // Mock basic function so first render can pass
    jest.spyOn(MerkurWidget.prototype, '_isSSRHydrate').mockReturnValue(false);
    jest.spyOn(MerkurWidget.prototype, '_isClient').mockReturnValue(true);
    jest
      .spyOn(MerkurWidget.prototype, '_getWidgetHTML')
      .mockReturnValue(widgetProperties.html);

    // Shallow render component
    wrapper = shallow(
      <MerkurWidget widgetProperties={widgetProperties}>Fallback</MerkurWidget>,
      { disableLifecycleMethods: true }
    );

    // Update states so widget renders
    wrapper.setState({ assetsLoaded: true });
    instance = wrapper.instance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('html getter', () => {
    it('should return slot SSR html', () => {
      expect(instance.html).toStrictEqual(widgetProperties.html);
    });

    it('should return null', () => {
      wrapper.setProps({ widgetProperties: null });

      expect(instance.html).toBeNull();
    });
  });

  describe('container getter', () => {
    it('should return container element', () => {
      spyOn(instance, '_isClient').and.returnValue(true);

      delete global.document;
      global.document = {
        querySelector: () => 'container-element',
      };

      expect(instance.container).toBe('container-element');
    });

    it('should return null on server', () => {
      spyOn(instance, '_isClient').and.returnValue(false);

      wrapper.setProps({ widgetProperties: null });

      expect(instance.container).toBeNull();
    });
  });

  describe('static getDerivedStateFromProps() method', () => {
    it('should return null if there are no next widgetProperties', () => {
      expect(
        MerkurWidget.getDerivedStateFromProps({
          color: 'blue',
          size: 'large',
        })
      ).toBe(null);
      expect(MerkurWidget.getDerivedStateFromProps()).toBe(null);
      expect(MerkurWidget.getDerivedStateFromProps(null, null)).toBe(null);
      expect(
        MerkurWidget.getDerivedStateFromProps(null, { widgetProperties: {} })
      ).toBe(null);
      expect(
        MerkurWidget.getDerivedStateFromProps({ widgetProperties: {} })
      ).toBe(null);
    });

    it('should cache widget metadata on receiving widget properties for the first time', () => {
      expect(
        MerkurWidget.getDerivedStateFromProps(
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
        MerkurWidget.getDerivedStateFromProps(
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
        MerkurWidget.getDerivedStateFromProps(
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
        MerkurWidget.getDerivedStateFromProps(
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
    it('should always return false when widgetProperties are defined, except for specific cases', () => {
      let defaultState = wrapper.state();

      expect(
        instance.shouldComponentUpdate({ widgetProperties }, defaultState)
      ).toBe(false);
      expect(
        instance.shouldComponentUpdate(
          { widgetProperties },
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
            widgetProperties,
            sameProps: 'with new keys and values',
            butStill: 'the same name or version',
          },
          defaultState
        )
      ).toBe(false);
    });

    it('should return true when widgetProperties are invalid', () => {
      wrapper.setProps({ widgetProperties: null });

      expect(
        instance.shouldComponentUpdate(
          { widgetProperties: {} },
          wrapper.state()
        )
      ).toBe(true);
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

      expect(
        instance.shouldComponentUpdate(
          {
            widgetProperties: {
              ...widgetProperties,
              name: 'newName',
              version: '1.5.6',
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
  });

  describe('componentDidUpdate() method', () => {
    beforeEach(() => {
      spyOn(instance, '_mountWidget').and.stub();
      spyOn(instance, '_removeWidget').and.stub();
      spyOn(instance, '_loadWidgetAssets').and.stub();
      spyOn(instance, 'setState').and.callThrough();
    });

    it('should try to mount the widget if assets have been loaded', () => {
      wrapper.setState({ assetsLoaded: true });

      instance.componentDidUpdate(
        { widgetProperties },
        { assetsLoaded: false }
      );

      expect(instance._mountWidget).toHaveBeenCalledTimes(1);
      expect(instance._removeWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
    });

    it('should not try to mount the widget if assetsLoaded changed but are not true', () => {
      wrapper.setState({ assetsLoaded: false });

      instance.componentDidUpdate({ widgetProperties }, { assetsLoaded: true });

      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._removeWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
    });

    it('should not try to mount the widget if anything else in the state changed', () => {
      instance.componentDidUpdate(
        { widgetProperties },
        { ...wrapper.state(), somethingElseChanged: true }
      );

      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._removeWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
      expect(instance.setState).not.toHaveBeenCalled();
    });

    it('should remove current widget and reset state, if widgetProperties are deleted', () => {
      wrapper.setProps({ widgetProperties: null });

      instance.componentDidUpdate({ widgetProperties }, wrapper.state());

      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
      expect(instance._removeWidget).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledWith({
        assetsLoaded: false,
        encounteredError: false,
        cachedWidgetMeta: null,
      });
    });

    it('should start loading widget assets for new widget properties', () => {
      wrapper.setProps({
        widgetProperties,
      });

      instance.componentDidUpdate({ widgetProperties: null }, wrapper.state());

      expect(instance._loadWidgetAssets).toHaveBeenCalledTimes(1);
      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._removeWidget).not.toHaveBeenCalled();
      expect(instance.setState).not.toHaveBeenCalled();
    });

    it('should remove old widget and start loading new one', () => {
      wrapper.setProps({
        widgetProperties,
      });

      instance.componentDidUpdate(
        {
          widgetProperties: {
            ...widgetProperties,
            name: 'new-name',
            version: '1.2.3',
          },
        },
        wrapper.state()
      );

      expect(instance._removeWidget).toHaveBeenCalledTimes(1);
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

      instance.componentDidUpdate({ widgetProperties }, oldState);

      expect(instance._mountWidget).not.toHaveBeenCalled();
      expect(instance._removeWidget).not.toHaveBeenCalled();
      expect(instance._loadWidgetAssets).not.toHaveBeenCalled();
    });

    it('should not call any action for any other prop updates', () => {
      wrapper.setProps({
        testKey: 'value',
      });

      instance.componentDidUpdate({ widgetProperties }, wrapper.state());

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
      expect(instance._removeWidget).toHaveBeenCalledTimes(1);
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
                "__html": "html { font-weight: bold; }",
              }
            }
          />,
        ]
      `);
    });

    it('should filter out and render only valid assets', () => {
      wrapper.setProps({
        widgetProperties: {
          ...widgetProperties,
          assets: [
            {
              type: 'stylesheet',
            },
            {
              type: 'stylesheet',
              source: '',
            },
            {
              type: 'inlineStyle',
              source: null,
            },
            {
              type: 'inlineStyle',
              source: 'html { background: red; }',
            },
          ],
        },
      });

      let result = instance._renderStyleAssets();
      expect(result).toHaveLength(1);
      expect(instance._renderStyleAssets()).toMatchInlineSnapshot(`
        Array [
          <style
            dangerouslySetInnerHTML={
              Object {
                "__html": "html { background: red; }",
              }
            }
          />,
        ]
      `);
    });

    it('should return empty array for no style assets', () => {
      wrapper.setProps({
        widgetProperties: {
          ...widgetProperties,
          assets: [],
        },
      });

      let result = instance._renderStyleAssets();
      expect(result).toHaveLength(0);
      expect(result).toMatchInlineSnapshot(`Array []`);
    });

    it('should return empty array for invalid assets', () => {
      wrapper.setProps({
        widgetProperties: {
          ...widgetProperties,
          assets: null,
        },
      });

      let result = instance._renderStyleAssets();
      expect(result).toHaveLength(0);
      expect(result).toMatchInlineSnapshot(`Array []`);
    });
  });

  describe('_handleError() method', () => {
    let onError = jest.fn();

    beforeEach(() => {
      spyOn(instance, 'setState').and.callThrough();
      wrapper.setProps({
        onError,
      });
    });

    it('should call props.onError if defined', () => {
      instance._handleError('error');

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith('error');
    });

    it('should set error to state', () => {
      instance._handleError('error');

      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledWith({
        encounteredError: 'error',
      });
    });
  });

  describe('_removeWidget() method', () => {
    let onWidgetUnmounting = jest.fn();

    beforeEach(() => {
      wrapper.setProps({
        onWidgetUnmounting,
      });
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

      expect(onWidgetUnmounting).toHaveBeenCalledTimes(1);
      expect(onWidgetUnmounting).toHaveBeenCalledWith(widget);
    });

    it('should remove event listeners before unmounting', () => {
      let offWidget = jest.fn();
      instance._widget = { name: 'name', unmount: jest.fn(), off: offWidget };

      instance._removeWidget();

      expect(offWidget).toHaveBeenCalledTimes(1);
      expect(offWidget).toHaveBeenCalledWith(
        '@merkur/plugin-error.error',
        instance._handleClientError
      );
    });

    it('should unmount widget and do cleanup', () => {
      spyOn(instance, '_clearCachedHtml').and.callThrough();

      let unmount = jest.fn();
      let widget = { name: 'name', unmount };
      instance._widget = widget;
      instance._html = 'html';

      expect(instance._widget).toBe(widget);
      expect(instance._html).toBe('html');

      instance._removeWidget();

      expect(unmount).toHaveBeenCalled();
      expect(unmount).toHaveBeenCalledTimes(1);
      expect(instance._clearCachedHtml).toHaveBeenCalledTimes(1);
      expect(instance._widget).toBe(null);
      expect(instance._html).toBe(null);
    });
  });

  describe('_loadWidgetAssets() method', () => {
    beforeEach(() => {
      spyOn(instance, '_handleError').and.stub();
      spyOn(instance, 'setState').and.callThrough();
    });

    it('should return if there are no widget properties', async () => {
      wrapper.setProps({ widgetProperties: null });

      await instance._loadWidgetAssets();

      expect(instance.props.widgetProperties).toBe(null);
      expect(MerkurIntegration.loadStyleAssets).not.toHaveBeenCalled();
      expect(MerkurIntegration.loadScriptAssets).not.toHaveBeenCalled();
    });

    it('should return if there is already existing widget instance', async () => {
      instance._widget = {};

      await instance._loadWidgetAssets();

      expect(instance.props.widgetProperties).toBe(widgetProperties);
      expect(MerkurIntegration.loadStyleAssets).not.toHaveBeenCalled();
      expect(MerkurIntegration.loadScriptAssets).not.toHaveBeenCalled();
    });

    it('should load widget assets and update the state', async () => {
      await instance._loadWidgetAssets();

      expect(instance.props.widgetProperties).toBe(widgetProperties);
      expect(MerkurIntegration.loadStyleAssets).toHaveBeenCalledTimes(1);
      expect(MerkurIntegration.loadScriptAssets).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledTimes(1);
      expect(instance.setState).toHaveBeenCalledWith(
        { assetsLoaded: true },
        expect.any(Function)
      );
    });

    it('should handle error occured during script asset loading', async () => {
      spyOn(MerkurIntegration, 'loadScriptAssets').mockImplementation(() =>
        Promise.reject('failed to load')
      );

      await instance._loadWidgetAssets();

      expect(instance.props.widgetProperties).toBe(widgetProperties);
      expect(MerkurIntegration.loadStyleAssets).toHaveBeenCalledTimes(1);
      expect(MerkurIntegration.loadScriptAssets).toHaveBeenCalledTimes(0);
      expect(instance.setState).not.toHaveBeenCalled();
      expect(instance._handleError).toHaveBeenCalledTimes(1);
      expect(instance._handleError).toHaveBeenCalledWith('failed to load');
    });

    it('should handle error occured during asset loading', async () => {
      spyOn(MerkurIntegration, 'loadStyleAssets').mockImplementation(() =>
        Promise.reject('failed to load')
      );

      await instance._loadWidgetAssets();

      expect(instance.props.widgetProperties).toBe(widgetProperties);
      expect(MerkurIntegration.loadStyleAssets).toHaveBeenCalledTimes(0);
      expect(MerkurIntegration.loadScriptAssets).toHaveBeenCalledTimes(1);
      expect(instance.setState).not.toHaveBeenCalled();
      expect(instance._handleError).toHaveBeenCalledTimes(1);
      expect(instance._handleError).toHaveBeenCalledWith('failed to load');
    });
  });
});
