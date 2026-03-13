import { getMerkur, createMerkurWidget } from '@merkur/core';

/**
 * Creates a loader function for Storybook that manages Merkur widget lifecycle.
 * The loader creates and mounts widgets for stories, reusing instances when possible
 * and unmounting previous widgets when switching stories.
 *
 * @param {Object} options Configuration options
 * @param {Object} options.widgetProperties The widget properties used to create widget instances
 * @param {Function} options.render Required callback called each time the widget's update lifecycle
 *   fires (receives the widget instance as the first argument)
 * @returns {Function} Async loader function compatible with Storybook's `loaders` API;
 *   when called it resolves to `{ widget: MerkurWidget | null }`
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

    // If we're reusing the same story's widget, update its state and props
    if (lastStory.widget && lastStory.name === args.story) {
      const widget = lastStory.widget;
      const nextState = args?.args?.widget?.state ?? {};
      const nextProps = args?.args?.widget?.props ?? {};
      const lifeCycle = widget?.$in?.component?.lifeCycle;
      const hasSetState = typeof widget.setState === 'function';
      const hasSetProps = typeof widget.setProps === 'function';
      // Reset existing state/props to avoid stale keys when reusing the widget.
      if (hasSetState) {
        widget.state = {};
        await widget.setState(nextState);
      } else {
        widget.state = nextState;
      }
      if (hasSetProps) {
        widget.props = {};
        await widget.setProps(nextProps);
      } else {
        widget.props = nextProps;
      }
      // When setState/setProps are available, they should trigger widget.update()
      // via @merkur/plugin-component, so avoid forcing an extra lifecycle update.
      if (!hasSetState && !hasSetProps) {
        if (lifeCycle && typeof lifeCycle.update === 'function') {
          await lifeCycle.update(widget);
        } else {
          render(widget);
        }
      }
      return { widget };
    }

    // Otherwise, create and mount a new widget instance
    const widget = await Promise.resolve(
      getMerkur().create({ ...widgetProperties, ...args.args.widget }),
    );

    const lifeCycle = widget?.$in?.component?.lifeCycle;
    if (!lifeCycle) {
      throw new Error(
        'createWidgetLoader: widget must be created with a component plugin (e.g., "@merkur/plugin-component"). Ensure "componentPlugin" is included in widgetProperties.$plugins for Storybook integration to work.',
      );
    }
    lifeCycle.mount = () => {};
    lifeCycle.update = () => {
      render(widget);
    };
    lifeCycle.unmount = () => {};

    widget.state = args?.args?.widget?.state ?? {};
    widget.props = args?.args?.widget?.props ?? {};
    await widget.mount();

    lastStory = {
      widget,
      name: args.story,
    };

    return { widget };
  };
}

/**
 * Creates a Storybook preview configuration for Merkur widgets.
 * Registers the widget with Merkur and sets up the story loader.
 *
 * @param {Object} options Configuration options
 * @param {Object} options.widgetProperties The widget properties to register with Merkur
 * @param {Function} [options.render] Callback called each time the widget's update lifecycle
 *   fires (receives the widget instance as the first argument). Defaults to a no-op.
 * @param {Function} [options.createWidget=createMerkurWidget] Factory function used to create
 *   widget instances — useful for injecting a test double or custom factory
 * @returns {{ loaders: Function[] }} Partial Storybook preview configuration that can be
 *   spread into a `preview.mjs` export
 */
function createPreviewConfig({
  widgetProperties,
  render,
  createWidget = createMerkurWidget,
}) {
  if (!widgetProperties?.name || !widgetProperties?.version) {
    throw new Error(
      'createPreviewConfig: widgetProperties must include "name" and "version".',
    );
  }

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
 * Creates a renderer for vanilla JavaScript widgets that produce HTML strings.
 * Handles initial rendering, component selection, event binding, and re-rendering
 * when widget state changes.
 *
 * @param {Object} options Configuration options
 * @param {Function|Object.<string, Function>} options.ViewComponent Either a single view function
 *   `(widget) => htmlString`, or a named map of such functions where the key `"default"` is used
 *   as the fallback. A specific entry can be selected at story level via `args.component` or
 *   `args.viewComponent`.
 * @param {Function} [options.bindEvents] Optional function called after every render to attach
 *   event listeners: `(container: HTMLElement, widget) => void`. When omitted the renderer
 *   falls back to `widget.View.bindEvents` if present.
 * @returns {{ render: Function, update: Function }} `render` is the Storybook story render
 *   function `(args, { loaded }) => HTMLElement`; `update` is a no-argument callback suitable
 *   for passing as the `render` option of `createPreviewConfig` — it re-renders the current
 *   container in place and re-binds events.
 */
function createVanillaRenderer(options) {
  if (!options || typeof options !== 'object') {
    throw new Error(
      'createVanillaRenderer: options must be a non-null object.',
    );
  }
  const { ViewComponent, bindEvents } = options;
  if (!ViewComponent) {
    throw new Error(
      'createVanillaRenderer: "ViewComponent" option is required.',
    );
  }

  // Store references for re-rendering
  let currentContainer = null;
  let currentWidget = null;
  let currentViewFunction = null;

  function getViewFunction(args) {
    // Check args first to allow overriding
    if (args.viewComponent) {
      const fn = ViewComponent[args.viewComponent];
      if (!fn) {
        throw new Error(
          `createVanillaRenderer: viewComponent key "${args.viewComponent}" not found in ViewComponent map`,
        );
      }
      return fn;
    }

    if (args.component) {
      if (typeof args.component === 'function') return args.component;
      const found = ViewComponent[args.component];
      if (found) return found;
      // fall through to default when ViewComponent is a plain function
    }

    // Fall back to ViewComponent
    if (typeof ViewComponent === 'function') {
      return ViewComponent;
    }

    const fn = ViewComponent.default || ViewComponent;
    if (typeof fn !== 'function') {
      throw new Error(
        'createVanillaRenderer: ViewComponent must be a function or an object with a callable "default" property',
      );
    }
    return fn;
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
      const viewFunction = getViewFunction(args);

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
