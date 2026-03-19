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

    it('should reuse the same widget when the same story is called again', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      let { widget: second } = await loader(storyArgs);

      expect(second).toBe(first);
    });

    it('should update props when reusing widget for the same story', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      await loader(storyArgs);

      storyArgs.args.widget.props = { title: 'Updated' };
      let { widget } = await loader(storyArgs);

      expect(widget.props).toEqual({ title: 'Updated' });
    });

    it('should update state and trigger two renders when reusing widget for the same story', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      await loader(storyArgs);
      render.mockClear();

      storyArgs.args.widget.state = { count: 42 };
      await loader(storyArgs);

      // setProps triggers one render (via load+update), then setState triggers a
      // second render to apply the Storybook state that load() may have overwritten.
      expect(render).toHaveBeenCalledTimes(2);
    });

    it('should call setProps when both setState and setProps are available for same story reuse', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      jest.spyOn(first, 'setProps');

      storyArgs.args.widget.props = { title: 'NewTitle' };
      let { widget } = await loader(storyArgs);

      expect(first.setProps).toHaveBeenCalledWith({ title: 'NewTitle' });
      expect(widget).toBe(first);
    });

    it('should call setState with story state after setProps when both are available', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      jest.spyOn(first, 'setState');

      storyArgs.args.widget.state = { count: 99 };
      storyArgs.args.widget.props = { title: 'Updated' };
      await loader(storyArgs);

      expect(first.setState).toHaveBeenCalledWith({ count: 99 });
    });

    it('should preserve story state when setProps triggers load() that overwrites state (hasSetProps && hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      jest.spyOn(first, 'setProps').mockImplementation(async () => {
        first.state = { overwritten: true };
      });
      jest.spyOn(first, 'setState').mockImplementation(async (newState) => {
        first.state = newState;
      });

      storyArgs.args.widget.state = { count: 99 };
      await loader(storyArgs);

      expect(first.state).toEqual({ count: 99 });
    });

    it('should clear state before calling setState to avoid merging with load()-generated keys (hasSetProps && hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);

      // Simulate setProps/load() adding keys to state
      jest.spyOn(first, 'setProps').mockImplementation(async () => {
        first.state = { loadGenerated: 'stale', anotherKey: 'old' };
      });

      // Track what state was present when setState was called
      let stateBeforeSetState;
      jest.spyOn(first, 'setState').mockImplementation(async (newState) => {
        stateBeforeSetState = { ...first.state };
        first.state = { ...first.state, ...newState };
      });

      storyArgs.args.widget.state = { count: 42 };
      await loader(storyArgs);

      // State should have been cleared ({}) before setState was called
      expect(stateBeforeSetState).toEqual({});
      // Final state should only contain what setState received, not load()-generated keys
      expect(first.state).toEqual({ count: 42 });
    });

    it('should preserve story state when only setProps is available and load() overwrites state (hasSetProps && !hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      jest.spyOn(first, 'setProps').mockImplementation(async () => {
        first.state = { overwritten: true };
      });
      first.setState = undefined;

      storyArgs.args.widget.state = { count: 42 };
      await loader(storyArgs);

      expect(first.state).toEqual({ count: 42 });
    });

    it('should call render after applying state when only setProps is available (hasSetProps && !hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setState = undefined;
      render.mockClear();

      storyArgs.args.widget.state = { count: 42 };
      await loader(storyArgs);

      // setProps triggers one render (via load+update), then the explicit
      // lifeCycle.update() call after state assignment triggers a second render.
      expect(render).toHaveBeenCalledTimes(2);
      expect(render).toHaveBeenCalledWith(first);
    });

    it('should not call setState when state key is absent from reuse args (hasSetProps && hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      // Mock setProps so its real implementation cannot mutate widget.state.
      jest.spyOn(first, 'setProps').mockResolvedValue(undefined);
      first.state = { fromPreviousLoad: true };
      jest.spyOn(first, 'setState');

      storyArgs.args.widget = { props: { updated: true } }; // no 'state' key
      await loader(storyArgs);

      expect(first.setState).not.toHaveBeenCalled();
      expect(first.state).toEqual({ fromPreviousLoad: true });
    });

    it('should not call setProps when props key is absent from reuse args (hasSetProps && hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.props = { fromPreviousLoad: true };
      jest.spyOn(first, 'setProps');

      storyArgs.args.widget = { state: { count: 1 } }; // no 'props' key
      await loader(storyArgs);

      expect(first.setProps).not.toHaveBeenCalled();
      expect(first.props).toEqual({ fromPreviousLoad: true });
    });

    it('should not call setState and preserve state when state key is absent (hasSetState && !hasSetProps)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setProps = undefined; // force hasSetState && !hasSetProps branch
      first.state = { fromPreviousLoad: true };
      jest.spyOn(first, 'setState');

      storyArgs.args.widget = { props: { updated: true } }; // no 'state' key
      await loader(storyArgs);

      expect(first.setState).not.toHaveBeenCalled();
      expect(first.state).toEqual({ fromPreviousLoad: true });
    });

    it('should call lifeCycle.update when only props change (hasSetState && !hasSetProps)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setProps = undefined; // force hasSetState && !hasSetProps branch
      const lifeCycleUpdate = jest.fn().mockResolvedValue(undefined);
      first.$in.component.lifeCycle.update = lifeCycleUpdate;
      render.mockClear();

      storyArgs.args.widget = { props: { title: 'New' } }; // no 'state' key
      await loader(storyArgs);

      expect(lifeCycleUpdate).toHaveBeenCalledWith(first);
      expect(first.props).toEqual({ title: 'New' });
    });

    it('should call render when only props change and lifeCycle.update is unavailable (hasSetState && !hasSetProps)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setProps = undefined; // force hasSetState && !hasSetProps branch
      first.$in.component.lifeCycle.update = undefined;
      render.mockClear();

      storyArgs.args.widget = { props: { title: 'New' } }; // no 'state' key
      await loader(storyArgs);

      expect(render).toHaveBeenCalledWith(first);
      expect(first.props).toEqual({ title: 'New' });
    });

    it('should not trigger a render when neither props nor state key is present (hasSetState && !hasSetProps)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setProps = undefined; // force hasSetState && !hasSetProps branch
      const lifeCycleUpdate = jest.fn().mockResolvedValue(undefined);
      first.$in.component.lifeCycle.update = lifeCycleUpdate;
      render.mockClear();

      storyArgs.args.widget = {}; // no 'state' key, no 'props' key
      await loader(storyArgs);

      expect(lifeCycleUpdate).not.toHaveBeenCalled();
      expect(render).not.toHaveBeenCalled();
    });

    it('should not update props when props key is absent (hasSetState && !hasSetProps)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setProps = undefined; // force hasSetState && !hasSetProps branch
      first.props = { fromPreviousLoad: true };

      storyArgs.args.widget = { state: { count: 1 } }; // no 'props' key
      await loader(storyArgs);

      expect(first.props).toEqual({ fromPreviousLoad: true });
    });

    it('should update both props directly and state via setState when both keys present (hasSetState && !hasSetProps)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setProps = undefined; // force hasSetState && !hasSetProps branch
      render.mockClear();

      storyArgs.args.widget = {
        props: { title: 'NewTitle' },
        state: { count: 7 },
      };
      const { widget } = await loader(storyArgs);

      // Props are set directly (no setProps hook), state goes through setState.
      expect(widget.props).toEqual({ title: 'NewTitle' });
      expect(widget.state).toEqual({ count: 7 });
      // setState triggers lifeCycle.update = render(widget)
      expect(render).toHaveBeenCalledWith(first);
    });

    it('should not call setProps when props key is absent (hasSetProps && !hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setState = undefined; // force hasSetProps && !hasSetState branch
      first.props = { fromPreviousLoad: true };
      jest.spyOn(first, 'setProps');

      storyArgs.args.widget = { state: { count: 1 } }; // no 'props' key
      await loader(storyArgs);

      expect(first.setProps).not.toHaveBeenCalled();
      expect(first.props).toEqual({ fromPreviousLoad: true });
    });

    it('should not leave widget.state undefined after setProps when no load() lifecycle is defined (hasSetProps && !hasSetState)', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      // Initial mount with a widget that has no load() lifecycle (widgetProperties
      // in beforeEach has no load(), so componentPlugin.load() returns undefined
      // and sets widget.state = undefined, which the creation path guards against).
      let { widget: first } = await loader(storyArgs);
      first.setState = undefined; // force hasSetProps && !hasSetState branch

      storyArgs.args.widget = { props: { updated: true } }; // props-only update
      await loader(storyArgs);

      // With no load() lifecycle, setProps→load() would set widget.state =
      // undefined. The guard must restore it to {} to prevent null-pointer crashes
      // in render callbacks that access widget.state directly.
      expect(first.state).not.toBeNull();
      expect(first.state).not.toBeUndefined();
    });

    it('should not call setState and setProps does not explicitly preserve state when state key is absent (hasSetProps && !hasSetState)', async () => {
      // NOTE: This test mocks setProps to be a no-op so it verifies the
      // Storybook loader itself does not call setState and does not overwrite
      // state when the story args have no 'state' key AND setProps internally
      // does nothing (mock). In real usage, setProps triggers load() which
      // re-derives widget.state — the previous state is NOT preserved. The
      // mock here intentionally isolates the loader's own behaviour.
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setState = undefined; // force hasSetProps && !hasSetState branch
      // Mock setProps so its real implementation cannot mutate widget.state.
      jest.spyOn(first, 'setProps').mockResolvedValue(undefined);
      first.state = { fromPreviousLoad: true };

      storyArgs.args.widget = { props: { updated: true } }; // no 'state' key
      await loader(storyArgs);

      expect(first.state).toEqual({ fromPreviousLoad: true });
    });

    it('should preserve state when state key is absent and neither setter is available', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setState = undefined;
      first.setProps = undefined;
      first.state = { fromPreviousLoad: true };

      storyArgs.args.widget = { props: { updated: true } }; // no 'state' key
      await loader(storyArgs);

      expect(first.state).toEqual({ fromPreviousLoad: true });
    });

    it('should preserve props when props key is absent and neither setter is available', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setState = undefined;
      first.setProps = undefined;
      first.props = { fromPreviousLoad: true };

      storyArgs.args.widget = { state: { count: 1 } }; // no 'props' key
      await loader(storyArgs);

      expect(first.props).toEqual({ fromPreviousLoad: true });
    });

    it('should not trigger a render when neither setter is available and no state or props key is provided', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      let { widget: first } = await loader(storyArgs);
      first.setState = undefined;
      first.setProps = undefined;
      const lifeCycleUpdate = jest.fn().mockResolvedValue(undefined);
      first.$in.component.lifeCycle.update = lifeCycleUpdate;
      render.mockClear();

      storyArgs.args.widget = {}; // no 'state' key, no 'props' key
      await loader(storyArgs);

      expect(lifeCycleUpdate).not.toHaveBeenCalled();
      expect(render).not.toHaveBeenCalled();
    });

    it('should throw when widget is created without component plugin', async () => {
      const propertiesWithoutPlugin = {
        name: 'no-plugin-widget',
        version: '0.0.1',
        $plugins: [],
      };
      getMerkur().register({
        ...propertiesWithoutPlugin,
        createWidget: createMerkurWidget,
      });
      const loader = createWidgetLoader({
        widgetProperties: propertiesWithoutPlugin,
        render,
      });

      await expect(loader(storyArgs)).rejects.toThrow(
        'createWidgetLoader: widget must be created with a component plugin',
      );
    });

    it('should not throw when render is omitted and use a no-op', () => {
      expect(() => createWidgetLoader({ widgetProperties })).not.toThrow();
    });

    it('should throw when render is provided but not a function', () => {
      expect(() =>
        createWidgetLoader({ widgetProperties, render: 'not-a-function' }),
      ).toThrow(
        'createWidgetLoader: "render" option must be a function when provided.',
      );

      expect(() =>
        createWidgetLoader({ widgetProperties, render: 42 }),
      ).toThrow(
        'createWidgetLoader: "render" option must be a function when provided.',
      );
    });

    it('should throw for null or non-object options', () => {
      expect(() => createWidgetLoader(null)).toThrow(
        'createWidgetLoader: "options" argument must be a non-null object.',
      );

      expect(() => createWidgetLoader('string')).toThrow(
        'createWidgetLoader: "options" argument must be a non-null object.',
      );
    });

    it('should throw when widgetProperties is not an object', () => {
      expect(() =>
        createWidgetLoader({ widgetProperties: null, render }),
      ).toThrow(
        'createWidgetLoader: "widgetProperties" option is required and must be an object.',
      );

      expect(() =>
        createWidgetLoader({ widgetProperties: 'string', render }),
      ).toThrow(
        'createWidgetLoader: "widgetProperties" option is required and must be an object.',
      );

      expect(() =>
        createWidgetLoader({ widgetProperties: undefined, render }),
      ).toThrow(
        'createWidgetLoader: "widgetProperties" option is required and must be an object.',
      );
    });
  });

  describe('createPreviewConfig method', () => {
    let widgetProperties;

    beforeEach(() => {
      widgetProperties = {
        name: 'preview-widget',
        version: '1.0.0',
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return an object with a loaders array containing one loader function', () => {
      const config = createPreviewConfig({ widgetProperties });

      expect(Array.isArray(config.loaders)).toBe(true);
      expect(config.loaders).toHaveLength(1);
      expect(typeof config.loaders[0]).toBe('function');
    });

    it('should register the widget with Merkur', () => {
      createPreviewConfig({ widgetProperties });

      expect(
        getMerkur().isRegistered(
          widgetProperties.name + widgetProperties.version,
        ),
      ).toBe(true);
    });

    it('should use a custom createWidget factory when provided', () => {
      const createWidget = jest.fn();
      const merkur = getMerkur();
      jest.spyOn(merkur, 'register');

      createPreviewConfig({ widgetProperties, createWidget });

      expect(
        merkur.isRegistered(widgetProperties.name + widgetProperties.version),
      ).toBe(true);
      expect(merkur.register).toHaveBeenCalledWith(
        expect.objectContaining({ createWidget }),
      );
    });

    it('should throw when widgetProperties.name is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { version: '1.0.0' } }),
      ).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version" as non-empty strings.',
      );
    });

    it('should throw when widgetProperties.version is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { name: 'preview-widget' } }),
      ).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version" as non-empty strings.',
      );
    });

    it('should throw when widgetProperties is not provided', () => {
      expect(() => createPreviewConfig({})).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version" as non-empty strings.',
      );
    });

    it('should warn when the same widget name is registered again (HMR re-execution guard)', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      createPreviewConfig({ widgetProperties });
      // Simulate HMR: preview.mjs is re-evaluated and createPreviewConfig is
      // called again for the same widget without a removeMerkur() in between.
      createPreviewConfig({ widgetProperties });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          `widget "${widgetProperties.name}" is already registered`,
        ),
      );
    });

    it('should not warn on first registration', () => {
      const warnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});
      warnMock.mockClear(); // clear any calls accumulated from earlier tests

      createPreviewConfig({ widgetProperties });

      expect(warnMock).not.toHaveBeenCalled();
    });
  });

  describe('createVanillaRenderer method', () => {
    let mockWidget;
    let mockViewFunction;
    let mockBindEvents;

    beforeEach(() => {
      mockWidget = {
        state: { count: 0 },
        props: { title: 'Test' },
        setState: jest.fn(),
      };
      mockViewFunction = jest.fn(
        (widget) => `<div>Count: ${widget.state.count}</div>`,
      );
      mockBindEvents = jest.fn();
    });

    it('should render empty widget when no widget is provided', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });

      const container = renderer.render({}, { loaded: {} });

      expect(container.tagName).toBe('DIV');
      expect(container.textContent).toBe('Loading widget...');
    });

    it('should render widget with ViewComponent as function', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });

      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      expect(container.tagName).toBe('DIV');
      expect(container.innerHTML).toBe('<div>Count: 0</div>');
      expect(mockViewFunction).toHaveBeenCalledWith(mockWidget);
    });

    it('should render widget with ViewComponent as object with default', () => {
      const defaultView = jest.fn(() => '<div>Default view</div>');
      const renderer = createVanillaRenderer({
        ViewComponent: { default: defaultView },
      });

      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      expect(container.innerHTML).toBe('<div>Default view</div>');
      expect(defaultView).toHaveBeenCalledWith(mockWidget);
    });

    it('should use args.viewComponent to select from ViewComponent object', () => {
      const customView = jest.fn(() => '<div>Custom view</div>');
      const renderer = createVanillaRenderer({
        ViewComponent: {
          default: mockViewFunction,
          customView,
        },
      });

      const container = renderer.render(
        { viewComponent: 'customView' },
        { loaded: { widget: mockWidget } },
      );

      expect(container.innerHTML).toBe('<div>Custom view</div>');
      expect(customView).toHaveBeenCalledWith(mockWidget);
      expect(mockViewFunction).not.toHaveBeenCalled();
    });

    it('should use args.component as string to select from ViewComponent object', () => {
      const componentView = jest.fn(() => '<div>Component view</div>');
      const renderer = createVanillaRenderer({
        ViewComponent: {
          default: mockViewFunction,
          componentView,
        },
      });

      const container = renderer.render(
        { component: 'componentView' },
        { loaded: { widget: mockWidget } },
      );

      expect(container.innerHTML).toBe('<div>Component view</div>');
      expect(componentView).toHaveBeenCalledWith(mockWidget);
    });

    it('should throw when args.component string key is not in ViewComponent map', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: {
          default: mockViewFunction,
        },
      });

      expect(() =>
        renderer.render(
          { component: 'nonExistentView' },
          { loaded: { widget: mockWidget } },
        ),
      ).toThrow(
        'createVanillaRenderer: component key "nonExistentView" not found in ViewComponent map',
      );
    });

    it('should use args.component as function', () => {
      const inlineComponent = jest.fn(() => '<div>Inline component</div>');
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });

      const container = renderer.render(
        { component: inlineComponent },
        { loaded: { widget: mockWidget } },
      );

      expect(container.innerHTML).toBe('<div>Inline component</div>');
      expect(inlineComponent).toHaveBeenCalledWith(mockWidget);
      expect(mockViewFunction).not.toHaveBeenCalled();
    });

    it('should call bindEvents if provided in options', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
        bindEvents: mockBindEvents,
      });

      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      expect(mockBindEvents).toHaveBeenCalledWith(container, mockWidget);
    });

    it('should call widget.View.bindEvents if no bindEvents provided', () => {
      const widgetBindEvents = jest.fn();
      mockWidget.View = { bindEvents: widgetBindEvents };

      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });

      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      expect(widgetBindEvents).toHaveBeenCalledWith(container, mockWidget);
    });

    it('should not call widget.View.bindEvents when it is not a function', () => {
      mockWidget.View = { bindEvents: 'not-a-function' };
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });
      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      // No throw, bindEvents silently skipped
      expect(container).toBeDefined();
    });

    it('should prioritize options.bindEvents over widget.View.bindEvents', () => {
      const widgetBindEvents = jest.fn();
      mockWidget.View = { bindEvents: widgetBindEvents };

      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
        bindEvents: mockBindEvents,
      });

      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      expect(mockBindEvents).toHaveBeenCalledWith(container, mockWidget);
      expect(widgetBindEvents).not.toHaveBeenCalled();
    });

    it('should re-render widget when update is called', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
        bindEvents: mockBindEvents,
      });

      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      // Clear previous calls
      mockViewFunction.mockClear();
      mockBindEvents.mockClear();

      // Update widget state
      mockWidget.state.count = 5;

      // Call update
      renderer.update(mockWidget);

      expect(container.innerHTML).toBe('<div>Count: 5</div>');
      expect(mockViewFunction).toHaveBeenCalledWith(mockWidget);
      expect(mockBindEvents).toHaveBeenCalledWith(container, mockWidget);
    });

    it('should handle update gracefully when called before render', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });

      expect(() => renderer.update()).not.toThrow();
      expect(mockViewFunction).not.toHaveBeenCalled();
    });

    it('should preserve references across multiple updates', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });

      const container = renderer.render({}, { loaded: { widget: mockWidget } });

      mockWidget.state.count = 1;
      renderer.update(mockWidget);
      expect(container.innerHTML).toBe('<div>Count: 1</div>');

      mockWidget.state.count = 2;
      renderer.update(mockWidget);
      expect(container.innerHTML).toBe('<div>Count: 2</div>');

      mockWidget.state.count = 3;
      renderer.update(mockWidget);
      expect(container.innerHTML).toBe('<div>Count: 3</div>');
    });

    it('should throw when options is null', () => {
      expect(() => createVanillaRenderer(null)).toThrow(
        'createVanillaRenderer: options must be a non-null object.',
      );
    });

    it('should throw when options is not an object', () => {
      expect(() => createVanillaRenderer('string')).toThrow(
        'createVanillaRenderer: options must be a non-null object.',
      );
    });

    it('should throw when ViewComponent is missing', () => {
      expect(() => createVanillaRenderer({})).toThrow(
        'createVanillaRenderer: "ViewComponent" option is required.',
      );
    });

    it('should throw when ViewComponent object has no callable default', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: { default: 'not-a-function' },
      });

      expect(() =>
        renderer.render({}, { loaded: { widget: mockWidget } }),
      ).toThrow(
        'createVanillaRenderer: ViewComponent must be a function or an object with a callable "default" property',
      );
    });

    it('should throw when ViewComponent is a function and args.viewComponent is provided', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: mockViewFunction,
      });

      expect(() =>
        renderer.render(
          { viewComponent: 'someKey' },
          { loaded: { widget: mockWidget } },
        ),
      ).toThrow(
        'createVanillaRenderer: "viewComponent" key cannot be used when ViewComponent is a function; pass a component function directly via args.component instead.',
      );
    });

    it('should throw when args.viewComponent key maps to a non-function', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: { length: 42 },
      });

      expect(() =>
        renderer.render(
          { viewComponent: 'length' },
          { loaded: { widget: mockWidget } },
        ),
      ).toThrow(
        'createVanillaRenderer: viewComponent key "length" not found in ViewComponent map or is not callable',
      );
    });

    it('should throw when args.viewComponent is an inherited prototype key', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: Object.create({ toString: () => 'inherited' }),
      });

      expect(() =>
        renderer.render(
          { viewComponent: 'toString' },
          { loaded: { widget: mockWidget } },
        ),
      ).toThrow(
        'createVanillaRenderer: viewComponent key "toString" not found in ViewComponent map or is not callable',
      );
    });

    it('should throw when args.component is an inherited prototype key', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: Object.create({ toString: () => 'inherited' }),
      });

      expect(() =>
        renderer.render(
          { component: 'toString' },
          { loaded: { widget: mockWidget } },
        ),
      ).toThrow(
        'createVanillaRenderer: component key "toString" not found in ViewComponent map',
      );
    });

    it('should throw when args.component key maps to a non-function', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: { myView: 'not-a-function' },
      });

      expect(() =>
        renderer.render(
          { component: 'myView' },
          { loaded: { widget: mockWidget } },
        ),
      ).toThrow(
        'createVanillaRenderer: component key "myView" in ViewComponent map is not callable',
      );
    });
  });
});
