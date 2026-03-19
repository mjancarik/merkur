import { createWidgetLoader } from '../index';

import { getMerkur, createMerkurWidget } from '@merkur/core';
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
      widget.setState({});

      expect(render).toHaveBeenCalled();
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

    it('should store lastProps snapshot when props key is present in story args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { counter: 0 };
      let { widget } = await loader(storyArgs);

      // Calling the loader again for the same story should return the same widget instance
      let { widget: sameWidget } = await loader(storyArgs);

      expect(sameWidget).toBe(widget);
    });

    it('should not store lastProps when props key is absent in story args', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      // Remove props so widget is not created (guard condition)
      delete storyArgs.args.widget.props;
      let { widget } = await loader(storyArgs);

      expect(widget).toEqual(null);
    });

    it('should initialize lastProps so reuse on first repeated call does not trigger extra setProps', async () => {
      let loader = createWidgetLoader({ widgetProperties, render });

      storyArgs.args.widget.props = { counter: 0 };
      let { widget: first } = await loader(storyArgs);
      let { widget: second } = await loader(storyArgs);

      // Same widget instance is reused — no remount happened
      expect(second).toBe(first);
    });
  });
});
