import {
  createWidgetLoader,
  createPreviewConfig,
  createVanillaRenderer,
} from '../index';

import { getMerkur, createMerkurWidget, removeMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';

describe('Merkur tool storybook', () => {
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

    it('should return empty widget for not defined props', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      delete storyArgs.args.widget.props;
      let { widget } = await loader(storyArgs);

      expect(widget).toEqual(null);
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
      jest.spyOn(widget, 'unmount');
      storyArgs.story = 'AnotherStory';
      await loader(storyArgs);

      expect(widget.unmount).toHaveBeenCalled();
    });

    it('should define custom function on widget through story args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.customFunction = () => {};
      let { widget } = await loader(storyArgs);

      expect(typeof widget.customFunction === 'function').toBeTruthy();
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
      removeMerkur();
    });

    it('should return an object with a loaders array containing one loader function', () => {
      const config = createPreviewConfig({ widgetProperties });

      expect(Array.isArray(config.loaders)).toBe(true);
      expect(config.loaders).toHaveLength(1);
      expect(typeof config.loaders[0]).toBe('function');
    });

    it('should register the widget with Merkur', () => {
      createPreviewConfig({ widgetProperties });

      expect(getMerkur().isRegistered(widgetProperties.name)).toBe(true);
    });

    it('should use a custom createWidget factory when provided', () => {
      const createWidget = jest.fn();
      createPreviewConfig({ widgetProperties, createWidget });

      expect(getMerkur().isRegistered(widgetProperties.name)).toBe(true);
    });

    it('should throw when widgetProperties.name is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { version: '1.0.0' } }),
      ).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version".',
      );
    });

    it('should throw when widgetProperties.version is missing', () => {
      expect(() =>
        createPreviewConfig({ widgetProperties: { name: 'preview-widget' } }),
      ).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version".',
      );
    });

    it('should throw when widgetProperties is not provided', () => {
      expect(() => createPreviewConfig({})).toThrow(
        'createPreviewConfig: widgetProperties must include "name" and "version".',
      );
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

    it('should fall back to default view when args.component string key is not in ViewComponent map', () => {
      const renderer = createVanillaRenderer({
        ViewComponent: {
          default: mockViewFunction,
        },
      });

      const container = renderer.render(
        { component: 'nonExistentView' },
        { loaded: { widget: mockWidget } },
      );

      expect(container.innerHTML).toBe('<div>Count: 0</div>');
      expect(mockViewFunction).toHaveBeenCalledWith(mockWidget);
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
      renderer.update();

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
      renderer.update();
      expect(container.innerHTML).toBe('<div>Count: 1</div>');

      mockWidget.state.count = 2;
      renderer.update();
      expect(container.innerHTML).toBe('<div>Count: 2</div>');

      mockWidget.state.count = 3;
      renderer.update();
      expect(container.innerHTML).toBe('<div>Count: 3</div>');
    });
  });
});
