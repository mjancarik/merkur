import { getMerkur } from '@merkur/core';

function createStoryLoader({ render, widgetProperties }) {
  let lastStory = {};

  return async (args) => {
    if (lastStory.widget && lastStory.name !== args.story) {
      lastStory.widget.unmount();
      lastStory = {};
    }

    if (!args?.args?.widget?.props) {
      return { widget: null };
    }

    return {
      widget: lastStory.widget
        ? lastStory.widget
        : await getMerkur()
            .create({ ...widgetProperties, ...args.args.widget })
            .then(async (widget) => {
              widget.$in.component.lifeCycle.mount = () => {};
              widget.$in.component.lifeCycle.update = () => {
                render();
              };
              widget.$in.component.lifeCycle.unmount = () => {};

              widget.state = args?.args?.widget?.state ?? {};
              widget.props = args?.args?.widget?.props ?? {};
              await widget.mount();

              lastStory = {
                widget,
                name: args.story,
              };

              return widget;
            }),
    };
  };
}

export { createStoryLoader };
