import {
  createWidgetLoader,
  createPreviewConfig,
  createVanillaRenderer,
} from '../index';

import { getMerkur, createMerkurWidget, removeMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';

describe('Merkur tool storybook', () => {
  beforeEach(() => {
    removeMerkur();
  });

  afterEach(() => {
    removeMerkur();
  });

  describe('createWidgetLoader method', () => {
    let render;
    let widgetProperties;
    let storyArgs;

    beforeEach(() => {
      render = jest.fn();
      widgetProperties = {
        name: 'widget',
        version: '0.0.1',
        $plugins: [componentPlugin],
      };
      storyArgs = {
        story: 'StoryName',
        args: {
          widget: {
            props: {},
          },
        },
      };

      getMerkur().register({
        ...widgetProperties,
        createWidget: createMerkurWidget,
      });
    });

    it('should return empty widget when widget is not defined', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      delete storyArgs.args.widget;
      let { widget } = await loader(storyArgs);

      expect(widget).toEqual(null);
    });

    it('should return empty widget when args.widget is null', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget = null;
      let { widget } = await loader(storyArgs);

      expect(widget).toEqual(null);
    });

    it('should create widget when args.widget is an empty object (props is optional)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget = {};
      let { widget } = await loader(storyArgs);

      expect(widget.name).toEqual(widgetProperties.name);
      expect(widget.version).toEqual(widgetProperties.version);
    });

    it('should return widget instance when only state is provided (without props)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget = { state: { count: 42 } };
      let { widget } = await loader(storyArgs);

      expect(widget.name).toEqual(widgetProperties.name);
      expect(widget.version).toEqual(widgetProperties.version);
      expect(widget.state).toEqual({ count: 42 });
      expect(widget.props).toEqual({});
    });

    it('should keep default widget.state when state key is absent from mount args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget = { props: {} }; // no 'state' key
      const { widget } = await loader(storyArgs);

      // Without a 'state' key in args the loader must not overwrite the widget's
      // default state coming from componentPlugin, which is {}.
      expect(widget.state).toEqual({});
    });

    it('should not force widget.props when props key is absent from mount args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget = { state: {} }; // no 'props' key
      const { widget } = await loader(storyArgs);

      // Without a 'props' key in args the widget retains the natural default ({}
      // from componentPlugin) rather than being explicitly overwritten.
      expect(widget.props).toEqual({});
    });

    it('should return widget instance for defined props', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget } = await loader(storyArgs);

      expect(widget.name).toEqual(widgetProperties.name);
      expect(widget.version).toEqual(widgetProperties.version);
      expect(widget.props).toEqual(storyArgs.args.widget.props);
    });

    it('should rerender widget for update', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget } = await loader(storyArgs);
      await widget.setState({});

      expect(render).toHaveBeenCalledWith(widget);
    });

    it('should unmount previous widget if story is changed', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget } = await loader(storyArgs);
      jest.spyOn(widget, 'unmount').mockResolvedValue(undefined);
      storyArgs.story = 'AnotherStory';
      await loader(storyArgs);

      expect(widget.unmount).toHaveBeenCalled();
    });

    it('should reset lastStory even when unmount throws during story change', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      jest
        .spyOn(first, 'unmount')
        .mockRejectedValue(new Error('unmount failed'));

      storyArgs.story = 'AnotherStory';
      // The loader may propagate the unmount error, but it must still reset its
      // internal state so that the new story can mount cleanly.
      await expect(loader(storyArgs)).rejects.toThrow('unmount failed');

      // A subsequent call for the new story must NOT try to unmount the broken
      // widget again; lastStory should have been reset in the finally block.
      storyArgs.story = 'AnotherStory';
      storyArgs.args.widget = {};
      const { widget: second } = await loader(storyArgs);
      expect(second).not.toBe(first);
    });

    it('should define custom function on widget through story args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.customFunction = () => {};
      let { widget } = await loader(storyArgs);

      expect(typeof widget.customFunction === 'function').toBeTruthy();
    });

    it('should reuse widget instance on repeated calls for the same story when args are unchanged', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { counter: 0 };
      let { widget: first } = await loader(storyArgs);
      let { widget: second } = await loader(storyArgs);

      expect(second).toBe(first);
    });

    it('should mount a new widget with the updated state on repeated calls for the same story', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.state = { counter: 0 };
      let { widget } = await loader(storyArgs);
      jest.spyOn(widget, 'unmount').mockResolvedValue(undefined);
      expect(widget.state).toEqual({ counter: 0 });

      // Simulate Storybook Controls changing the state value
      storyArgs.args.widget.state = { counter: 42 };
      let { widget: next } = await loader(storyArgs);

      expect(next).not.toBe(widget);
      expect(widget.unmount).toHaveBeenCalled();
      expect(next.state).toEqual({ counter: 42 });
    });

    it('should mount a new widget with the updated props on repeated calls for the same story', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { label: 'original' };
      let { widget } = await loader(storyArgs);
      jest.spyOn(widget, 'unmount').mockResolvedValue(undefined);
      expect(widget.props).toEqual({ label: 'original' });

      // Simulate Storybook Controls changing the props value
      storyArgs.args.widget.props = { label: 'updated' };
      let { widget: next } = await loader(storyArgs);

      expect(next).not.toBe(widget);
      expect(widget.unmount).toHaveBeenCalled();
      expect(next.props).toEqual({ label: 'updated' });
    });

    it('should mount a new widget with default state when state key is absent in subsequent args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.state = { counter: 5 };
      await loader(storyArgs);

      // Second call without a 'state' key mounts a new widget with default state
      delete storyArgs.args.widget.state;
      let { widget: next } = await loader(storyArgs);

      expect(next.state).toEqual({});
    });

    it('should mount a new widget with default props when props key is absent in subsequent args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { label: 'kept' };
      await loader(storyArgs);

      // Second call without a 'props' key mounts a new widget with default props
      delete storyArgs.args.widget.props;
      let { widget: next } = await loader(storyArgs);

      expect(next.props).toEqual({});
    });

    it('should create a new widget instance when props key is absent from story args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      // props is optional — widget is still created without it
      delete storyArgs.args.widget.props;
      let { widget } = await loader(storyArgs);

      expect(widget.name).toEqual(widgetProperties.name);
      // Second call for the same story reuses the existing widget instance.
      let { widget: next } = await loader(storyArgs);
      expect(next).toBe(widget);
    });

    it('should create a new widget instance when the same story args are mutated in place', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.state = { counter: 0 };
      let { widget } = await loader(storyArgs);
      jest.spyOn(widget, 'unmount').mockResolvedValue(undefined);

      storyArgs.args.widget.state.counter = 7;
      let { widget: next } = await loader(storyArgs);

      expect(next).not.toBe(widget);
      expect(widget.unmount).toHaveBeenCalled();
      expect(next.state).toEqual({ counter: 7 });
    });
  });

  describe('createPreviewConfig method', () => {
    let widgetProperties;

    beforeEach(() => {
      widgetProperties = {
        name: 'widget',
        version: '0.0.1',
        $plugins: [componentPlugin],
      };
    });

    it('should register the widget and return a loaders array', () => {
      const config = createPreviewConfig({
        widgetProperties,
        createWidget: createMerkurWidget,
      });

      expect(Array.isArray(config.loaders)).toBe(true);
      expect(typeof config.loaders[0]).toBe('function');
      expect(getMerkur().$in.widgetFactory).toBeDefined();
    });

    it('should silently skip registration when widget is already registered', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      createPreviewConfig({
        widgetProperties,
        createWidget: createMerkurWidget,
      });
      createPreviewConfig({
        widgetProperties,
        createWidget: createMerkurWidget,
      });

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should throw when options is null', () => {
      expect(() => createPreviewConfig(null)).toThrow('must be type of object');
    });

    it('should throw when widgetProperties is missing', () => {
      expect(() => createPreviewConfig({})).toThrow('"widgetProperties"');
    });

    it('should throw when widgetProperties.name is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { version: '0.0.1' } }),
      ).toThrow('widgetProperties.name');
    });

    it('should throw when widgetProperties.version is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { name: 'widget' } }),
      ).toThrow('widgetProperties.version');
    });

    it('should throw when createWidget is not a function', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties, createWidget: 'invalid' }),
      ).toThrow('"createWidget" must be a function');
    });

    it('loaders[0] should create a functioning widget', async () => {
      const config = createPreviewConfig({
        widgetProperties,
        createWidget: createMerkurWidget,
      });

      const loader = config.loaders[0];
      const { widget } = await loader({
        story: 'TestStory',
        args: { widget: { props: {} } },
      });

      expect(widget.name).toEqual(widgetProperties.name);
      expect(widget.version).toEqual(widgetProperties.version);
      await widget.unmount();
    });
  });

  describe('createVanillaRenderer method', () => {
    let mockWidget;
    let viewFn;

    beforeEach(() => {
      mockWidget = { state: { count: 0 }, props: {} };
      viewFn = jest.fn((w) => `<span>${w.state.count}</span>`);
    });

    it('should render when the story provides component function', () => {
      const { render } = createVanillaRenderer();
      const container = render(
        { component: viewFn },
        { loaded: { widget: mockWidget } },
      );

      expect(container.innerHTML).toBe('<span>0</span>');
    });

    describe('render()', () => {
      it('should return a container with widget HTML when widget is loaded', () => {
        const { render } = createVanillaRenderer();
        const container = render(
          { component: viewFn },
          { loaded: { widget: mockWidget } },
        );

        expect(container.innerHTML).toBe('<span>0</span>');
      });

      it('should return a placeholder when widget is not loaded', () => {
        const { render } = createVanillaRenderer();
        const container = render({ component: viewFn }, { loaded: {} });

        expect(container.textContent).toBe('Loading widget...');
      });

      it('should throw when no view can be resolved', () => {
        const { render } = createVanillaRenderer();

        expect(() => render({}, { loaded: { widget: mockWidget } })).toThrow(
          'createVanillaRenderer: args.component must be a function.',
        );
      });

      it('should call widget.bindEventListeners with the container on render', () => {
        const bindEventsSpy = jest.fn();
        mockWidget.bindEventListeners = bindEventsSpy;
        const { render } = createVanillaRenderer();
        const container = render(
          { component: viewFn },
          { loaded: { widget: mockWidget } },
        );

        expect(bindEventsSpy).toHaveBeenCalledWith(container);
      });

      it('should not invoke bindEventListeners defined on viewFunction', () => {
        const viewFnBindSpy = jest.fn();
        viewFn.bindEventListeners = viewFnBindSpy;
        const { render } = createVanillaRenderer();

        render({ component: viewFn }, { loaded: { widget: mockWidget } });

        expect(viewFnBindSpy).not.toHaveBeenCalled();
      });

      it('should throw when component returns a non-string', () => {
        const { render } = createVanillaRenderer();
        expect(() =>
          render({ component: () => 42 }, { loaded: { widget: mockWidget } }),
        ).toThrow('viewFunction must return an HTML string');
      });
    });

    describe('update()', () => {
      it('should re-render widget in the same container without creating a new one', () => {
        const { render, update } = createVanillaRenderer();
        const container = render(
          { component: viewFn },
          { loaded: { widget: mockWidget } },
        );

        mockWidget.state.count = 5;
        update(mockWidget);

        expect(container.innerHTML).toBe('<span>5</span>');
        expect(viewFn).toHaveBeenCalledTimes(2);
      });

      it('should re-bind events on update', () => {
        const bindEventListeners = jest.fn();
        mockWidget.bindEventListeners = bindEventListeners;
        const { render, update } = createVanillaRenderer();
        render({ component: viewFn }, { loaded: { widget: mockWidget } });
        update(mockWidget);

        expect(bindEventListeners).toHaveBeenCalledTimes(2);
      });

      it('should call widget.bindEventListeners with the container on update', () => {
        const bindEventListeners = jest.fn();
        mockWidget.bindEventListeners = bindEventListeners;
        const { render, update } = createVanillaRenderer();
        const container = render(
          { component: viewFn },
          { loaded: { widget: mockWidget } },
        );
        update(mockWidget);

        expect(bindEventListeners).toHaveBeenCalledTimes(2);
        expect(bindEventListeners).toHaveBeenLastCalledWith(container);
      });

      it('should not invoke widget.View.bindEvents — binding is via widget.bindEventListeners', () => {
        const bindEventsSpy = jest.fn();
        mockWidget.View = { bindEvents: bindEventsSpy };
        const { render, update } = createVanillaRenderer();
        render({ component: viewFn }, { loaded: { widget: mockWidget } });
        update(mockWidget);

        expect(bindEventsSpy).not.toHaveBeenCalled();
      });

      it('should do nothing when called with an unknown widget', () => {
        const { update } = createVanillaRenderer();
        expect(() => update({ state: {} })).not.toThrow();
      });
    });
  });
});
