import {
  getMerkur,
  createMerkurWidget,
  isRegistered,
  hookMethod,
} from '@merkur/core';
import { s } from '@esmj/schema';
import { addons } from 'storybook/preview-api';
import { FORCE_RE_RENDER } from 'storybook/internal/core-events';

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
    .function({
      message: (v) => `"render" must be a function, received "${typeof v}".`,
    })
    .optional(),
});

const createPreviewConfigOptionsSchema = s.object({
  widgetProperties: widgetPropertiesSchema,
  render: s
    .function({
      message: (v) => `"render" must be a function, received "${typeof v}".`,
    })
    .optional(),
  createWidget: s
    .function({
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

  hookMethod(widget, 'update', async (widget, originalUpdate, ...rest) => {
    const result = await originalUpdate(...rest);
    renderFn(widget);
    addons.getChannel().emit(FORCE_RE_RENDER);
    return result;
  });

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
 * @returns {{ render: Function, update: Function }}
 */
function createVanillaRenderer() {
  const widgetRenderMap = new WeakMap();
  const widgetContainerMap = new WeakMap();

  function renderWidget(container, widget, viewFunction) {
    const viewOutput = viewFunction(widget);
    if (typeof viewOutput !== 'string') {
      const actualType = viewOutput === null ? 'null' : typeof viewOutput;
      throw new TypeError(
        `createVanillaRenderer: viewFunction must return an HTML string, but returned ${actualType}.`,
      );
    }
    container.innerHTML = viewOutput;

    widget.View?.bindEventListeners?.(widget, container);
  }

  return {
    render: (args, context = {}) => {
      const widget = context.loaded?.widget;
      if (!widget) {
        const empty = document.createElement('div');
        empty.textContent = 'Loading widget...';
        return empty;
      }

      const viewFunction = args.component;
      if (typeof viewFunction !== 'function') {
        throw new TypeError(
          'createVanillaRenderer: args.component must be a function.',
        );
      }

      const container = document.createElement('div');
      renderWidget(container, widget, viewFunction);

      widgetRenderMap.set(widget, viewFunction);
      widgetContainerMap.set(widget, container);

      return container;
    },
    update: (widget) => {
      const viewFunction = widget && widgetRenderMap.get(widget);
      if (viewFunction) {
        renderWidget(widgetContainerMap.get(widget), widget, viewFunction);
      }
    },
  };
}

export { createWidgetLoader, createPreviewConfig, createVanillaRenderer };
