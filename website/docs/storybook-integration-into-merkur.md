---
sidebar_position: 19
title: Storybook Integration
description: Learn how to integrate Storybook with your Merkur widget
---

# Storybook

[Storybook](https://storybook.js.org/) is an open source tool for developing UI components in isolation for React, Vue, Angular, and more. It makes building stunning UIs organized and efficient.

This guide requires Storybook version 9 or higher. Lower versions need a different setup, which is covered in previous versions of the documentation.

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
  // Configure Vite to transform JSX to Preact's `h` function instead of React's `React.createElement`
  // This automatically injects Preact imports so you don't need to import h and Fragment in every file
  async viteFinal(config) {
    config.esbuild = {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      jsxInject: `import { h, Fragment } from 'preact'`,
    };
    return config;
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
      // This is called by the widget's update lifecycle
      // Trigger the forceUpdate stored on the widget by the decorator
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
      }
    }, [widget]);

    return h(WidgetContext.Provider, { value: widget }, h(Story));
  },
];
```

Note: The `h` and `Fragment` functions are automatically injected by the Vite configuration in `main.mjs`, so you don't need to import them in `.jsx` files.

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
import {
  createPreviewConfig,
  createVanillaRenderer,
} from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';
import View from '../src/views/View.js';
import HeadlineSlot from '../src/slots/HeadlineSlot.js';
import Counter from '../src/components/Counter.js';
import '../src/style.css';

// Event binding function for interactive components
function bindEvents(container, widget) {
  container
    .querySelector(`[data-merkur="on-increase"]`)
    ?.addEventListener('click', () => widget.onClick(widget));

  container
    .querySelector(`[data-merkur="on-reset"]`)
    ?.addEventListener('click', () => widget.onReset(widget));
}

// Create renderer with component map and event binding
const renderer = createVanillaRenderer({
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
    render: renderer.update,
  }),
  render: renderer.render,
};

export default preview;
```

The `createVanillaRenderer` utility:
- Accepts a `ViewComponent` map of all your components (functions that return HTML strings)
- Optionally accepts a `bindEvents` function to attach event listeners after rendering
- Returns `{render, update}` object where:
  - `render`: Main render function for initial story rendering
  - `update`: Callback for widget lifecycle updates (passed to `createPreviewConfig`)
- Automatically handles component selection via `args.component` or `args.viewComponent`
- Manages re-rendering when widget state changes

**Important:** Make sure to import your widget's CSS file (e.g., `import '../src/style.css'`) at the top of `preview.mjs` so all stories are properly styled. This ensures styles are loaded before any component renders.

## Writing Stories

You can use any [story format](https://storybook.js.org/docs/react/writing-stories/introduction) that Storybook supports. Below are examples for both Preact and vanilla widgets.

### Preact Widget Stories

For Preact components that use context, the decorator in `preview.mjs` automatically provides the `WidgetContext`, so you don't need to wrap components manually in each story:

```jsx
// /src/components/Counter.jsx
import { useContext } from 'preact/hooks';
import WidgetContext from './WidgetContext';

export default function Counter({ counter }) {
  const widget = useContext(WidgetContext);

  return (
    <div>
      <h3>Counter widget:</h3>
      <p>Count: {counter}</p>
      <button onClick={widget.onClick}>increase counter</button>
      <button onClick={widget.onReset}>reset counter</button>
    </div>
  );
}
```

```jsx
// /src/components/__tests__/Counter.stories.jsx
import Counter from '../Counter';

export default {
  title: 'Components/Counter',
  args: {
    // Every Merkur story must have defined props property
    widget: {
      props: {},
    },
  },
};

const Template = (args, { loaded: { widget } }) => {
  return <Counter counter={widget.state.counter} />;
};

export const DefaultCounter = Template.bind({});

export const TenCounter = Template.bind({});
TenCounter.args = {
  widget: {
    props: {},
    // change default widget state from 0 to 10
    state: {
      counter: 10,
    },
  },
};
```

The decorator handles:
- Providing `WidgetContext` to all components
- Re-rendering when widget state changes (e.g., when clicking buttons)
- Proper cleanup between story navigation

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
// /src/components/__tests__/Counter.stories.js
import Counter from '../Counter';

export default {
  title: 'Components/Counter',
  args: {
    // Every Merkur story must have defined props property
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
      props: {},
      // change default widget state from 0 to 10
      state: {
        counter: 10,
      },
    },
  },
};
```

The `createVanillaRenderer` in `preview.mjs` handles all the DOM creation and rendering automatically. You just need to:
1. Import your component
2. Add it to the `ViewComponent` map in `preview.mjs`
3. Specify `component: YourComponent` in story args

#### Custom Render Functions

For stories that need custom logic (e.g., overriding specific widget properties), you can provide a custom render function:

```javascript
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
  - Stories use CSF3 format with `Template.bind({})`
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
