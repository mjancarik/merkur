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
      // by the decorator — this is not the same as widget.update().
      if (widget?.$in?._storybookForceUpdate) {
        widget.$in._storybookForceUpdate();
      }
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
        // Store the forceUpdate function on the widget so the render callback can trigger it
        widget.$in._storybookForceUpdate = () => forceUpdate((n) => n + 1);
        return () => {
          widget.$in._storybookForceUpdate = null;
        };
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

```javascript
import { createPreviewConfig, createVanillaRenderer } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';

const renderer = createVanillaRenderer({
  // ViewComponent can be a single function or a named map with a 'default' key.
  // Use args.component (function or string key) in stories to select a specific view.
  ViewComponent: {
    default: (widget) => `
      <div>
        <h3>Counter widget:</h3>
        <p>Count: <span data-merkur="counter">${widget.state.counter}</span></p>
        <button data-merkur="on-increase">increase counter</button>
        <button data-merkur="on-reset">reset counter</button>
      </div>
    `,
  },
  // Re-attach event listeners after every render
  bindEvents(container, widget) {
    container
      .querySelector('[data-merkur="on-increase"]')
      ?.addEventListener('click', widget.onClick);
    container
      .querySelector('[data-merkur="on-reset"]')
      ?.addEventListener('click', widget.onReset);
  },
});

const preview = {
  ...createPreviewConfig({
    widgetProperties,
    render: renderer.update, // called by the widget's update lifecycle on state/props change
  }),
  render: renderer.render, // Storybook story render function (args, { loaded }) => HTMLElement
};

export default preview;
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

When you change a `state` or `props` value in the Storybook Controls panel, Storybook re-invokes the loader with the updated args. The loader applies the new values directly to the widget instance, so the story template immediately receives the updated widget without remounting.

This means stories can expose initial counter values, labels, or any other state as Controls args and users will see the component update live as they adjust those values.

### Preact Widgets

The setup ensures that when widget state changes (e.g., clicking a button):

1. The widget's event handler (like `onClick`) updates the widget state
2. The widget's `update` lifecycle method is triggered
3. The `render()` callback in `preview.mjs` is called
4. This triggers the `forceUpdate` function stored by the decorator
5. Preact re-renders the story with the updated widget state

This provides a seamless experience where interactive components work correctly in Storybook.

### Vanilla Widgets

For vanilla widgets with interactive elements:

1. The widget's event handler updates the widget state
2. The widget's `update` lifecycle method is triggered
3. The `renderer.update()` callback (passed to `createPreviewConfig`) is called
4. `createVanillaRenderer` re-renders the container with updated HTML
5. The `bindEvents` function re-attaches all event listeners

The `bindEvents` function is crucial for vanilla widgets as it reconnects event listeners after each re-render.

## Key Differences

- **Preact widgets**: 
  - Use `.jsx` extension and JSX syntax
  - Decorators provide context and handle re-rendering
  - Stories use CSF3 object format with a shared `render` function in the default export
  - Components receive individual props
  
- **Vanilla widgets**:
  - Use `.js` extension, components return HTML strings  
  - `createVanillaRenderer` handles rendering and re-rendering
  - Stories use simple CSF3 format with `component` in args
  - Components receive full widget object
  - Require `bindEvents` function for interactive elements
  - Must use `class` not `className` in HTML strings
  
- **Framework config**: Preact uses `@storybook/preact-vite`, vanilla uses `@storybook/html-vite`
- **State management**: Both setups include automatic re-rendering on widget state updates
