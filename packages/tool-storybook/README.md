# Merkur - tool-storybook

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/tool-storybook/latest.svg)](https://www.npmjs.com/package/@merkur/tool-storybook)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/tool-storybook/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Integrates [Storybook](https://storybook.js.org/) with [Merkur](https://merkur.js.org/) widgets. The package handles the widget lifecycle (create → mount → unmount) inside the Storybook loader pipeline, so your story files stay focused on rendering.

**[Full documentation](https://merkur.js.org/docs/storybook-integration-into-merkur).**

## Installation

```bash
npm install --save-dev @merkur/tool-storybook
```

## API

### `createPreviewConfig(options)`

Registers a Merkur widget with Merkur's factory and returns a partial Storybook `preview.mjs` configuration (`{ loaders }`). Spread the result into your preview export.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `widgetProperties` | `Object` | ✅ | Widget definition object — must include `name` and `version`. |
| `render` | `Function` | — | Called each time the widget's update lifecycle fires, receives the widget instance. Defaults to a no-op. |
| `createWidget` | `Function` | — | Widget factory function. Defaults to `createMerkurWidget` from `@merkur/core`. |

### `createVanillaRenderer(options)`

Creates a `render` / `update` pair for vanilla JavaScript widgets that produce HTML strings. Pass `renderer.render` as the Storybook story `render` function and `renderer.update` as the `render` callback to `createPreviewConfig` so that widget state changes trigger DOM re-renders.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `ViewComponent` | `Function \| Object<string, Function>` | ✅ | A single view function `(widget) => htmlString`, or a named map where `"default"` is the fallback. Use `args.component` (a function or a string key) in story args to select a specific view. |
| `bindEvents` | `Function` | — | Called after every render: `(container, widget) => void`. Falls back to `widget.View.bindEvents` when omitted. |

### `createWidgetLoader(options)`

Low-level factory that returns a single Storybook loader function. `createPreviewConfig` uses this internally. Use it directly when you need full control over widget registration.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `widgetProperties` | `Object` | ✅ | Widget definition object — must include `name` and `version`. |
| `render` | `Function` | — | Render callback invoked on widget updates. Defaults to a no-op. |

---

## Setup — Preact

### `.storybook/main.mjs`

```javascript
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/preact-vite',
    options: {},
  },
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

### `.storybook/preview.mjs`

```javascript
import { createPreviewConfig } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';
import '../src/style.css';

const preview = {
  ...createPreviewConfig({
    widgetProperties,
  }),
};

export default preview;
```

### Story file

```jsx
import Counter from '../Counter';

export default {
  title: 'Components/Counter',
  args: {
    widget: { props: {} },
  },
};

const Template = (args, { loaded: { widget } }) => (
  <Counter counter={widget.state.counter} />
);

export const Default = Template.bind({});

export const TenCounter = Template.bind({});
TenCounter.args = {
  widget: {
    props: {},
    state: { counter: 10 },
  },
};
```

---

## Setup — Vanilla JS

### `.storybook/main.mjs`

```javascript
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
};

export default config;
```

### `.storybook/preview.mjs`

`createVanillaRenderer` maps widget instances to their DOM containers so `renderer.update(widget)` always targets the right element. Pass multiple view functions as a named map to support per-story view selection via `args.component`.

```javascript
import { createPreviewConfig, createVanillaRenderer } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';
import View from '../src/views/View.js';
import HeadlineSlot from '../src/slots/HeadlineSlot.js';
import Counter from '../src/components/Counter.js';
import '../src/style.css';

// Example bindEvents implementation for vanilla JS widgets. The function receives the widget's root container and the widget instance, and can add event listeners to trigger widget methods used in the view functions.
// This is necessary for interactivity since vanilla JS views are just HTML strings and cannot use logic from client.js defined in entries.
function bindEvents(container, widget) {
  container
    .querySelector('[data-merkur="on-increase"]')
    ?.addEventListener('click', () => widget.onClick(widget));

  container
    .querySelector('[data-merkur="on-reset"]')
    ?.addEventListener('click', () => widget.onReset(widget));
}

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
    render(widget) {
      renderer.update(widget);
    },
  }),
  render: renderer.render,
};

export default preview;
```

### Story file

Set `args.component` to choose which view function renders the story. Pass a string key matching a key in the `ViewComponent` map, or a function directly.

```javascript
import Counter from '../Counter';

export default {
  title: 'Components/Counter',
  args: {
    widget: { props: {} },
    component: Counter, // selects the Counter view function from the map
  },
};

export const Default = {};

export const TenCounter = {
  args: {
    widget: {
      props: {},
      state: { counter: 10 },
    },
  },
};
```

---

## About Merkur

[Merkur](https://merkur.js.org/) is a tiny extensible JavaScript library for front-end microservices. It supports server-side rendering out of the box and works with [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/), vanilla JS, and more.
