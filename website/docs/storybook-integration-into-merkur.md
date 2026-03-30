---
sidebar_position: 19
title: Storybook Integration
description: Learn how to integrate Storybook with your Merkur widget
---

# Storybook

[Storybook](https://storybook.js.org/) is an open source tool for developing UI components in isolation for React, Vue, Angular, and more. It makes building stunning UIs organized and efficient.

This guide requires Storybook version 10 or higher. Lower versions need a different setup, which is covered in previous versions of the documentation.

## Installation

Since Preact and vanilla JavaScript are not in the automatic framework selection, you need to manually install Storybook packages.

### For Preact Widgets

```bash
npm i -D @storybook/preact-vite storybook
```

### For Vanilla JavaScript Widgets

```bash
npm i -D @storybook/html-vite storybook
```

### Merkur Integration Package

Then install the Merkur module for easy integration (required for both):

```bash
npm i -D @merkur/tool-storybook
```

## Configuration

### Preact Widget

For Preact widgets, configure Storybook to use the Preact framework and JSX transformation.

#### `.storybook/main.mjs`

```javascript
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: {
    name: '@storybook/preact-vite',
  },
  // Use Preact's automatic JSX runtime so you don't need to import h/Fragment in every file
  async viteFinal(viteConfig) {
    viteConfig.esbuild = {
      ...viteConfig.esbuild,
      jsx: 'automatic',
      jsxImportSource: 'preact',
    };
    return viteConfig;
  },
};

export default config;
```

#### `.storybook/preview.mjs`

```javascript
import { createPreviewConfig } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';
import { decorators } from './decorators.jsx';
import '../src/style.css';

const preview = {
  ...createPreviewConfig({
    widgetProperties,
    render(widget) {
      // This callback runs inside the widget's update lifecycle, so calling
      // widget.update() here would cause infinite recursion. Instead, we
      // notify Preact to re-render by calling the useState dispatcher stored
      // on widget.$in.storybook by the decorator — this is not the same as widget.update().
      widget.$in?.storybook?.forceUpdate();
    },
  }),
  decorators,
};

export default preview;
```

#### `.storybook/decorators.jsx`

Create a decorators file to provide the WidgetContext to all stories and handle re-rendering on widget state updates:

```jsx
import { useState, useEffect } from 'preact/hooks';
import WidgetContext from '../src/components/WidgetContext';

export const decorators = [
  (Story, { loaded: { widget } }) => {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
      if (widget && widget.$in) {
        // Group all Storybook integration state under widget.$in.storybook so
        // the render callback in preview.mjs can trigger a re-render without
        // touching the sealed widget object directly.
        widget.$in.storybook = { forceUpdate: () => forceUpdate((n) => n + 1) };
      }
    }, [widget]);

    return (
      <WidgetContext.Provider value={widget}>
        <Story />
      </WidgetContext.Provider>
    );
  },
];
```

Note: With `jsxImportSource: 'preact'` set in `main.mjs`, the automatic JSX runtime handles imports for you — you don't need to import `h` or `Fragment` in `.jsx` files.

### Vanilla JavaScript Widget

For vanilla JavaScript widgets that render HTML strings, configure Storybook to use the HTML framework.

#### `.storybook/main.mjs`

```javascript
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: {
    name: '@storybook/html-vite',
  },
};

export default config;
```

#### `.storybook/preview.mjs`

`createVanillaRenderer` stores each widget's container in a per-widget `WeakMap` so `renderer.update(widget)` always targets the correct element without touching the sealed widget object. You can also add a `.storybook/decorators.mjs` to keep the Storybook Controls panel in sync after widget-internal interactions (see below).

```javascript
import { createPreviewConfig, createVanillaRenderer } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';
import View from '../src/views/View.js';
import HeadlineSlot from '../src/slots/HeadlineSlot.js';
import Counter from '../src/components/Counter.js';
import { decorators } from './decorators.mjs';
import '../src/style.css';

function bindEvents(container, widget) {
  container
    .querySelector('[data-merkur="on-increase"]')
    ?.addEventListener('click', () => widget.onClick(widget));
  container
    .querySelector('[data-merkur="on-reset"]')
    ?.addEventListener('click', () => widget.onReset(widget));
}

const renderer = createVanillaRenderer({
  // ViewComponent can be a single function or a named map with a 'default' key.
  // Use args.component (function or string key) in stories to select a specific view.
  ViewComponent: {
    default: View,
    headline: HeadlineSlot,
    Counter,
  },
  bindEvents,
});

const preview = {
  ...createPreviewConfig({
    widgetProperties,
    render(widget) {
      renderer.update(widget);
      // Sync widget state/props back to the Storybook Controls panel so it
      // stays up to date after widget-internal interactions (e.g. button clicks).
      const storybook = widget?.$in?.storybook;
      if (storybook) {
        const { updateArgs, getArgs } = storybook;
        const currentArgs = getArgs();
        updateArgs({
          widget: {
            ...currentArgs.widget,
            state: widget.state,
            props: widget.props,
          },
        });
      }
    },
  }),
  render: renderer.render, // Storybook story render function (args, { loaded }) => HTMLElement
  decorators,
};

export default preview;
```

#### `.storybook/decorators.mjs`

The decorator stores Storybook's `updateArgs` helper on `widget.$in.storybook` so the `render` callback above can push updated `state`/`props` back to the Controls panel after every widget-internal interaction. Storing on `widget.$in` (an existing unrestricted object inside the sealed widget) avoids the `Object.seal` restriction.

```javascript
export const decorators = [
  (StoryFn, { loaded: { widget }, args, updateArgs }) => {
    if (widget && widget.$in) {
      widget.$in.storybook = { updateArgs, getArgs: () => args };
    }
    return StoryFn();
  },
];
```

### Vanilla JavaScript Widget Stories

For vanilla widgets that return HTML strings:

```javascript
// /src/components/Counter.js
export default function Counter(widget) {
  return `
    <div>
      <h3>Counter widget:</h3>
      <p>Count: <span data-merkur="counter">${widget.state.counter}</span></p>
      <button data-merkur="on-increase">
        increase counter
      </button>
      <button data-merkur="on-reset">
        reset counter
      </button>
    </div>
  `;
}
```

**Note:** Vanilla components return HTML strings, so use `class` for CSS classes, not `className` (which is JSX-specific). For example: `<div class="my-class">` not `<div className="my-class">`.

```javascript
// /src/components/Counter.stories.js
import Counter from './Counter';

export default {
  title: 'Components/Counter',
  args: {
    // widget.props is optional; if omitted, it defaults to {}
    widget: {
      props: {},
    },
    // Specify which component to render
    component: Counter,
  },
};

// Simple story without custom args
export const DefaultCounter = {};

// Story with custom widget state
export const TenCounter = {
  args: {
    widget: {
      // change default widget state from 0 to 10
      state: {
        counter: 10,
      },
    },
  },
};
```

The `createVanillaRenderer` in `preview.mjs` handles all the DOM creation and rendering automatically. You can provide the component in two ways, but stories still need a `widget` object in `args` so the Merkur loader creates a widget instance:

1. Pass the component function directly in story args (no map needed), for example:
   ```js
   export default {
     args: {
       widget: {
         props: {},
       },
       component: Counter,
     },
   };
   ```
2. Or register the component in the `ViewComponent` map in `preview.mjs` and reference it by key in story args, for example:
   ```js
   // in preview.mjs
   const ViewComponent = {};
   createVanillaRenderer({
     // other options...
     ViewComponent,
   });
   ViewComponent.Counter = Counter;
   // or equivalently:
   // ViewComponent['Counter'] = Counter;
   // in your story
   export default {
     args: {
       widget: {
         props: {},
       },
       component: 'Counter',
     },
   };
   ```

#### Custom Render Functions

For stories that need custom logic (e.g., overriding specific widget properties), you can provide a custom render function:

```javascript
 const WidgetDescription = (widget) => `
   <div>
     <strong>${widget.name}</strong> – v${widget.version}
   </div>
 `;

export const CustomWidget = {
  render: (args, { loaded: { widget } }) => {
    const container = document.createElement('div');
    container.innerHTML = WidgetDescription({
      ...widget,
      name: args.name,
      version: args.version,
    });
    return container;
  },
  args: {
    name: 'my-custom-widget',
    version: '2.0.0',
  },
};
```

## Running Storybook

Start Storybook with:

```bash
npm run storybook
```

You will see your Counter component with different configurations in the Storybook UI. When you click buttons that modify the widget state, the component will automatically re-render thanks to the decorator's state management.

## How Widget State Updates Work

### Storybook Controls Panel

When you change a `state` or `props` value in the Storybook Controls panel, Storybook re-invokes the loader with the updated args. The loader **always creates a new widget instance** — it unmounts any widget from a previous story, then mounts a fresh one with the new `state`/`props` values. The story template receives the new widget instance and re-renders.

This means stories can expose initial counter values, labels, or any other state as Controls args and users will see the component update live as they adjust those values.

### Preact Widgets

The setup ensures that when widget state changes (e.g., clicking a button):

1. The widget's event handler (like `onClick`) updates the widget state
2. The widget's `update` lifecycle method is triggered
3. The `render()` callback in `preview.mjs` is called
4. This calls `widget.$in.storybook.forceUpdate()`, which was stored by the decorator's `useEffect`
5. Preact re-renders the story with the updated widget state

The `forceUpdate` dispatcher is stored on `widget.$in.storybook` (not directly on the sealed `widget` object) because `createMerkurWidget` calls `Object.seal(widget)` — adding new top-level properties after construction is not allowed. `widget.$in` is an existing unrestricted object, so it accepts new keys freely.

### Vanilla Widgets

For vanilla widgets with interactive elements:

1. The widget's event handler updates the widget state
2. The widget's `update` lifecycle method is triggered
3. The `render` callback passed to `createPreviewConfig` is called
4. `renderer.update(widget)` re-renders the container with updated HTML (the container is tracked in a `WeakMap` inside `createVanillaRenderer`, not on the sealed widget)
5. The `bindEvents` function re-attaches all event listeners
6. Optionally, `widget.$in.storybook.updateArgs(...)` pushes the new `state`/`props` back to the Storybook Controls panel

The `bindEvents` function is crucial for vanilla widgets as it reconnects event listeners after each re-render. The `widget.$in.storybook` mechanism (set up by the decorator) keeps the Controls panel values in sync when the widget state changes through internal interactions such as button clicks.

## Key Differences

- **Preact widgets**: 
  - Use `.jsx` extension and JSX syntax
  - Decorators provide context and handle re-rendering
  - Stories use CSF3 object format with a shared `render` function in the default export
  - Components receive individual props
  
- **Vanilla widgets**:
  - Use `.js` extension, components return HTML strings  
  - `createVanillaRenderer` handles rendering and re-rendering (container stored in a `WeakMap`)
  - Stories use simple CSF3 format with `component` in args
  - Components receive full widget object
  - Require `bindEvents` function for interactive elements
  - Use `widget.$in.storybook` (set by the decorator) to keep Controls panel in sync
  - Must use `class` not `className` in HTML strings
  
- **Framework config**: Preact uses `@storybook/preact-vite`, vanilla uses `@storybook/html-vite`
- **State management**: Both setups include automatic re-rendering on widget state updates
