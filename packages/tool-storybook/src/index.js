import { getMerkur, createMerkurWidget } from '@merkur/core';

// Keys from the Merkur widget definition that story args must not override.
// Allowing overrides would let a story redirect the factory lookup (name/version),
// replace plugin configuration ($plugins), or swap lifecycle callbacks (setup/create).
//
// NOTE: Object.keys() skips __proto__ on normal objects, but when a plain object's
// prototype is mutated via bracket assignment (obj['__proto__'] = ...) those keys
// enumerate as own keys and must be explicitly blocked to prevent prototype-pollution.
const RESERVED_WIDGET_KEYS = new Set([
  'name',
  'version',
  '$plugins',
  'setup',
  'create',
  'createWidget',
  '__proto__',
  'constructor',
  'prototype',
]);

/**
 * Returns a copy of `widgetArg` with reserved and prototype-pollution keys removed.
 * Safe custom fields (e.g. `customFunction`, `props`, `state`) pass through unchanged.
 *
 * @param {Object} widgetArg - The plain widget arg object from story args.
 * @returns {Object} Sanitized copy.
 */
function sanitizeWidgetArgs(widgetArg) {
  const result = {};
  for (const key of Object.keys(widgetArg)) {
    if (!RESERVED_WIDGET_KEYS.has(key)) {
      result[key] = widgetArg[key];
    }
  }
  return result;
}

/**
 * Runs the component lifecycle update or falls back to the render callback.
 *
 * @param {Object} widget - The Merkur widget instance passed to the update/render call.
 * @param {Object|undefined} lifeCycle - The widget's component lifecycle object, if present.
 * @param {Function} renderFn - Fallback render callback when no lifecycle update is available.
 * @returns {Promise<void>}
 */
async function triggerUpdate(widget, lifeCycle, renderFn) {
  if (typeof lifeCycle?.update === 'function') {
    await lifeCycle.update(widget);
  } else {
    await renderFn(widget);
  }
}

/**
 * Updates an already-mounted widget instance with new state/props from story args.
 * Dispatches across four cases depending on which setter methods the widget exposes.
 *
 * @param {Object} options
 * @param {Object} options.widget - The mounted Merkur widget instance to update.
 * @param {Object} options.widgetArgs - The raw `args.args.widget` object from the story.
 * @param {Object} options.lastStory - Internal lastStory tracking object; `lastProps` is mutated in place.
 * @param {Function} options.renderFn - Fallback render callback when no lifecycle update is available.
 * @returns {Promise<{ widget: Object }>}
 */
async function updateExistingWidget({
  widget,
  widgetArgs,
  lastStory,
  renderFn,
}) {
  const hasNextState = Object.hasOwn(widgetArgs, 'state');
  const hasNextProps = Object.hasOwn(widgetArgs, 'props');
  const safeNextState = widgetArgs.state ?? {};
  const safeNextProps = widgetArgs.props ?? {};
  const lifeCycle = widget?.$in?.component?.lifeCycle;
  const hasSetState = typeof widget.setState === 'function';
  const hasSetProps = typeof widget.setProps === 'function';

  if (hasSetState && !hasSetProps) {
    if (hasNextProps) {
      widget.props = safeNextProps;
    }
    if (hasNextState) {
      // Clear state before calling setState to prevent previously accumulated keys
      // from leaking into the new state.
      widget.state = {};
      await widget.setState(safeNextState);
    } else if (hasNextProps) {
      // Props changed but no setState — manually trigger a re-render.
      await triggerUpdate(widget, lifeCycle, renderFn);
    }
    return { widget };
  }

  if (hasSetProps && !hasSetState) {
    if (hasNextProps) {
      // Reset props to an empty object before calling setProps so that the
      // setter sees only the story-provided props and cannot merge with any
      // leftover values from a previous story invocation.
      widget.props = {};
      await widget.setProps(safeNextProps);
      // Guard: setProps→load() may set widget.state to undefined when no load
      // lifecycle is defined.
      if (widget.state == null) {
        widget.state = {};
      }
    }
    if (hasNextState) {
      widget.state = safeNextState;
      await triggerUpdate(widget, lifeCycle, renderFn);
    }
    return { widget };
  }

  // When both setters are available, prefer setProps so that prop-driven load
  // logic can run, then apply Storybook state via setState so it remains
  // authoritative.
  if (hasSetProps && hasSetState) {
    if (hasNextProps) {
      const prev = lastStory.lastProps;
      const next = safeNextProps;
      const prevKeys = prev ? Object.keys(prev) : [];
      const nextKeys = Object.keys(next);
      // NOTE: comparison is shallow (===). Props that are objects will always be
      // referentially unequal across Storybook re-renders, so propsUnchanged will
      // be false for object-valued props — this is intentional: prefer re-calling
      // setProps over silently skipping a potential load() side-effect.
      const propsUnchanged =
        prev !== undefined &&
        prevKeys.length === nextKeys.length &&
        nextKeys.every((k) => Object.hasOwn(prev, k) && prev[k] === next[k]);
      if (!propsUnchanged) {
        lastStory.lastProps = safeNextProps;
        // Reset props to an empty object before calling setProps so that the
        // setter sees only the story-provided props and cannot merge with any
        // leftover values from a previous story invocation.
        widget.props = {};
        await widget.setProps(safeNextProps);
      }
      // Guard: setProps→load() may set widget.state to undefined when no load
      // lifecycle is defined.
      if (widget.state == null) {
        widget.state = {};
      }
    }
    if (hasNextState) {
      // Clear state so that Storybook-provided state replaces any previous or
      // load()-generated keys instead of merging with them.
      widget.state = {};
      await widget.setState(safeNextState);
    }
    return { widget };
  }

  // When neither setter is available, replace state/props directly and perform
  // a single lifecycle update to avoid duplicate work. Only trigger a render
  // when at least one of state or props actually changed.
  if (hasNextState) {
    widget.state = safeNextState;
  }
  if (hasNextProps) {
    widget.props = safeNextProps;
  }
  if (hasNextState || hasNextProps) {
    await triggerUpdate(widget, lifeCycle, renderFn);
  }
  return { widget };
}

/**
 * Creates and mounts a new widget instance, hooking the update lifecycle so that
 * subsequent setState/setProps calls automatically trigger the render callback.
 *
 * @param {Object} options
 * @param {Object} options.widgetProperties - Base widget properties (name, version, $plugins, …).
 * @param {Object} options.args - Full Storybook loader args object; `args.args.widget` provides state/props overrides.
 * @param {Function} options.renderFn - Render callback invoked on each lifecycle update.
 * @returns {Promise<Object>} The mounted Merkur widget instance.
 * @throws {Error} If no Merkur widget factory is registered for the given name and version.
 */
async function mountNewWidget({ widgetProperties, args, renderFn }) {
  const safeWidgetArg = sanitizeWidgetArgs(args.args.widget);
  const widget = await getMerkur().create({
    ...widgetProperties,
    ...safeWidgetArg,
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

  // Hook the component-plugin update lifecycle so that any subsequent
  // setState / setProps call automatically triggers the Storybook render callback.
  const lifeCycle = widget?.$in?.component?.lifeCycle;
  if (lifeCycle) {
    const originalUpdate = lifeCycle.update;
    lifeCycle.update = async (w) => {
      if (typeof originalUpdate === 'function') {
        await originalUpdate(w);
      }
      renderFn(w);
    };
  }

  return widget;
}

/**
 * Creates a loader function for Storybook that manages Merkur widget lifecycle.
 * The loader creates and mounts widgets for stories, reusing instances when possible
 * and unmounting previous widgets when switching stories. It relies on a Merkur widget
 * factory having been registered beforehand for the given widget `name` and `version`
 * (for example via `getMerkur().register(...)` or Storybook's `createPreviewConfig`).
 *
 * @param {Object} options Configuration options
 * @param {Object} options.widgetProperties The widget properties (including `name` and `version`)
 *   used to look up and create widget instances from a previously registered Merkur widget factory.
 * @param {Function} [options.render] Optional callback called each time the widget's update lifecycle
 *   fires (receives the widget instance as the first argument). Defaults to a no-op.
 * @returns {Function} Async loader function compatible with Storybook's `loaders` API;
 *   when called it resolves to `{ widget: Object | null }`.
 * @throws {TypeError} If `options`, `options.render`, `options.widgetProperties`,
 *   `options.widgetProperties.name`, or `options.widgetProperties.version` fail validation.
 *   Note: the **returned loader** throws `Error` if no Merkur widget factory is registered
 *   for the given `name`/`version` when it attempts to create a widget instance.
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
      // Allow plain objects, including those with a mutated prototype (e.g. via
      // __proto__ bracket assignment). sanitizeWidgetArgs already strips all
      // prototype-pollution keys before they reach widget creation.
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

    if (lastStory.widget && lastStory.name === args.story) {
      return updateExistingWidget({
        widget: lastStory.widget,
        widgetArgs: args?.args?.widget ?? {},
        lastStory,
        renderFn,
      });
    }

    const widget = await mountNewWidget({ widgetProperties, args, renderFn });
    lastStory = {
      widget,
      name: args.story,
      lastProps: Object.hasOwn(args.args.widget, 'props')
        ? widget.props
        : undefined,
    };

    return { widget };
  };
}

/**
 * Creates a Storybook preview configuration for Merkur widgets.
 * Registers the widget with Merkur and sets up the story loader.
 *
 * Calling this function again for the same widget name and version (i.e., the same
 * registration key, e.g., during HMR re-execution of `preview.mjs`) emits a
 * `console.warn` because the previously mounted widget cannot be unmounted
 * automatically. Call `widget.unmount()` before re-invoking if a clean teardown
 * is required.
 *
 * @param {Object} options Configuration options
 * @param {Object} options.widgetProperties The widget properties to register with Merkur
 * @param {Function} [options.render] Callback called each time the widget's update lifecycle
 *   fires (receives the widget instance as the first argument). Defaults to a no-op.
 * @param {Function} [options.createWidget=createMerkurWidget] Factory function used to create
 *   widget instances — useful for injecting a test double or custom factory
 * @returns {{ loaders: Function[] }} Partial Storybook preview configuration that can be
 *   spread into a `preview.mjs` export
 * @throws {TypeError} If `options` is not an object, or `options.createWidget` is not a function.
 * @throws {Error} If `widgetProperties.name` or `widgetProperties.version` are missing or empty strings.
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
        'This usually means createPreviewConfig was called more than once (e.g., during HMR). ' +
        'The previously mounted widget cannot be unmounted automatically — call widget.unmount() ' +
        'before re-invoking createPreviewConfig if a clean teardown is required.',
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
 * @returns {{ render: Function, update: Function }}
 *   - `render(args, { loaded }): HTMLElement` — returns a rendered container `<div>`, or a
 *     `<div>Loading widget...</div>` placeholder when `loaded.widget` is absent.
 *   - `update(widget): void` — re-renders the widget's container in place and re-binds events;
 *     no-op when `widget` has not been rendered yet.
 * @throws {Error} If `options` is missing/not an object, or `options.ViewComponent` is absent.
 * @throws {TypeError} If `options.bindEvents` is provided but is not a function.
 *
 * Security warning: `ViewComponent` functions set `container.innerHTML` directly. Ensure that any
 * widget state or props interpolated into the returned HTML strings is sanitized to prevent XSS
 * when data originates from untrusted sources.
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
    // Check args first to allow overriding
    if (args.viewComponent) {
      if (isViewComponentFunction) {
        throw new Error(
          'createVanillaRenderer: "viewComponent" key cannot be used when ViewComponent is a function; pass a component function directly via args.component instead.',
        );
      }
      if (!Object.hasOwn(ViewComponent, args.viewComponent)) {
        throw new Error(
          `createVanillaRenderer: viewComponent key "${args.viewComponent}" not found in ViewComponent map`,
        );
      }
      const fn = ViewComponent[args.viewComponent];
      if (typeof fn !== 'function') {
        throw new Error(
          `createVanillaRenderer: ViewComponent["${args.viewComponent}"] is not a function`,
        );
      }
      return fn;
    }

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
