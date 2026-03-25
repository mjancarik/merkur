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

    it('should reuse the same widget instance on repeated calls for the same story', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { counter: 0 };
      let { widget: first } = await loader(storyArgs);
      let { widget: second } = await loader(storyArgs);

      expect(second).toBe(first);
    });

    it('should update widget state when Controls panel changes state for the same story', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.state = { counter: 0 };
      let { widget } = await loader(storyArgs);
      expect(widget.state).toEqual({ counter: 0 });

      // Simulate Storybook Controls changing the state value
      storyArgs.args.widget.state = { counter: 42 };
      let { widget: same } = await loader(storyArgs);

      expect(same).toBe(widget);
      expect(same.state).toEqual({ counter: 42 });
    });

    it('should update widget props when Controls panel changes props for the same story', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { label: 'original' };
      let { widget } = await loader(storyArgs);
      expect(widget.props).toEqual({ label: 'original' });

      // Simulate Storybook Controls changing the props value
      storyArgs.args.widget.props = { label: 'updated' };
      let { widget: same } = await loader(storyArgs);

      expect(same).toBe(widget);
      expect(same.props).toEqual({ label: 'updated' });
    });

    it('should not overwrite widget state when state key is absent in subsequent args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.state = { counter: 5 };
      let { widget } = await loader(storyArgs);

      // Second call without a 'state' key must not reset widget state
      delete storyArgs.args.widget.state;
      await loader(storyArgs);

      expect(widget.state).toEqual({ counter: 5 });
    });

    it('should not overwrite widget props when props key is absent in subsequent args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { label: 'kept' };
      let { widget } = await loader(storyArgs);

      // Second call without a 'props' key must not reset widget props
      delete storyArgs.args.widget.props;
      await loader(storyArgs);

      expect(widget.props).toEqual({ label: 'kept' });
    });

    it('should reuse widget instance when props key is absent from story args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      // props is optional — widget is still created without it
      delete storyArgs.args.widget.props;
      let { widget } = await loader(storyArgs);

      expect(widget.name).toEqual(widgetProperties.name);
      // Second call for the same story must reuse the same widget instance.
      let { widget: same } = await loader(storyArgs);
      expect(same).toBe(widget);
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

    it('should emit console.warn when registering the same widget twice', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      createPreviewConfig({
        widgetProperties,
        createWidget: createMerkurWidget,
      });
      createPreviewConfig({
        widgetProperties,
        createWidget: createMerkurWidget,
      });

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toMatch(/already registered/);
      warnSpy.mockRestore();
    });

    it('should throw when options is null', () => {
      expect(() => createPreviewConfig(null)).toThrow(
        'createPreviewConfig: "options" argument must be a non-null object.',
      );
    });

    it('should throw when widgetProperties is missing', () => {
      expect(() => createPreviewConfig({})).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version"',
      );
    });

    it('should throw when widgetProperties.name is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { version: '0.0.1' } }),
      ).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version"',
      );
    });

    it('should throw when widgetProperties.version is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { name: 'widget' } }),
      ).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version"',
      );
    });

    it('should throw when createWidget is not a function', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties, createWidget: 'invalid' }),
      ).toThrow(
        'createPreviewConfig: "createWidget" option must be a function when provided.',
      );
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

    it('should throw when options is missing', () => {
      expect(() => createVanillaRenderer()).toThrow(
        'createVanillaRenderer: options must be a non-null object.',
      );
    });

    it('should throw when ViewComponent is missing', () => {
      expect(() => createVanillaRenderer({})).toThrow(
        'createVanillaRenderer: "ViewComponent" option is required.',
      );
    });

    it('should throw when bindEvents is not a function', () => {
      expect(() =>
        createVanillaRenderer({ ViewComponent: viewFn, bindEvents: 'invalid' }),
      ).toThrow(
        'createVanillaRenderer: "bindEvents" option must be a function when provided.',
      );
    });

    describe('render()', () => {
      it('should return a container with widget HTML when widget is loaded', () => {
        const { render } = createVanillaRenderer({ ViewComponent: viewFn });
        const container = render({}, { loaded: { widget: mockWidget } });

        expect(container.innerHTML).toBe('<span>0</span>');
      });

      it('should return a placeholder when widget is not loaded', () => {
        const { render } = createVanillaRenderer({ ViewComponent: viewFn });
        const container = render({}, { loaded: {} });

        expect(container.textContent).toBe('Loading widget...');
      });

      it('should call bindEvents after rendering when provided', () => {
        const bindEvents = jest.fn();
        const { render } = createVanillaRenderer({
          ViewComponent: viewFn,
          bindEvents,
        });
        render({}, { loaded: { widget: mockWidget } });

        expect(bindEvents).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          mockWidget,
        );
      });

      it('should fall back to widget.View.bindEvents when no bindEvents option', () => {
        const bindEventsSpy = jest.fn();
        mockWidget.View = { bindEvents: bindEventsSpy };
        const { render } = createVanillaRenderer({ ViewComponent: viewFn });
        render({}, { loaded: { widget: mockWidget } });

        expect(bindEventsSpy).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          mockWidget,
        );
      });

      it('should use the default key from a ViewComponent map', () => {
        const defaultFn = jest.fn(() => '<p>default</p>');
        const { render } = createVanillaRenderer({
          ViewComponent: { default: defaultFn },
        });
        render({}, { loaded: { widget: mockWidget } });

        expect(defaultFn).toHaveBeenCalledWith(mockWidget);
      });

      it('should use args.component string key to select from a ViewComponent map', () => {
        const altFn = jest.fn(() => '<p>alt</p>');
        const { render } = createVanillaRenderer({
          ViewComponent: { default: viewFn, alt: altFn },
        });
        render({ component: 'alt' }, { loaded: { widget: mockWidget } });

        expect(altFn).toHaveBeenCalledWith(mockWidget);
        expect(viewFn).not.toHaveBeenCalled();
      });

      it('should throw when args.component string key is not found in ViewComponent map', () => {
        const { render } = createVanillaRenderer({
          ViewComponent: { default: viewFn },
        });
        expect(() =>
          render({ component: 'missing' }, { loaded: { widget: mockWidget } }),
        ).toThrow('not found in ViewComponent map');
      });

      it('should use args.component function when ViewComponent is a function', () => {
        const overrideFn = jest.fn(() => '<p>override</p>');
        const { render } = createVanillaRenderer({ ViewComponent: viewFn });
        render({ component: overrideFn }, { loaded: { widget: mockWidget } });

        expect(overrideFn).toHaveBeenCalledWith(mockWidget);
        expect(viewFn).not.toHaveBeenCalled();
      });

      it('should throw when ViewComponent returns a non-string', () => {
        const { render } = createVanillaRenderer({ ViewComponent: () => 42 });
        expect(() => render({}, { loaded: { widget: mockWidget } })).toThrow(
          'viewFunction must return an HTML string',
        );
      });
    });

    describe('update()', () => {
      it('should re-render widget in the same container without creating a new one', () => {
        const { render, update } = createVanillaRenderer({
          ViewComponent: viewFn,
        });
        const container = render({}, { loaded: { widget: mockWidget } });

        mockWidget.state.count = 5;
        update(mockWidget);

        expect(container.innerHTML).toBe('<span>5</span>');
        expect(viewFn).toHaveBeenCalledTimes(2);
      });

      it('should re-bind events on update', () => {
        const bindEvents = jest.fn();
        const { render, update } = createVanillaRenderer({
          ViewComponent: viewFn,
          bindEvents,
        });
        render({}, { loaded: { widget: mockWidget } });
        update(mockWidget);

        expect(bindEvents).toHaveBeenCalledTimes(2);
      });

      it('should do nothing when called with an unknown widget', () => {
        const { update } = createVanillaRenderer({ ViewComponent: viewFn });
        expect(() => update({ state: {} })).not.toThrow();
      });
    });
  });
});
