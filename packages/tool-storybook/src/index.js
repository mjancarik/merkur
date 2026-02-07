import { getMerkur, createMerkurWidget } from '@merkur/core';

/**
 * Creates a loader function for Storybook that manages Merkur widget lifecycle.
 * The loader creates and mounts widgets for stories, reusing instances when possible
 * and unmounting previous widgets when switching stories.
 *
 * @param {Object} options Configuration options
 * @param {Object} options.widgetProperties The widget properties used to create widget instances
 * @param {Function} options.render Callback function called when widget state updates (receives widget instance)
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
                render(widget);
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
 * @param {Function} [options.render] Optional custom render function for widget updates (receives widget instance)
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
 * Creates a render function for vanilla JavaScript widgets with state management.
 * Renders widget using HTML string output and handles re-rendering.
 *
 * @param {Object} options Configuration options
 * @param {Function|Object} options.ViewComponent The default view function or component map
 * @param {Function} options.bindEvents Function to bind events to the container
 * @returns {Object} Object with render function and update callback
 */
function createVanillaRenderer(options) {
  const { ViewComponent, bindEvents } = options;

  // Store references for re-rendering
  let currentContainer = null;
  let currentWidget = null;
  let currentViewFunction = null;

  function getViewFunction(args, ViewComponent) {
    if (typeof ViewComponent === 'function') {
      return ViewComponent;
    }

    if (args.viewComponent && ViewComponent[args.viewComponent]) {
      return ViewComponent[args.viewComponent];
    }

    if (args.component) {
      return typeof args.component === 'function'
        ? args.component
        : ViewComponent[args.component];
    }

    return ViewComponent.default || ViewComponent;
  }

  function renderWidget(container, widget, viewFunction) {
    container.innerHTML = viewFunction(widget);

    if (bindEvents) {
      bindEvents(container, widget);
    } else if (widget.View?.bindEvents) {
      widget.View.bindEvents(container, widget);
    }
  }

  return {
    render: (args, { loaded: { widget } }) => {
      if (!widget) {
        const empty = document.createElement('div');
        empty.textContent = 'Loading widget...';
        return empty;
      }

      const container = document.createElement('div');
      const viewFunction = getViewFunction(args, ViewComponent);

      renderWidget(container, widget, viewFunction);

      // Store references for re-rendering
      currentContainer = container;
      currentWidget = widget;
      currentViewFunction = viewFunction;

      return container;
    },
    update: () => {
      if (currentContainer && currentWidget && currentViewFunction) {
        renderWidget(currentContainer, currentWidget, currentViewFunction);
      }
    },
  };
}

export { createWidgetLoader, createPreviewConfig, createVanillaRenderer };
