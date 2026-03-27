import { getMerkur, createMerkurWidget } from '@merkur/core';

/**
 * Creates and mounts a new Merkur widget instance for the given story args.
 * Applies story-provided `state` and `props`, then hooks the component-plugin
 * update lifecycle so that any subsequent `setState` / `setProps` call
 * automatically triggers the Storybook render callback.
 *
 * @param {Object} options
 * @param {Object} options.widgetProperties - Base widget definition (name, version, plugins, …).
 * @param {Object} options.args - Storybook loader args object (`{ story, args: { widget } }`).
 * @param {Function} options.renderFn - Called after every widget update.
 * @returns {Promise<Object>} The mounted widget instance.
 */
async function mountNewWidget({ widgetProperties, args, renderFn }) {
  const widget = await getMerkur().create({
    ...args.args.widget,
    ...widgetProperties,
  });

  const widgetArgs = args?.args?.widget ?? {};
  if (Object.hasOwn(widgetArgs, 'state')) {
    widget.state = widgetArgs.state ?? {};
  }
  if (Object.hasOwn(widgetArgs, 'props')) {
    widget.props = widgetArgs.props ?? {};
  }
  await widget.mount();

  // load() may set widget.state/props to undefined when no load lifecycle is defined;
  // ensure the default empty values from componentPlugin are preserved.
  if (widget.state == null) {
    widget.state = {};
  }
  if (widget.props == null) {
    widget.props = {};
  }

  // Wrap widget.update so that any subsequent setState / setProps call
  // automatically triggers the Storybook render callback.
  const originalUpdate = widget.update;
  widget.update = async (...args) => {
    const result = await originalUpdate(...args);
    renderFn(widget);
    return result;
  };

  return widget;
}

/**
 * Creates a Storybook loader that manages the Merkur widget lifecycle.
 * Mounts a new widget on each call, unmounts on story change.
 *
 * @param {Object} options
 * @param {Object} options.widgetProperties - Widget properties including `name` and `version`.
 * @param {Function} [options.render] - Called each time the widget updates. Defaults to no-op.
 * @returns {Function} Async Storybook loader resolving to `{ widget }`.
 */
function createWidgetLoader(options = {}) {
  if (options == null || typeof options !== 'object') {
    throw new TypeError(
      'createWidgetLoader: "options" argument must be a non-null object.',
    );
  }
  const { render, widgetProperties } = options;
  if (render != null && typeof render !== 'function') {
    throw new TypeError(
      'createWidgetLoader: "render" option must be a function when provided.',
    );
  }
  const renderFn = typeof render === 'function' ? render : () => {};
  if (!widgetProperties || typeof widgetProperties !== 'object') {
    throw new TypeError(
      'createWidgetLoader: "widgetProperties" option is required and must be an object.',
    );
  }
  if (
    typeof widgetProperties.name !== 'string' ||
    widgetProperties.name.trim() === ''
  ) {
    throw new TypeError(
      'createWidgetLoader: "widgetProperties.name" option is required and must be a non-empty string.',
    );
  }
  if (
    typeof widgetProperties.version !== 'string' ||
    widgetProperties.version.trim() === ''
  ) {
    throw new TypeError(
      'createWidgetLoader: "widgetProperties.version" option is required and must be a non-empty string.',
    );
  }

  let lastStory = {};

  return async (args) => {
    if (lastStory.widget && lastStory.name !== args.story) {
      try {
        await lastStory.widget.unmount();
      } finally {
        // Always reset so a failing unmount never leaves a zombie widget that
        // blocks every subsequent loader invocation.
        lastStory = {};
      }
    }

    const widgetArg = args?.args?.widget;
    if (widgetArg != null) {
      if (typeof widgetArg !== 'object' || Array.isArray(widgetArg)) {
        throw new TypeError(
          'createWidgetLoader: args.args.widget must be a plain object when provided.',
        );
      }
    }
    if (!widgetArg) {
      if (lastStory.widget && lastStory.name === args.story) {
        try {
          await lastStory.widget.unmount();
        } finally {
          lastStory = {};
        }
      }
      return { widget: null };
    }

    const widget = await mountNewWidget({ widgetProperties, args, renderFn });
    lastStory = {
      widget,
      name: args.story,
    };

    return { widget };
  };
}

/**
 * Creates a partial Storybook preview config for a Merkur widget.
 * Registers the widget factory with Merkur and returns a `loaders` array.
 *
 * Calling this again for the same widget (e.g. during HMR) emits a `console.warn`
 * because the previously mounted widget cannot be unmounted automatically.
 *
 * @param {Object} options
 * @param {Object} options.widgetProperties - Widget properties including `name` and `version`.
 * @param {Function} [options.render] - Called each time the widget updates.
 * @param {Function} [options.createWidget] - Widget factory. Defaults to `createMerkurWidget`.
 * @returns {{ loaders: Function[] }}
 */
function createPreviewConfig(options = {}) {
  if (options == null || typeof options !== 'object') {
    throw new TypeError(
      'createPreviewConfig: "options" argument must be a non-null object.',
    );
  }
  const {
    widgetProperties,
    render,
    createWidget = createMerkurWidget,
  } = options;
  if (
    typeof widgetProperties?.name !== 'string' ||
    widgetProperties.name.trim() === '' ||
    typeof widgetProperties?.version !== 'string' ||
    widgetProperties.version.trim() === ''
  ) {
    throw new Error(
      'createPreviewConfig: widgetProperties must include "name" and "version" as non-empty strings.',
    );
  }
  if (createWidget != null && typeof createWidget !== 'function') {
    throw new TypeError(
      'createPreviewConfig: "createWidget" option must be a function when provided.',
    );
  }

  // Merkur stores widget factories under `name + version` (no separator) — see
  // packages/core/src/merkur.js. We use the same format to detect re-registration.
  const registrationKey = widgetProperties.name + widgetProperties.version;
  const merkur = getMerkur();
  const isAlreadyRegistered =
    merkur?.$in?.widgetFactory != null &&
    Object.hasOwn(merkur.$in.widgetFactory, registrationKey);

  // Warn when the same widget is already registered (e.g., HMR re-execution of
  // preview.mjs). The previous loader's mounted widget cannot be unmounted
  // automatically — the caller must call widget.unmount() first if needed.
  if (isAlreadyRegistered) {
    console.warn(
      `createPreviewConfig: widget "${widgetProperties.name}" is already registered. ` +
        'Call widget.unmount() before re-invoking if a clean teardown is required.',
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
        render,
      }),
    ],
  };
}

/**
 * Creates a renderer for vanilla JS widgets that produce HTML strings.
 *
 * @param {Object} options
 * @param {Function|Object.<string, Function>} options.ViewComponent - A single view function
 *   `(widget) => htmlString`, or a named map where `"default"` is the fallback.
 *   Use `args.component` (string key or function) to select a view at story level.
 * @param {Function} [options.bindEvents] - Called after each render: `(container, widget) => void`.
 *   Falls back to `widget.View.bindEvents` when omitted.
 * @returns {{ render: Function, update: Function }}
 */
function createVanillaRenderer(options) {
  if (!options || typeof options !== 'object') {
    throw new Error(
      'createVanillaRenderer: options must be a non-null object.',
    );
  }
  const { ViewComponent, bindEvents } = options;
  if (bindEvents != null && typeof bindEvents !== 'function') {
    throw new TypeError(
      'createVanillaRenderer: "bindEvents" option must be a function when provided.',
    );
  }
  if (!ViewComponent) {
    throw new Error(
      'createVanillaRenderer: "ViewComponent" option is required.',
    );
  }

  // Store per-widget render state so updates target the correct container
  const widgetRenderMap = new WeakMap();

  function getViewFunction(args) {
    const isViewComponentFunction = typeof ViewComponent === 'function';
    if (args.component) {
      if (typeof args.component === 'function') {
        return args.component;
      }
      if (!isViewComponentFunction) {
        if (!Object.hasOwn(ViewComponent, args.component)) {
          throw new Error(
            `createVanillaRenderer: component key "${args.component}" not found in ViewComponent map`,
          );
        }
        const found = ViewComponent[args.component];
        if (typeof found !== 'function') {
          throw new Error(
            `createVanillaRenderer: component key "${args.component}" in ViewComponent map is not callable`,
          );
        }
        return found;
      }
      // When ViewComponent is a function, args.component must be a function override
      throw new Error(
        'createVanillaRenderer: "component" key must be a function when ViewComponent is a function; pass a component function directly via args.component.',
      );
    }

    // Fall back to ViewComponent
    if (isViewComponentFunction) {
      return ViewComponent;
    }

    const fn = ViewComponent.default ?? ViewComponent;
    if (typeof fn !== 'function') {
      throw new Error(
        'createVanillaRenderer: ViewComponent must be a function or an object with a callable "default" property',
      );
    }
    return fn;
  }

  function renderWidget(container, widget, viewFunction) {
    const viewOutput = viewFunction(widget);
    if (typeof viewOutput !== 'string') {
      const actualType = viewOutput === null ? 'null' : typeof viewOutput;
      throw new TypeError(
        `createVanillaRenderer: viewFunction must return an HTML string, but returned ${actualType}.`,
      );
    }
    container.innerHTML = viewOutput;

    if (bindEvents) {
      bindEvents(container, widget);
    } else if (typeof widget.View?.bindEvents === 'function') {
      widget.View.bindEvents(container, widget);
    }
  }

  return {
    render: (args, context = {}) => {
      const widget = context.loaded?.widget;
      if (!widget) {
        const empty = document.createElement('div');
        empty.textContent = 'Loading widget...';
        return empty;
      }

      const container = document.createElement('div');
      const viewFunction = getViewFunction(args);

      renderWidget(container, widget, viewFunction);

      // Store per-widget render state for later updates
      widgetRenderMap.set(widget, { container, viewFunction });

      return container;
    },
    update: (widget) => {
      const entry = widget && widgetRenderMap.get(widget);
      if (entry) {
        renderWidget(entry.container, widget, entry.viewFunction);
      }
    },
  };
}

export { createWidgetLoader, createPreviewConfig, createVanillaRenderer };
