import { getMerkur, createMerkurWidget } from '@merkur/core';

// Keys from the Merkur widget definition that story args must not override.
// Allowing overrides would let a story redirect the factory lookup (name/version),
// replace plugin configuration ($plugins), or swap lifecycle callbacks (setup/create).
const RESERVED_WIDGET_KEYS = new Set([
  'name',
  'version',
  '$plugins',
  'setup',
  'create',
  'createWidget',
  // Prototype-pollution guards
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
 *   when called it resolves to `{ widget: MerkurWidget | null }`
 * @throws {Error} If no Merkur widget factory is registered for the provided
 *   `widgetProperties.name` and `widgetProperties.version` when the loader attempts to
 *   create a widget instance.
 */
function createWidgetLoader(options = {}) {
  if (options == null || typeof options !== 'object') {
    throw new TypeError(
      'createWidgetLoader: "options" argument must be a non-null object.',
    );
  }
  const { render, widgetProperties } = options;
  const renderFn = typeof render === 'function' ? render : () => {};
  if (render != null && typeof render !== 'function') {
    throw new TypeError(
      'createWidgetLoader: "render" option must be a function when provided.',
    );
  }
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

    // If we're reusing the same story's widget, update its state and props
    if (lastStory.widget && lastStory.name === args.story) {
      const widgetArgs = args?.args?.widget ?? {};
      const hasNextState = Object.prototype.hasOwnProperty.call(
        widgetArgs,
        'state',
      );
      const hasNextProps = Object.prototype.hasOwnProperty.call(
        widgetArgs,
        'props',
      );
      const safeNextState = widgetArgs.state == null ? {} : widgetArgs.state;
      const safeNextProps = widgetArgs.props == null ? {} : widgetArgs.props;
      const widget = lastStory.widget;
      const lifeCycle = widget?.$in?.component?.lifeCycle;
      const hasSetState = typeof widget.setState === 'function';
      const hasSetProps = typeof widget.setProps === 'function';
      if (hasSetState && !hasSetProps) {
        if (hasNextProps) {
          widget.props = safeNextProps;
        }
        if (hasNextState) {
          // Clear state before calling setState for the same reason as the
          // hasSetProps && hasSetState branch: prevent load()-generated or
          // previously accumulated keys from leaking into the new state.
          widget.state = {};
          await widget.setState(safeNextState);
        } else if (hasNextProps) {
          // When only props change, manually trigger a lifecycle update/render so
          // that Storybook controls that modify props still cause a re-render.
          if (lifeCycle && typeof lifeCycle.update === 'function') {
            await lifeCycle.update(widget);
          } else {
            await renderFn(widget);
          }
        }
        return { widget };
      }
      if (hasSetProps && !hasSetState) {
        // Use setProps to run prop-driven load logic, then apply Storybook state
        // afterwards so that it is not overwritten by load().
        if (hasNextProps) {
          // Reset props to an empty object before calling setProps so that the
          // setter sees only the story-provided props and cannot merge with any
          // leftover values from a previous story invocation.
          widget.props = {};
          await widget.setProps(safeNextProps);
          // Guard: when the widget has no load() lifecycle, setProps→load() sets
          // widget.state to undefined. Ensure state is never left undefined so
          // that a caller returning { widget } without a subsequent setState call
          // does not expose undefined state to render callbacks.
          if (widget.state == null) {
            widget.state = {};
          }
        }
        if (hasNextState) {
          widget.state = safeNextState;
          if (lifeCycle && typeof lifeCycle.update === 'function') {
            await lifeCycle.update(widget);
          } else {
            await renderFn(widget);
          }
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
          const propsUnchanged =
            prev !== undefined &&
            prevKeys.length === nextKeys.length &&
            nextKeys.every(
              (k) =>
                Object.prototype.hasOwnProperty.call(prev, k) &&
                prev[k] === next[k],
            );
          if (!propsUnchanged) {
            lastStory.lastProps = safeNextProps;
            // Reset props to an empty object before calling setProps so that the
            // setter sees only the story-provided props and cannot merge with any
            // leftover values from a previous story invocation.
            widget.props = {};
            await widget.setProps(safeNextProps);
          }
          // Guard: when the widget has no load() lifecycle, setProps→load() sets
          // widget.state to undefined. Clearing it here ensures the subsequent
          // setState merge does not produce unexpected results.
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
        if (lifeCycle && typeof lifeCycle.update === 'function') {
          await lifeCycle.update(widget);
        } else {
          await renderFn(widget);
        }
      }
      return { widget };
    }

    // Otherwise, create and mount a new widget instance
    const safeWidgetArg = sanitizeWidgetArgs(args.args.widget);
    const widget = await getMerkur().create({
      ...widgetProperties,
      ...safeWidgetArg,
    });

    const widgetArgs = args?.args?.widget ?? {};
    if (Object.prototype.hasOwnProperty.call(widgetArgs, 'state')) {
      widget.state = widgetArgs.state == null ? {} : widgetArgs.state;
    }
    if (Object.prototype.hasOwnProperty.call(widgetArgs, 'props')) {
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
    const compLifeCycle = widget?.$in?.component?.lifeCycle;
    if (compLifeCycle) {
      const originalUpdate = compLifeCycle.update;
      compLifeCycle.update = async (w) => {
        if (typeof originalUpdate === 'function') {
          await originalUpdate(w);
        }
        renderFn(w);
      };
    }

    lastStory = {
      widget,
      name: args.story,
      lastProps: Object.prototype.hasOwnProperty.call(args.args.widget, 'props')
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

  const registrationKey = widgetProperties.name + widgetProperties.version;
  const merkur = getMerkur();
  const isAlreadyRegistered =
    merkur &&
    merkur.$in &&
    merkur.$in.widgetFactory &&
    Object.prototype.hasOwnProperty.call(
      merkur.$in.widgetFactory,
      registrationKey,
    );

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
 * @returns {{ render: Function, update: Function }} `render` is the Storybook story render
 *   function `(args, { loaded }) => HTMLElement`; `update(widget)` accepts the widget instance
 *   that changed and re-renders only its associated container in place, re-binding events.
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
      if (
        !Object.prototype.hasOwnProperty.call(ViewComponent, args.viewComponent)
      ) {
        throw new Error(
          `createVanillaRenderer: viewComponent key "${args.viewComponent}" not found in ViewComponent map or is not callable`,
        );
      }
      const fn = ViewComponent[args.viewComponent];
      if (typeof fn !== 'function') {
        throw new Error(
          `createVanillaRenderer: viewComponent key "${args.viewComponent}" not found in ViewComponent map or is not callable`,
        );
      }
      return fn;
    }

    if (args.component) {
      if (typeof args.component === 'function') {
        return args.component;
      }
      if (!isViewComponentFunction) {
        if (
          !Object.prototype.hasOwnProperty.call(ViewComponent, args.component)
        ) {
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

    const fn = ViewComponent.default || ViewComponent;
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
