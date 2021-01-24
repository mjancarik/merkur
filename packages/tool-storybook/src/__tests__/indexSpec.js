import { createStoryLoader } from '../index';

import { getMerkur, createMerkurWidget } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';

describe('Merkur tool storybook', () => {
  describe('createStoryLoader method', () => {
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
      let loader = createStoryLoader({ widgetProperties, render });

      delete storyArgs.args.widget.props;
      let { widget } = await loader(storyArgs);

      expect(widget).toEqual(null);
    });

    it('should return widget instance for defined props', async () => {
      let loader = createStoryLoader({ widgetProperties, render });

      let { widget } = await loader(storyArgs);

      expect(widget.name).toEqual(widgetProperties.name);
      expect(widget.version).toEqual(widgetProperties.version);
      expect(widget.props).toEqual(storyArgs.args.widget.props);
    });

    it('should rerender widget for update', async () => {
      let loader = createStoryLoader({ widgetProperties, render });

      let { widget } = await loader(storyArgs);
      widget.setState({});

      expect(render).toHaveBeenCalled();
    });

    it('should unmount previous widget if story is changed', async () => {
      let loader = createStoryLoader({ widgetProperties, render });

      let { widget } = await loader(storyArgs);
      spyOn(widget, 'unmount');
      storyArgs.story = 'AnotherStory';
      await loader(storyArgs);

      expect(widget.unmount).toHaveBeenCalled();
    });

    it('should defined custom function on widget through story args', async () => {
      let loader = createStoryLoader({ widgetProperties, render });

      storyArgs.args.widget.customFunction = () => {};
      let { widget } = await loader(storyArgs);

      expect(typeof widget.customFunction === 'function').toBeTruthy();
    });
  });
});
