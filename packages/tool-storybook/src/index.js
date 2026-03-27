import { getMerkur, createMerkurWidget, isRegistered } from '@merkur/core';
import { s } from '@esmj/schema';

const widgetPropertiesSchema = s.object({
  name: s.string().refine((v) => v.trim() !== '', {
    message: '"widgetProperties.name" must be a non-empty string.',
  }),
  version: s.string().refine((v) => v.trim() !== '', {
    message: '"widgetProperties.version" must be a non-empty string.',
  }),
});

const createWidgetLoaderOptionsSchema = s.object({
  widgetProperties: widgetPropertiesSchema,
  render: s
    .any()
    .refine((v) => typeof v === 'function', {
      message: (v) => `"render" must be a function, received "${typeof v}".`,
    })
    .optional(),
});

const createPreviewConfigOptionsSchema = s.object({
  widgetProperties: widgetPropertiesSchema,
  render: s
    .any()
    .refine((v) => typeof v === 'function', {
      message: (v) => `"render" must be a function, received "${typeof v}".`,
    })
    .optional(),
  createWidget: s
    .any()
    .refine((v) => typeof v === 'function', {
      message: (v) =>
        `"createWidget" must be a function, received "${typeof v}".`,
    })
    .optional(),
});

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
  const result = createWidgetLoaderOptionsSchema.safeParse(options);
  if (!result.success) {
    throw new TypeError(`createWidgetLoader: ${result.error.message}`);
  }
  const { render, widgetProperties } = options;
  const renderFn = typeof render === 'function' ? render : () => {};

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
  const result = createPreviewConfigOptionsSchema.safeParse(options);
  if (!result.success) {
    throw new TypeError(`createPreviewConfig: ${result.error.message}`);
  }
  const {
    widgetProperties,
    render,
    createWidget = createMerkurWidget,
  } = options;

  const isAlreadyRegistered = isRegistered(widgetProperties.name);

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

      widget.container = document.createElement('div');
      const viewFunction = getViewFunction(args);

      renderWidget(widget.container, widget, viewFunction);

      widgetRenderMap.set(widget, viewFunction);

      return widget.container;
    },
    update: (widget) => {
      const viewFunction = widget && widgetRenderMap.get(widget);
      if (viewFunction) {
        renderWidget(widget.container, widget, viewFunction);
      }
    },
  };
}

export { createWidgetLoader, createPreviewConfig, createVanillaRenderer };
