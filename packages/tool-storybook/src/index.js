import { getMerkur, createMerkurWidget } from '@merkur/core';

/**
 * Creates a loader function for Storybook that manages Merkur widget lifecycle.
 * The loader creates and mounts widgets for stories, reusing instances when possible
 * and unmounting previous widgets when switching stories.
 *
 * @param {Object} options Configuration options
 * @param {Object} options.widgetProperties The widget properties used to create widget instances
 * @param {Function} options.render Callback function called when widget state updates
 * @returns {Function} Async loader function that returns widget instance for stories
 */
function createWidgetLoader({ render, widgetProperties }) {
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

/**
 * Creates a Storybook preview configuration for Merkur widgets.
 * Handles widget registration and loader setup.
 *
 * @param {Object} options Configuration options
 * @param {Object} options.widgetProperties The widget properties to register
 * @param {Function} [options.render] Optional custom render function for widget updates
 * @param {Function} [options.createWidget=createMerkurWidget] Factory function to create widget instances
 * @returns {Object} Storybook preview configuration with loaders
 */
function createPreviewConfig({
  widgetProperties,
  render,
  createWidget = createMerkurWidget,
}) {
  // Register the widget with Merkur
  getMerkur().register({
    ...widgetProperties,
    createWidget,
  });

  return {
    loaders: [
      createWidgetLoader({
        widgetProperties,
        render: render || (() => {}),
      }),
    ],
  };
}

/**
 * Creates a render function for vanilla JavaScript widgets.
 * Renders widget using HTML string output.
 *
 * @param {Function|Object} ViewComponent The view function or component map
 * @returns {Function} Storybook render function
 */
function createVanillaRenderer(ViewComponent) {
  // eslint-disable-next-line no-unused-vars
  return (args, { loaded: { widget }, viewMode }) => {
    if (!widget) {
      return document.createElement('div');
    }

    const container = document.createElement('div');
    const viewFunction =
      typeof ViewComponent === 'function'
        ? ViewComponent
        : args.viewComponent && ViewComponent[args.viewComponent]
          ? ViewComponent[args.viewComponent]
          : ViewComponent.default || ViewComponent;

    container.innerHTML = viewFunction(widget);
    return container;
  };
}

export { createWidgetLoader, createPreviewConfig, createVanillaRenderer };
