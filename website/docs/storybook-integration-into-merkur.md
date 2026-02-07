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
import { h, render } from 'preact';
import { createPreviewConfig } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';
import View from '../src/views/View.jsx';
import HeadlineSlot from '../src/slots/HeadlineSlot.jsx';

// Create preview configuration with Merkur widget support
const preview = {
    ...createPreviewConfig({
        widgetProperties,
    }),
    // Preact render function
    render: (args, { loaded: { widget }, viewMode }) => {
        if (!widget) {
            return document.createElement('div');
        }

        const container = document.createElement('div');
        const ViewComponent = args.viewComponent === 'headline' ? HeadlineSlot : View;
        render(h(ViewComponent, widget), container);

        return container;
    },
};

export default preview;
```

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
import { createPreviewConfig } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';
import View from '../src/views/View.js';
import HeadlineSlot from '../src/slots/HeadlineSlot.js';

// Create preview configuration with Merkur widget support
const preview = {
    ...createPreviewConfig({
        widgetProperties,
    }),
    // Vanilla JS render function
    render: (args, { loaded: { widget } }) => {
        if (!widget) {
            return document.createElement('div');
        }

        const container = document.createElement('div');
        const viewFunction = args.viewComponent === 'headline' ? HeadlineSlot : View;
        container.innerHTML = viewFunction(widget);
        
        return container;
    },
};

export default preview;
```

## Writing Stories

You can use any [story format](https://storybook.js.org/docs/react/writing-stories/introduction) that Storybook supports. Below are examples for both Preact and vanilla widgets.

### Preact Widget Stories

For Preact components that use context, wrap them in the appropriate provider:

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
import WidgetContext from '../WidgetContext';

export default {
  title: 'Counter',
  args: {
    // Every Merkur story must have defined props property
    widget: {
      props: {},
    },
  },
};

const Template = (args, { loaded: { widget } }) => {
  return (
    <WidgetContext.Provider value={widget}>
      <Counter counter={widget.state.counter} />
    </WidgetContext.Provider>
  );
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

```javascript
// /src/components/__tests__/Counter.stories.js
import Counter from '../Counter';

export default {
  title: 'Counter',
  args: {
    // Every Merkur story must have defined props property
    widget: {
      props: {},
    },
  },
};

const Template = (args, { loaded: { widget } }) => {
  const container = document.createElement('div');
  container.innerHTML = Counter(widget);
  return container;
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

## Running Storybook

Start Storybook with:

```bash
npm run storybook
```

You will see your Counter component with different configurations in the Storybook UI.

## Key Differences

- **Preact widgets**: Use `.jsx` extension, JSX syntax, and component-based rendering with `render(h(Component, props), container)`
- **Vanilla widgets**: Use `.js` extension, return HTML strings, and render with `container.innerHTML = componentFunction(widget)`
- **Framework config**: Preact uses `@storybook/preact-vite`, vanilla uses `@storybook/html-vite`
