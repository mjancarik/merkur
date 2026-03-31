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

function snapshotStoryArgValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function areStoryArgValuesEqual(previous, next) {
  if (Object.is(previous, next)) {
    return true;
  }

  if (typeof previous !== typeof next) {
    return false;
  }

  if (Array.isArray(previous) || Array.isArray(next)) {
    if (!Array.isArray(previous) || !Array.isArray(next)) {
      return false;
    }

    if (previous.length !== next.length) {
      return false;
    }

    return previous.every((value, index) =>
      areStoryArgValuesEqual(value, next[index]),
    );
  }

  if (previous && next && typeof previous === 'object') {
    const previousKeys = Object.keys(previous);
    const nextKeys = Object.keys(next);

    if (previousKeys.length !== nextKeys.length) {
      return false;
    }

    return previousKeys.every(
      (key) =>
        Object.hasOwn(next, key) &&
        areStoryArgValuesEqual(previous[key], next[key]),
    );
  }

  return false;
}

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

  await widget.mount();

  // Apply story-provided state/props after mount so the load() lifecycle (if present)
  // cannot silently discard them. If a key is absent, preserve the widget's own
  // default (falling back to {} only when the plugin leaves the value null/undefined).
  const widgetArgs = args?.args?.widget ?? {};
  if (Object.hasOwn(widgetArgs, 'state')) {
    widget.state = widgetArgs.state ?? {};
  } else if (widget.state == null) {
    widget.state = {};
  }
  if (Object.hasOwn(widgetArgs, 'props')) {
    widget.props = widgetArgs.props ?? {};
  } else if (widget.props == null) {
    widget.props = {};
  }

  hookMethod(widget, 'update', async (_firstArg, originalUpdate, ...rest) => {
    const result = await originalUpdate(...rest);
    renderFn(widget);
    addons.getChannel().emit(FORCE_RE_RENDER);
    return result;
  });

  return widget;
}

/**
 * Creates a Storybook loader that manages the Merkur widget lifecycle.
 * Mounts a new widget when the story changes or when story args differ from
 * the previous call; reuses the existing instance when args are unchanged.
 *
 * @param {Object} options
 * @param {Object} options.widgetProperties - Widget properties including `name` and `version`.
 * @param {Function} [options.render] - Called each time the widget updates. Defaults to no-op.
 * @returns {Function} Async Storybook loader resolving to `{ widget }`.
 */
function createWidgetLoader(options = {}) {
  createWidgetLoaderOptionsSchema.parse(options);
  const { render, widgetProperties } = options;
  const renderFn = typeof render === 'function' ? render : () => {};

  let lastStory = {};

  // Always resets lastStory so a failing unmount never leaves a zombie widget
  // that blocks subsequent loader invocations.
  async function unmountLast() {
    try {
      await lastStory.widget.unmount();
    } finally {
      lastStory = {};
    }
  }

  return async (args) => {
    if (lastStory.widget && lastStory.name !== args.story) {
      await unmountLast();
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
        await unmountLast();
      }
      return { widget: null };
    }

    if (
      lastStory.widget &&
      lastStory.name === args.story &&
      areStoryArgValuesEqual(lastStory.widgetArgs, widgetArg)
    ) {
      return { widget: lastStory.widget };
    }

    if (lastStory.widget && lastStory.name === args.story) {
      await unmountLast();
    }

    const widget = await mountNewWidget({ widgetProperties, args, renderFn });
    lastStory = {
      widget,
      name: args.story,
      widgetArgs: snapshotStoryArgValue(widgetArg),
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
  createPreviewConfigOptionsSchema.parse(options);
  const {
    widgetProperties,
    render,
    createWidget = createMerkurWidget,
  } = options;

  // Warn when the same widget is already registered (e.g., HMR re-execution of
  // preview.mjs). The previous loader's mounted widget cannot be unmounted
  // automatically — the caller must call widget.unmount() first if needed.
  if (isRegistered(widgetProperties.name)) {
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
 * Stories must provide `args.component` as a function returning an HTML string.
 * Event binding: attach a `bindEventListeners(widget, container)` function to
 * `args.component`. The idiomatic place is the view module itself —
 * `View.bindEventListeners = bindEventListeners` — so any story passing
 * `component: View` carries it automatically. A decorator can inject it for
 * component stories that don't have it (see the vanilla widget example).
 *
 * **Security note:** `args.component` is responsible for HTML-escaping any
 * dynamic values before returning the HTML string. Raw interpolation of
 * user-controlled or server-controlled strings (e.g. product names, error
 * messages) into the template will be injected via `innerHTML` as-is.
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

    viewFunction.bindEventListeners?.(widget, container);
  }

  return {
    render: (args, context = {}) => {
      const widget = context.loaded?.widget;
      if (!widget) {
        const empty = document.createElement('div');
        empty.textContent = 'Loading widget...';
        return empty;
      }

      if (typeof args.component !== 'function') {
        throw new TypeError(
          'createVanillaRenderer: args.component must be a function.',
        );
      }

      const container = document.createElement('div');
      renderWidget(container, widget, args.component);

      widgetRenderMap.set(widget, args.component);
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
